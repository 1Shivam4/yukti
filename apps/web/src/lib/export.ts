/**
 * Client-Side Export Utilities
 * Handles PDF, DOCX, and HTML export entirely in the browser
 * Server only stores text data, no file generation server-side
 */

import type { Resume, CoverLetter } from "@yukti/shared";

// Dynamic imports for heavy libraries (code-splitting)
async function loadHtml2Canvas() {
  const module = await import("html2canvas");
  return module.default;
}

async function loadJsPDF() {
  const { jsPDF } = await import("jspdf");
  return jsPDF;
}

async function loadDocx() {
  return await import("docx");
}

/**
 * Export resume/cover letter to PDF
 * Uses html2canvas to capture the rendered template and jsPDF to create PDF
 */
export async function exportToPdf(
  elementId: string,
  filename: string = "resume.pdf"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const html2canvas = await loadHtml2Canvas();
  const jsPDF = await loadJsPDF();

  // Capture the element as canvas
  const canvas = await html2canvas(element, {
    scale: 2, // Higher quality
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  // A4 dimensions in mm
  const a4Width = 210;
  const a4Height = 297;

  // Calculate dimensions maintaining aspect ratio
  const imgWidth = a4Width;
  const imgHeight = (canvas.height * a4Width) / canvas.width;

  // Create PDF
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const imgData = canvas.toDataURL("image/png");

  // Handle multi-page if content is longer than one page
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= a4Height;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= a4Height;
  }

  pdf.save(filename);
}

/**
 * Export resume to DOCX format
 * Uses the docx library to create Word documents
 */
export async function exportToDocx(
  resume: Resume,
  filename: string = "resume.docx"
): Promise<void> {
  const docx = await loadDocx();
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;

  // Build document sections
  const children: InstanceType<typeof Paragraph>[] = [];

  // Header - Name
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: resume.basics.name,
          bold: true,
          size: 48, // 24pt
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // Header - Title/Label
  if (resume.basics.label) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resume.basics.label,
            size: 24, // 12pt
            color: "666666",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }

  // Contact info
  const contactParts = [
    resume.basics.email,
    resume.basics.phone,
    resume.basics.location?.city,
    resume.basics.url,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join(" | "),
            size: 20, // 10pt
            color: "666666",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        border: {
          bottom: { color: "CCCCCC", style: BorderStyle.SINGLE, size: 6 },
        },
      })
    );
  }

  // Summary
  if (resume.basics.summary) {
    children.push(
      new Paragraph({
        text: "PROFESSIONAL SUMMARY",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );
    children.push(
      new Paragraph({
        text: resume.basics.summary,
        spacing: { after: 200 },
      })
    );
  }

  // Work Experience
  if (resume.work.length > 0) {
    children.push(
      new Paragraph({
        text: "EXPERIENCE",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );

    for (const job of resume.work) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: job.position, bold: true }),
            new TextRun({ text: ` at ${job.name}` }),
            new TextRun({
              text: `  (${job.startDate} — ${job.endDate || "Present"})`,
              color: "666666",
              size: 20,
            }),
          ],
          spacing: { before: 150, after: 50 },
        })
      );

      for (const highlight of job.highlights) {
        if (highlight) {
          children.push(
            new Paragraph({
              text: `• ${highlight}`,
              spacing: { after: 50 },
              indent: { left: 360 }, // 0.25 inch
            })
          );
        }
      }
    }
  }

  // Education
  if (resume.education.length > 0) {
    children.push(
      new Paragraph({
        text: "EDUCATION",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );

    for (const edu of resume.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.studyType} in ${edu.area}`, bold: true }),
            new TextRun({ text: ` — ${edu.institution}` }),
            new TextRun({
              text: `  (${edu.endDate || edu.startDate})`,
              color: "666666",
              size: 20,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }
  }

  // Skills
  if (resume.skills.length > 0) {
    children.push(
      new Paragraph({
        text: "SKILLS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );

    const skillsText = resume.skills
      .map((skill) => {
        if (skill.keywords.length > 0) {
          return `${skill.name}: ${skill.keywords.join(", ")}`;
        }
        return skill.name;
      })
      .join(" | ");

    children.push(
      new Paragraph({
        text: skillsText,
        spacing: { after: 100 },
      })
    );
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children,
      },
    ],
  });

  // Generate and download
  const buffer = await Packer.toBlob(doc);
  downloadBlob(buffer, filename);
}

/**
 * Export to HTML file
 */
export async function exportToHtml(
  elementId: string,
  filename: string = "resume.html"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Get all stylesheets
  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume</title>
  <style>${styles}</style>
</head>
<body>
  ${element.outerHTML}
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html" });
  downloadBlob(blob, filename);
}

/**
 * Export resume data as JSON (JSON Resume format)
 */
export function exportToJson(resume: Resume, filename: string = "resume.json"): void {
  const blob = new Blob([JSON.stringify(resume, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, filename);
}

/**
 * Helper to download a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
