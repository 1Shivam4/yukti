import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { prisma } from "@yukti/database";
import { authorizeRequest } from "../../utils/auth";
import { ResumeSchema } from "@yukti/shared";

// Standard headers for all responses
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

/**
 * Look up internal user ID from Cognito ID
 */
async function getInternalUserId(cognitoId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { cognitoId },
    select: { id: true },
  });
  return user?.id || null;
}

/**
 * Get all resumes for authenticated user
 */
async function getResumes(userId: string): Promise<APIGatewayProxyResult> {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      include: {
        snapshots: {
          orderBy: { version: "desc" },
          take: 1, // Get latest version only
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ resumes }),
    };
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch resumes" }),
    };
  }
}

/**
 * Get a single resume by ID
 */
async function getResumeById(userId: string, resumeId: string): Promise<APIGatewayProxyResult> {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      include: {
        snapshots: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!resume) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Resume not found" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ resume }),
    };
  } catch (error) {
    console.error("Error fetching resume:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch resume" }),
    };
  }
}

/**
 * Create new resume
 */
async function createResume(
  userId: string,
  body: Record<string, unknown>
): Promise<APIGatewayProxyResult> {
  try {
    const { title, content } = body;

    // Validate resume content with Zod
    const validatedContent = ResumeSchema.parse(content);

    const resume = await prisma.resume.create({
      data: {
        userId,
        title: (title as string) || "Untitled Resume",
        snapshots: {
          create: {
            version: 1,
            content: validatedContent,
          },
        },
      },
      include: {
        snapshots: true,
      },
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ resume }),
    };
  } catch (error) {
    console.error("Error creating resume:", error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Failed to create resume",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
}

/**
 * Update resume (creates new snapshot)
 */
async function updateResume(
  userId: string,
  resumeId: string,
  body: Record<string, unknown>
): Promise<APIGatewayProxyResult> {
  try {
    // Verify ownership
    const existingResume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      include: {
        snapshots: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!existingResume) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Resume not found" }),
      };
    }

    const { title, content } = body;
    const nextVersion = (existingResume.snapshots[0]?.version || 0) + 1;

    // Validate content
    const validatedContent = ResumeSchema.parse(content);

    // Update resume and create new snapshot
    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        title: (title as string) || existingResume.title,
        snapshots: {
          create: {
            version: nextVersion,
            content: validatedContent,
          },
        },
      },
      include: {
        snapshots: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ resume: updatedResume }),
    };
  } catch (error) {
    console.error("Error updating resume:", error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Failed to update resume",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
}

/**
 * Delete resume
 */
async function deleteResume(userId: string, resumeId: string): Promise<APIGatewayProxyResult> {
  try {
    // Verify ownership
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Resume not found" }),
      };
    }

    await prisma.resume.delete({
      where: { id: resumeId },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Resume deleted successfully" }),
    };
  } catch (error) {
    console.error("Error deleting resume:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to delete resume" }),
    };
  }
}

/**
 * Main handler for resume endpoints
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Resumes function called:", event.httpMethod, event.path);

  // Authorize request
  const auth = await authorizeRequest(event.headers.Authorization || event.headers.authorization);

  if (!auth.isAuthorized || !auth.userId) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: auth.error || "Unauthorized" }),
    };
  }

  // Convert Cognito ID to internal user ID
  const userId = await getInternalUserId(auth.userId);
  if (!userId) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: "User not found in database" }),
    };
  }

  const resumeId = event.pathParameters?.id;
  const body = event.body ? JSON.parse(event.body) : {};

  // Route based on HTTP method and path
  switch (event.httpMethod) {
    case "GET":
      return resumeId ? getResumeById(userId, resumeId) : getResumes(userId);

    case "POST":
      return createResume(userId, body);

    case "PUT":
    case "PATCH":
      if (!resumeId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Resume ID required" }),
        };
      }
      return updateResume(userId, resumeId, body);

    case "DELETE":
      if (!resumeId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Resume ID required" }),
        };
      }
      return deleteResume(userId, resumeId);

    default:
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
  }
};
