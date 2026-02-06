"use client";

import { useState } from "react";
import { Download, FileText, File, Loader2, X } from "lucide-react";
import apiClient from "@/lib/api-client";

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
}

export default function ExportPanel({ isOpen, onClose, resumeId }: ExportPanelProps) {
  const [loading, setLoading] = useState<"pdf" | "docx" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePDFExport = async () => {
    setLoading("pdf");
    setError(null);

    try {
      const response = await apiClient.get(`/api/render/${resumeId}/pdf`, {
        responseType: "text",
      });

      // Open HTML in new window for print-to-PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(response.data);
        printWindow.document.close();
        printWindow.focus();
        // Trigger print dialog after a short delay
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } catch (err) {
      setError("Failed to generate PDF. Please try again.");
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleDOCXExport = async () => {
    setLoading("docx");
    setError(null);

    try {
      // Fetch resume data
      const response = await apiClient.get(`/api/render/${resumeId}/json`);
      const { title, content } = response.data;

      // Generate DOCX using docx library (client-side)
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } =
        await import("docx");

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Name
              new Paragraph({
                text: content.basics?.name || "Your Name",
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
              }),
              // Label
              content.basics?.label
                ? new Paragraph({
                    text: content.basics.label,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                  })
                : new Paragraph({ text: "" }),
              // Contact info
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
                children: [
                  new TextRun({
                    text: [
                      content.basics?.email,
                      content.basics?.phone,
                      content.basics?.location?.city,
                    ]
                      .filter(Boolean)
                      .join(" • "),
                    size: 20,
                    color: "666666",
                  }),
                ],
              }),
              // Summary
              ...(content.basics?.summary
                ? [
                    new Paragraph({
                      text: "PROFESSIONAL SUMMARY",
                      heading: HeadingLevel.HEADING_2,
                      spacing: { before: 400, after: 200 },
                    }),
                    new Paragraph({
                      text: content.basics.summary,
                      spacing: { after: 200 },
                    }),
                  ]
                : []),
              // Work Experience
              ...(content.work?.length > 0
                ? [
                    new Paragraph({
                      text: "EXPERIENCE",
                      heading: HeadingLevel.HEADING_2,
                      spacing: { before: 400, after: 200 },
                    }),
                    ...content.work.flatMap((job: any) => [
                      new Paragraph({
                        children: [
                          new TextRun({ text: job.position, bold: true }),
                          new TextRun({ text: ` — ${job.name}` }),
                        ],
                      }),
                      new Paragraph({
                        text: `${job.startDate} — ${job.endDate || "Present"}`,
                        spacing: { after: 100 },
                        children: [
                          new TextRun({
                            text: `${job.startDate} — ${job.endDate || "Present"}`,
                            size: 20,
                            color: "666666",
                          }),
                        ],
                      }),
                      ...job.highlights
                        .filter((h: string) => h)
                        .map(
                          (h: string) =>
                            new Paragraph({
                              text: `• ${h}`,
                              spacing: { after: 50 },
                            })
                        ),
                    ]),
                  ]
                : []),
              // Skills
              ...(content.skills?.length > 0
                ? [
                    new Paragraph({
                      text: "SKILLS",
                      heading: HeadingLevel.HEADING_2,
                      spacing: { before: 400, after: 200 },
                    }),
                    new Paragraph({
                      text: content.skills
                        .map((s: any) =>
                          s.keywords?.length > 0 ? `${s.name}: ${s.keywords.join(", ")}` : s.name
                        )
                        .join(" • "),
                    }),
                  ]
                : []),
            ],
          },
        ],
      });

      // Generate and download
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "resume"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to generate DOCX. Please try again.");
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">Export Resume</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <button
            onClick={handlePDFExport}
            disabled={loading !== null}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <div className="p-3 bg-red-100 rounded-lg">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-900">PDF Document</h3>
              <p className="text-sm text-gray-500">Best for job applications</p>
            </div>
            {loading === "pdf" && <Loader2 className="w-5 h-5 animate-spin" />}
          </button>

          <button
            onClick={handleDOCXExport}
            disabled={loading !== null}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            <div className="p-3 bg-blue-100 rounded-lg">
              <File className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-medium text-gray-900">Word Document (.docx)</h3>
              <p className="text-sm text-gray-500">Editable format</p>
            </div>
            {loading === "docx" && <Loader2 className="w-5 h-5 animate-spin" />}
          </button>
        </div>

        {/* Error */}
        {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {/* Info */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          PDF uses browser print dialog. Save as PDF for best quality.
        </p>
      </div>
    </div>
  );
}
