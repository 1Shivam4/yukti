"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useResumeStore } from "@/stores/resumeStore";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api-client";
import BasicsForm from "@/components/editor/BasicsForm";
import WorkForm from "@/components/editor/WorkForm";
import { TemplateRenderer } from "@/templates";
import AIPanel from "@/components/editor/AIPanel";
import ExportPanel from "@/components/editor/ExportPanel";
import {
  ArrowLeft,
  Save,
  Download,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
} from "lucide-react";

type EditorTab = "basics" | "work" | "education" | "skills";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { resume, setResume, setResumeId, isDirty, isSaving, setSaving, markSaved } =
    useResumeStore();
  const [activeTab, setActiveTab] = useState<EditorTab>("basics");
  const [title, setTitle] = useState("");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);

  const resumeId = params.id as string;

  useEffect(() => {
    if (resumeId) {
      fetchResume();
      setResumeId(resumeId);
    }
  }, [resumeId]);

  async function fetchResume() {
    try {
      const response = await apiClient.get(`/resumes/${resumeId}`);
      const data = response.data.resume;
      setTitle(data.title);
      if (data.snapshots?.[0]?.content) {
        setResume(data.snapshots[0].content);
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
    }
  }

  const saveResume = useCallback(async () => {
    if (!resume || isSaving) return;
    setSaving(true);
    try {
      await apiClient.put(`/resumes/${resumeId}`, {
        title,
        content: resume,
      });
      markSaved();
    } catch (error) {
      console.error("Error saving resume:", error);
    } finally {
      setSaving(false);
    }
  }, [resume, resumeId, title, isSaving]);

  // Auto-save every 30 seconds if dirty
  useEffect(() => {
    if (!isDirty) return;
    const timeout = setTimeout(() => {
      saveResume();
    }, 30000);
    return () => clearTimeout(timeout);
  }, [isDirty, saveResume]);

  const tabs = [
    { id: "basics" as EditorTab, label: "Basics", icon: User },
    { id: "work" as EditorTab, label: "Work", icon: Briefcase },
    { id: "education" as EditorTab, label: "Education", icon: GraduationCap },
    { id: "skills" as EditorTab, label: "Skills", icon: Wrench },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
            placeholder="Resume Title"
          />
          {isDirty && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAIPanel(true)}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
          >
            <Sparkles className="w-4 h-4" />
            AI Assist
          </button>
          <button
            onClick={() => setShowExportPanel(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={saveResume}
            disabled={isSaving || !isDirty}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-1/2 flex flex-col bg-white border-r border-gray-200">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition
                  ${
                    activeTab === tab.id
                      ? "text-indigo-600 border-b-4 border-indigo-600 bg-indigo-50/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === "basics" && <BasicsForm />}
            {activeTab === "work" && <WorkForm />}
            {activeTab === "education" && (
              <div className="text-center text-gray-500 py-12">Education form coming soon...</div>
            )}
            {activeTab === "skills" && (
              <div className="text-center text-gray-500 py-12">Skills form coming soon...</div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 overflow-y-auto bg-slate-50 p-8">
          <div className="max-w-[8.5in] mx-auto shadow-lg border border-gray-200/50 rounded-sm overflow-hidden">
            <TemplateRenderer resume={resume} templateId={resume.meta?.templateId} scale={0.75} />
          </div>
        </div>
      </div>

      {/* AI Panel */}
      <AIPanel isOpen={showAIPanel} onClose={() => setShowAIPanel(false)} resumeId={resumeId} />

      {/* Export Panel */}
      <ExportPanel
        isOpen={showExportPanel}
        onClose={() => setShowExportPanel(false)}
        resumeId={resumeId}
      />
    </div>
  );
}
