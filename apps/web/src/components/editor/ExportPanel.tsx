"use client";

import { useState } from "react";
import { Download, FileText, File, Loader2, X } from "lucide-react";
import { exportToDocx } from "@/lib/export";
import { exportToPdfPrint } from "@/lib/export-print";
import { useResumeStore } from "@/stores/resumeStore";

interface ExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
}

export default function ExportPanel({ isOpen, onClose, resumeId }: ExportPanelProps) {
  const [loading, setLoading] = useState<"pdf" | "docx" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { resume } = useResumeStore();

  if (!isOpen) return null;

  const handlePDFExport = async () => {
    setLoading("pdf");
    setError(null);

    try {
      // Export using browser's print dialog for smart page breaks
      await exportToPdfPrint("resume-preview", `resume-${resumeId}.pdf`);
      // Close the panel after opening print window
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setError("Failed to open print window. Please allow popups for this site.");
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleDOCXExport = async () => {
    setLoading("docx");
    setError(null);

    try {
      if (!resume) {
        throw new Error("No resume data available");
      }

      // Export resume data to DOCX
      await exportToDocx(resume, `resume-${resumeId}.docx`);
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
              <p className="text-sm text-gray-500">Opens print dialog - smart page breaks</p>
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
          PDF: Use browser&apos;s print dialog (File → Save as PDF) for best quality and smart page
          breaks.
        </p>
      </div>
    </div>
  );
}
