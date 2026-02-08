/**
 * Template Selection Modal
 * Popup for selecting a template when creating a new resume
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Search, LayoutTemplate, ArrowRight } from "lucide-react";
import { RESUME_TEMPLATES } from "@/templates/registry";
import type { TemplateCategory } from "@yukti/shared";

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { id: TemplateCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "it", label: "IT / Tech" },
  { id: "business", label: "Business" },
  { id: "creative", label: "Creative" },
  { id: "healthcare", label: "Healthcare" },
  { id: "general", label: "General" },
];

export default function TemplateSelectionModal({ isOpen, onClose }: TemplateSelectionModalProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate(null);
      setSelectedCategory("all");
      setSearchQuery("");
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTemplates = RESUME_TEMPLATES.filter((template) => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContinue = () => {
    if (!selectedTemplate) return;
    onClose();
    router.push(`/dashboard/editor/new?templateId=${selectedTemplate}`);
  };

  // Category badge colors
  const categoryColors: Record<string, string> = {
    it: "bg-blue-100 text-blue-700",
    business: "bg-amber-100 text-amber-700",
    creative: "bg-purple-100 text-purple-700",
    healthcare: "bg-teal-100 text-teal-700",
    general: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <LayoutTemplate className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Choose a Template</h2>
              <p className="text-sm text-gray-500">Select a professional template to get started</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <LayoutTemplate className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No templates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    selectedTemplate === template.id
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {/* Template preview */}
                  <div
                    className="aspect-[210/297] rounded-lg mb-3 border overflow-hidden"
                    style={{
                      background: `linear-gradient(180deg, ${template.colors.primary} 20%, #f8fafc 20%)`,
                    }}
                  >
                    <div className="p-3 pt-6">
                      <div className="h-2 w-3/4 bg-white/80 rounded mb-2" />
                      <div className="h-1.5 w-1/2 bg-gray-200 rounded mb-3" />
                      <div className="space-y-1">
                        <div className="h-1 w-full bg-gray-100 rounded" />
                        <div className="h-1 w-5/6 bg-gray-100 rounded" />
                        <div className="h-1 w-4/6 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Template info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {template.description}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs capitalize flex-shrink-0 ${categoryColors[template.category]}`}
                    >
                      {template.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {selectedTemplate
              ? `Selected: ${RESUME_TEMPLATES.find((t) => t.id === selectedTemplate)?.name}`
              : "Select a template to continue"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedTemplate}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
