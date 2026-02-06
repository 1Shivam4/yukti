import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { google } from "@ai-sdk/google";
import { generateText, streamText } from "ai";
import { authorizeRequest } from "../../utils/auth";
import { prisma } from "@yukti/database";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

/**
 * Generate resume content based on user input
 */
async function generateResumeContent(
  userId: string,
  body: Record<string, any>
): Promise<APIGatewayProxyResult> {
  try {
    const { prompt, context, resumeId } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt is required" }),
      };
    }

    // Fetch user's existing resume if resumeId provided
    let existingContent = null;
    if (resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
        include: {
          snapshots: {
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      });

      if (resume && resume.snapshots[0]) {
        existingContent = resume.snapshots[0].content;
      }
    }

    // Build system prompt
    const systemPrompt = `You are an expert resume writer. Your task is to help users create professional, ATS-friendly resumes in JSON Resume format.

Guidelines:
- Be concise and impactful
- Use action verbs and quantifiable achievements
- Focus on relevance to target role
- Follow ATS best practices
- Output valid JSON matching the JSON Resume schema

${existingContent ? `Current resume:\n${JSON.stringify(existingContent, null, 2)}` : ""}
${context ? `Additional context:\n${context}` : ""}`;

    // Generate content using Gemini
    const result = await generateText({
      model: google("gemini-1.5-flash"),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        content: result.text,
        usage: result.usage,
      }),
    };
  } catch (error) {
    console.error("Error generating resume content:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to generate content",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
}

/**
 * Improve existing resume section
 */
async function improveSection(
  userId: string,
  body: Record<string, any>
): Promise<APIGatewayProxyResult> {
  try {
    const { section, content, instructions } = body;

    if (!section || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Section and content are required" }),
      };
    }

    const prompt = `Improve the following ${section} section of a resume:

${JSON.stringify(content, null, 2)}

${instructions ? `Specific instructions: ${instructions}` : "Make it more impactful, concise, and ATS-friendly."}

Return the improved version in the same JSON format.`;

    const result = await generateText({
      model: google("gemini-1.5-flash"),
      messages: [
        {
          role: "system",
          content:
            "You are an expert resume optimizer. Improve resume sections while maintaining JSON structure and professional tone.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      maxTokens: 1000,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        improved: result.text,
        usage: result.usage,
      }),
    };
  } catch (error) {
    console.error("Error improving section:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to improve section",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
}

/**
 * Analyze resume and provide suggestions
 */
async function analyzeResume(
  userId: string,
  body: Record<string, any>
): Promise<APIGatewayProxyResult> {
  try {
    const { resumeId, targetRole } = body;

    if (!resumeId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Resume ID is required" }),
      };
    }

    // Fetch resume
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      include: {
        snapshots: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    if (!resume || !resume.snapshots[0]) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Resume not found" }),
      };
    }

    const prompt = `Analyze this resume and provide actionable suggestions for improvement:

${JSON.stringify(resume.snapshots[0].content, null, 2)}

${targetRole ? `Target role: ${targetRole}` : ""}

Provide:
1. Overall strengths
2. Areas for improvement
3. ATS optimization tips
4. Specific recommendations

Format as a structured JSON response.`;

    const result = await generateText({
      model: google("gemini-1.5-pro"),
      messages: [
        {
          role: "system",
          content:
            "You are a professional career coach and resume expert. Provide detailed, actionable feedback.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 1500,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        analysis: result.text,
        usage: result.usage,
      }),
    };
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to analyze resume",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
}

/**
 * Main AI handler - routes to appropriate function
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("AI function called:", event.httpMethod, event.path);

  // Authorize request
  const auth = await authorizeRequest(event.headers.Authorization || event.headers.authorization);

  if (!auth.isAuthorized || !auth.userId) {
    return {
      statusCode: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: auth.error || "Unauthorized" }),
    };
  }

  const { userId } = auth;
  const body = event.body ? JSON.parse(event.body) : {};

  // Route based on path
  if (event.path.includes("/generate") && event.httpMethod === "POST") {
    return generateResumeContent(userId, body);
  }

  if (event.path.includes("/improve") && event.httpMethod === "POST") {
    return improveSection(userId, body);
  }

  if (event.path.includes("/analyze") && event.httpMethod === "POST") {
    return analyzeResume(userId, body);
  }

  return {
    statusCode: 404,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      error: "Not found",
      path: event.path,
    }),
  };
};
