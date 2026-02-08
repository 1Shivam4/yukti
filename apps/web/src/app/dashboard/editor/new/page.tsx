/**
 * New Resume Editor Page
 * Handles creating a new resume with a selected template
 */

"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResumeStore } from "@/stores/resumeStore";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api-client";
import BasicsForm from "@/components/editor/BasicsForm";
import WorkForm from "@/components/editor/WorkForm";
import { TemplateRenderer } from "@/templates";
import { getTemplateById, RESUME_TEMPLATES } from "@/templates/registry";
import FontSelector from "@/components/templates/FontSelector";
import TemplateSwitcher from "@/components/templates/TemplateSwitcher";
import type { FontFamily } from "@yukti/shared";
import {
  ArrowLeft,
  Save,
  Download,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderOpen,
  Award,
  Languages,
} from "lucide-react";

type EditorTab = "basics" | "work" | "education" | "skills" | "projects" | "certifications";

function NewEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { resume, setResume, updateMeta, isDirty, isSaving, setSaving, markSaved } =
    useResumeStore();

  const [activeTab, setActiveTab] = useState<EditorTab>("basics");
  const [title, setTitle] = useState("Untitled Resume");
  const [templateId, setTemplateId] = useState<string>("general-senior-professional");
  const [fontFamily, setFontFamily] = useState<FontFamily>("Inter");
  const [isCreating, setIsCreating] = useState(false);

  // Get template from URL params
  useEffect(() => {
    const urlTemplateId = searchParams.get("templateId");
    if (urlTemplateId) {
      setTemplateId(urlTemplateId);
      // Set default font from template
      const template = getTemplateById(urlTemplateId);
      if (template) {
        setFontFamily(template.fonts.heading as FontFamily);
      }
    }
  }, [searchParams]);

  // Update resume meta when template or font changes
  useEffect(() => {
    updateMeta({ templateId, fontFamily });
  }, [templateId, fontFamily, updateMeta]);

  const createResume = useCallback(async () => {
    if (isCreating || isSaving) return;
    setIsCreating(true);

    try {
      const response = await apiClient.post("/resumes", {
        title,
        content: resume,
      });

      const newResumeId = response.data.resume.id;
      markSaved();

      // Navigate to the persisted resume editor
      router.replace(`/dashboard/editor/${newResumeId}`);
    } catch (error) {
      console.error("Error creating resume:", error);
    } finally {
      setIsCreating(false);
    }
  }, [resume, title, isCreating, isSaving, router, markSaved]);

  const handleTemplateChange = (newTemplateId: string) => {
    setTemplateId(newTemplateId);
    // Update font to template default
    const template = getTemplateById(newTemplateId);
    if (template) {
      setFontFamily(template.fonts.heading as FontFamily);
    }
  };

  const tabs = [
    { id: "basics" as EditorTab, label: "Basics", icon: User },
    { id: "work" as EditorTab, label: "Work", icon: Briefcase },
    { id: "education" as EditorTab, label: "Education", icon: GraduationCap },
    { id: "skills" as EditorTab, label: "Skills", icon: Wrench },
    { id: "projects" as EditorTab, label: "Projects", icon: FolderOpen },
    { id: "certifications" as EditorTab, label: "Certs", icon: Award },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/templates")}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Back to templates"
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
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">New</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Template Switcher */}
          <TemplateSwitcher value={templateId} onChange={handleTemplateChange} />

          {/* Font Selector */}
          <FontSelector value={fontFamily} onChange={setFontFamily} />

          <div className="w-px h-6 bg-gray-200" />

          <button
            onClick={createResume}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" />
            {isCreating ? "Creating..." : "Save Resume"}
          </button>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-1/2 flex flex-col bg-white border-r border-gray-200">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "basics" && <BasicsForm />}
            {activeTab === "work" && <WorkForm />}
            {activeTab === "education" && (
              <div className="text-center text-gray-500 py-12">Education form coming soon...</div>
            )}
            {activeTab === "skills" && (
              <div className="text-center text-gray-500 py-12">Skills form coming soon...</div>
            )}
            {activeTab === "projects" && (
              <div className="text-center text-gray-500 py-12">Projects form coming soon...</div>
            )}
            {activeTab === "certifications" && (
              <div className="text-center text-gray-500 py-12">
                Certifications form coming soon...
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Template Preview */}
        <div className="w-1/2 overflow-y-auto bg-gray-200 p-6">
          <div className="max-w-[210mm] mx-auto shadow-2xl">
            <div id="resume-preview-container">
              <TemplateRenderer resume={resume} templateId={templateId} scale={0.85} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading editor...</p>
          </div>
        </div>
      }
    >
      <NewEditorContent />
    </Suspense>
  );
}
