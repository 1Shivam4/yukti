/**
 * Template Gallery Page
 * Browse and select resume and cover letter templates
 */

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LayoutTemplate, FileText, Search, SlidersHorizontal, ArrowRight, X } from "lucide-react";
import TemplateCard from "@/components/templates/TemplateCard";
import {
  RESUME_TEMPLATES,
  COVER_LETTER_TEMPLATES,
  getMatchingCoverLetters,
} from "@/templates/registry";
import type { TemplateCategory } from "@yukti/shared";

type TabType = "resume" | "cover-letter";

const CATEGORIES: { id: TemplateCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "it", label: "IT / Tech" },
  { id: "business", label: "Business" },
  { id: "creative", label: "Creative" },
  { id: "healthcare", label: "Healthcare" },
  { id: "general", label: "General" },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("resume");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  // Filter templates based on category and search
  const filteredResumeTemplates = useMemo(() => {
    return RESUME_TEMPLATES.filter((template) => {
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const filteredCoverLetterTemplates = useMemo(() => {
    // If a resume is selected, prioritize matching cover letters
    if (selectedResume) {
      const resumeTemplate = RESUME_TEMPLATES.find((t) => t.id === selectedResume);
      if (resumeTemplate) {
        return getMatchingCoverLetters(resumeTemplate.category);
      }
    }

    return COVER_LETTER_TEMPLATES.filter((template) => {
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, selectedResume]);

  const handleResumeSelect = (id: string) => {
    setSelectedResume(id);
    // Auto-switch to cover letter tab after selecting resume
    setActiveTab("cover-letter");
  };

  const handleCoverLetterSelect = (id: string) => {
    setSelectedCoverLetter(id);
  };

  const handleContinue = () => {
    if (!selectedResume) return;

    // Create new resume with selected template and navigate to editor
    const params = new URLSearchParams({
      templateId: selectedResume,
      ...(selectedCoverLetter && { coverLetterTemplateId: selectedCoverLetter }),
    });
    router.push(`/dashboard/editor/new?${params.toString()}`);
  };

  const handleSkipCoverLetter = () => {
    if (!selectedResume) return;
    router.push(`/dashboard/editor/new?templateId=${selectedResume}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Choose Your Template</h1>
              <p className="text-gray-500 mt-1">
                Select a resume template, then optionally choose a matching cover letter
              </p>
            </div>

            {/* Selection summary and continue button */}
            {selectedResume && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-indigo-600">
                    {RESUME_TEMPLATES.find((t) => t.id === selectedResume)?.name}
                  </span>
                  {selectedCoverLetter && (
                    <>
                      <span className="mx-2">+</span>
                      <span className="font-medium text-indigo-600">
                        {COVER_LETTER_TEMPLATES.find((t) => t.id === selectedCoverLetter)?.name}
                      </span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleContinue}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setActiveTab("resume")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                activeTab === "resume"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutTemplate size={18} />
              Resume Templates
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {RESUME_TEMPLATES.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("cover-letter")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                activeTab === "cover-letter"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText size={18} />
              Cover Letters
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {COVER_LETTER_TEMPLATES.length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <SlidersHorizontal size={16} className="text-gray-400 flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Skip cover letter option */}
        {activeTab === "cover-letter" && selectedResume && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Optional:</span> You can add a cover letter now or skip
              and add one later.
            </p>
            <button
              onClick={handleSkipCoverLetter}
              className="text-sm text-blue-700 font-medium hover:text-blue-800"
            >
              Skip for now →
            </button>
          </div>
        )}

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTab === "resume"
            ? filteredResumeTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  type="resume"
                  isSelected={selectedResume === template.id}
                  onSelect={handleResumeSelect}
                  onPreview={(id) => setShowPreview(id)}
                />
              ))
            : filteredCoverLetterTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  type="cover-letter"
                  isSelected={selectedCoverLetter === template.id}
                  onSelect={handleCoverLetterSelect}
                  onPreview={(id) => setShowPreview(id)}
                />
              ))}
        </div>

        {/* Empty state */}
        {((activeTab === "resume" && filteredResumeTemplates.length === 0) ||
          (activeTab === "cover-letter" && filteredCoverLetterTemplates.length === 0)) && (
          <div className="text-center py-12">
            <LayoutTemplate size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Preview Modal - TODO: Implement full preview */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8"
          onClick={() => setShowPreview(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Template Preview</h3>
              <button
                onClick={() => setShowPreview(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-center">Full preview coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
