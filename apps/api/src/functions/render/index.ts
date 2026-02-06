import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { authorizeRequest } from "../../utils/auth";
import { prisma } from "@yukti/database";
import type { Resume } from "@yukti/shared";

/**
 * Generate HTML from resume data
 */
function generateResumeHTML(resume: Resume): string {
  const { basics, work, education, skills, projects } = resume;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${basics.name || "Resume"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #333;
      padding: 0.5in;
      max-width: 8.5in;
    }
    h1 { font-size: 24pt; margin-bottom: 4pt; }
    h2 { font-size: 12pt; border-bottom: 1px solid #333; padding-bottom: 2pt; margin: 16pt 0 8pt; text-transform: uppercase; }
    h3 { font-size: 11pt; margin-bottom: 2pt; }
    .header { text-align: center; margin-bottom: 16pt; }
    .contact { font-size: 10pt; color: #666; }
    .section { margin-bottom: 12pt; }
    .entry { margin-bottom: 10pt; }
    .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-title { font-weight: bold; }
    .entry-subtitle { font-style: italic; color: #555; }
    .entry-date { font-size: 10pt; color: #666; }
    ul { margin-left: 20pt; margin-top: 4pt; }
    li { margin-bottom: 2pt; }
    .skills { display: flex; flex-wrap: wrap; gap: 8pt; }
    .skill-tag { background: #f0f0f0; padding: 2pt 8pt; border-radius: 3pt; font-size: 10pt; }
  </style>
</head>
<body>
  <header class="header">
    <h1>${basics.name || "Your Name"}</h1>
    ${basics.label ? `<p style="font-size: 14pt; color: #555;">${basics.label}</p>` : ""}
    <p class="contact">
      ${[basics.email, basics.phone, basics.location?.city, basics.url].filter(Boolean).join(" • ")}
    </p>
  </header>

  ${
    basics.summary
      ? `
  <section class="section">
    <h2>Professional Summary</h2>
    <p>${basics.summary}</p>
  </section>
  `
      : ""
  }

  ${
    work.length > 0
      ? `
  <section class="section">
    <h2>Experience</h2>
    ${work
      .map(
        (job) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <span class="entry-title">${job.position}</span>
          <span class="entry-subtitle"> — ${job.name}</span>
        </div>
        <span class="entry-date">${job.startDate} — ${job.endDate || "Present"}</span>
      </div>
      ${
        job.highlights.length > 0
          ? `
      <ul>
        ${job.highlights
          .filter((h) => h)
          .map((h) => `<li>${h}</li>`)
          .join("")}
      </ul>
      `
          : ""
      }
    </div>
    `
      )
      .join("")}
  </section>
  `
      : ""
  }

  ${
    education.length > 0
      ? `
  <section class="section">
    <h2>Education</h2>
    ${education
      .map(
        (edu) => `
    <div class="entry">
      <div class="entry-header">
        <div>
          <span class="entry-title">${edu.studyType} in ${edu.area}</span>
          <span class="entry-subtitle"> — ${edu.institution}</span>
        </div>
        <span class="entry-date">${edu.startDate} — ${edu.endDate || "Present"}</span>
      </div>
    </div>
    `
      )
      .join("")}
  </section>
  `
      : ""
  }

  ${
    skills.length > 0
      ? `
  <section class="section">
    <h2>Skills</h2>
    <div class="skills">
      ${skills
        .map(
          (skill) => `
        <span class="skill-tag">${skill.name}${skill.keywords.length > 0 ? `: ${skill.keywords.join(", ")}` : ""}</span>
      `
        )
        .join("")}
    </div>
  </section>
  `
      : ""
  }

  ${
    projects && projects.length > 0
      ? `
  <section class="section">
    <h2>Projects</h2>
    ${projects
      .map(
        (project) => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${project.name}</span>
        ${project.url ? `<a href="${project.url}" style="font-size: 10pt; color: #0066cc;">${project.url}</a>` : ""}
      </div>
      ${project.description ? `<p style="margin-top: 4pt;">${project.description}</p>` : ""}
    </div>
    `
      )
      .join("")}
  </section>
  `
      : ""
  }
</body>
</html>
  `.trim();
}

/**
 * Render resume as PDF (returns base64 encoded PDF)
 * Note: In production, use Puppeteer in Lambda layer or external service
 */
async function renderPDF(userId: string, resumeId: string): Promise<APIGatewayProxyResult> {
  try {
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

    const content = resume.snapshots[0].content as Resume;
    const html = generateResumeHTML(content);

    // For MVP, return HTML that client can print to PDF
    // In production, use Puppeteer Lambda Layer or external PDF service
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*",
      },
      body: html,
    };
  } catch (error) {
    console.error("Error rendering PDF:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to render PDF",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
}

/**
 * Get resume as JSON for DOCX generation on client
 */
async function getResumeForExport(
  userId: string,
  resumeId: string
): Promise<APIGatewayProxyResult> {
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

    if (!resume || !resume.snapshots[0]) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Resume not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        title: resume.title,
        content: resume.snapshots[0].content,
      }),
    };
  } catch (error) {
    console.error("Error fetching resume for export:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch resume" }),
    };
  }
}

/**
 * Main render handler
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Render function called:", event.httpMethod, event.path);

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
  const resumeId = event.pathParameters?.id;

  if (!resumeId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Resume ID required" }),
    };
  }

  // Route based on path
  if (event.path.includes("/pdf")) {
    return renderPDF(userId, resumeId);
  }

  if (event.path.includes("/json")) {
    return getResumeForExport(userId, resumeId);
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
