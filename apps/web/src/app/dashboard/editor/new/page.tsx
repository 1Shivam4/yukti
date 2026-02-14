/**
 * New Resume Editor Page
 * Creates a new resume with a selected template - polished split-panel editor
 */

"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResumeStore } from "@/stores/resumeStore";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api-client";
import BasicsForm from "@/components/editor/BasicsForm";
import WorkForm from "@/components/editor/WorkForm";
import EducationForm from "@/components/editor/EducationForm";
import SkillsForm from "@/components/editor/SkillsForm";
import ProjectsForm from "@/components/editor/ProjectsForm";
import CertificationsForm from "@/components/editor/CertificationsForm";
import { TemplateRenderer } from "@/templates";
import { getTemplateById } from "@/templates/registry";
import FontSelector from "@/components/templates/FontSelector";
import TemplateSwitcher from "@/components/templates/TemplateSwitcher";
import type { FontFamily } from "@yukti/shared";
import {
  ArrowLeft,
  Save,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderOpen,
  Award,
  CheckCircle2,
  Loader2,
} from "lucide-react";

type EditorTab = "basics" | "work" | "education" | "skills" | "projects" | "certifications";

const TABS: { id: EditorTab; label: string; icon: typeof User; description: string }[] = [
  { id: "basics", label: "Basics", icon: User, description: "Personal info & summary" },
  { id: "work", label: "Experience", icon: Briefcase, description: "Work history" },
  { id: "education", label: "Education", icon: GraduationCap, description: "Academic background" },
  { id: "skills", label: "Skills", icon: Wrench, description: "Technical & soft skills" },
  { id: "projects", label: "Projects", icon: FolderOpen, description: "Notable projects" },
  { id: "certifications", label: "Certifications", icon: Award, description: "Professional certs" },
];

function NewEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { resume, initEmpty, updateMeta, isDirty, isSaving } = useResumeStore();

  const [activeTab, setActiveTab] = useState<EditorTab>("basics");
  const [title, setTitle] = useState("Untitled Resume");
  const [templateId, setTemplateId] = useState<string>("general-senior-professional");
  const [fontFamily, setFontFamily] = useState<FontFamily>("Inter");
  const [isCreating, setIsCreating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reset store on mount for fresh new resume
  useEffect(() => {
    initEmpty();
  }, [initEmpty]);

  // Get template from URL params
  useEffect(() => {
    const urlTemplateId = searchParams.get("templateId");
    if (urlTemplateId) {
      setTemplateId(urlTemplateId);
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
      useResumeStore.getState().markSaved();
      setSaveSuccess(true);
      setTimeout(() => {
        router.replace(`/dashboard/editor/${newResumeId}`);
      }, 500);
    } catch (error) {
      console.error("Error creating resume:", error);
    } finally {
      setIsCreating(false);
    }
  }, [resume, title, isCreating, isSaving, router]);

  const handleTemplateChange = (newTemplateId: string) => {
    setTemplateId(newTemplateId);
    const template = getTemplateById(newTemplateId);
    if (template) {
      setFontFamily(template.fonts.heading as FontFamily);
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case "basics":
        return <BasicsForm />;
      case "work":
        return <WorkForm />;
      case "education":
        return <EducationForm />;
      case "skills":
        return <SkillsForm />;
      case "projects":
        return <ProjectsForm />;
      case "certifications":
        return <CertificationsForm />;
      default:
        return <BasicsForm />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-200" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border border-transparent hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-3 py-1.5 transition-all max-w-[280px]"
            placeholder="Resume Title"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Template Switcher */}
          <TemplateSwitcher value={templateId} onChange={handleTemplateChange} />

          {/* Font Selector */}
          <FontSelector value={fontFamily} onChange={setFontFamily} />

          <div className="w-px h-8 bg-gray-200" />

          <button
            onClick={createResume}
            disabled={isCreating}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition-all ${
              saveSuccess
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            }`}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Created!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Resume
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-[48%] flex flex-col bg-white border-r border-gray-200">
          {/* Section Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? "text-indigo-600 border-indigo-600 bg-indigo-50/40"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <tab.icon
                    className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-gray-400"}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">{renderForm()}</div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="w-[52%] overflow-y-auto bg-gradient-to-br from-slate-100 to-slate-50 p-6">
          <div className="sticky top-0 z-10 mb-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Live Preview
              </h3>
              <span className="text-xs text-gray-400">
                A4 Paper · {getTemplateById(templateId)?.name || "Senior Professional"}
              </span>
            </div>
          </div>
          <div className="max-w-[210mm] mx-auto shadow-xl border border-gray-200/60 rounded bg-white">
            <div id="resume-preview-container">
              <TemplateRenderer resume={resume} templateId={templateId} scale={0.75} />
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
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading editor...</p>
          </div>
        </div>
      }
    >
      <NewEditorContent />
    </Suspense>
  );
}
