/**
 * Template Card Component
 * Displays a template preview in the gallery
 */

"use client";

import { useState } from "react";
import type { ResumeTemplate, CoverLetterTemplate, Resume } from "@yukti/shared";
import { Eye, Check } from "lucide-react";
import TemplateRenderer from "../../templates/TemplateRenderer";
import { TEMPLATE_COMPONENTS } from "../../templates/resume";

interface TemplateCardProps {
  template: ResumeTemplate | CoverLetterTemplate;
  type: "resume" | "cover-letter";
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onPreview?: (id: string) => void;
}

// Dummy resume data for previews
const DUMMY_RESUME: Resume = {
  basics: {
    name: "John Doe",
    label: "Professional Role",
    email: "john@example.com",
    phone: "+1 234 567 890",
    summary:
      "Experienced professional with a proven track record of success in project management and strategic planning.",
    location: { city: "New York", region: "NY" },
    profiles: [],
  },
  work: [
    {
      name: "Tech Solutions Inc.",
      position: "Senior Manager",
      startDate: "2020",
      endDate: "Present",
      highlights: ["Led team of 10", "Increased revenue by 20%"],
    },
  ],
  education: [
    {
      institution: "State University",
      studyType: "Bachelor",
      area: "Business",
      startDate: "2015",
      endDate: "2019",
      courses: [],
    },
  ],
  skills: [
    { name: "Management", keywords: [] },
    { name: "Strategy", keywords: [] },
  ],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  publications: [],
  volunteer: [],
};

// Map DB slug to Frontend Component ID
const getComponentId = (slug: string = "", category: string = ""): string => {
  const s = slug.toLowerCase();

  // Direct matches (if slugs align perfectly in future)
  if (Object.keys(TEMPLATE_COMPONENTS).includes(s)) return s;

  // Keyword mapping
  if (s.includes("modern") || s.includes("developer")) return "it-developer-modern";
  if (s.includes("creative") || s.includes("design")) return "creative-designer-portfolio";
  if (s.includes("medical") || s.includes("health")) return "healthcare-medical-professional";
  if (s.includes("executive")) return "business-executive-classic";

  // Category fallback
  if (category === "creative") return "creative-designer-portfolio";
  if (category === "minimal") return "general-senior-professional";

  return "business-executive-classic";
};

export default function TemplateCard({
  template,
  type,
  isSelected = false,
  onSelect,
  onPreview,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get category badge color
  const categoryColors: Record<string, string> = {
    it: "bg-blue-100 text-blue-700",
    business: "bg-amber-100 text-amber-700",
    creative: "bg-purple-100 text-purple-700",
    healthcare: "bg-teal-100 text-teal-700",
    general: "bg-gray-100 text-gray-700",
  };

  const badgeColor = categoryColors[template.category] || categoryColors.general;

  return (
    <div
      className={`
        relative bg-white rounded-xl border-2 overflow-hidden transition-all duration-200
        ${isSelected ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-200"}
        ${isHovered ? "shadow-lg transform -translate-y-1" : "shadow-sm"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
      )}

      {/* Template Preview Image */}
      <div className="relative aspect-[210/297] bg-gray-50 overflow-hidden group">
        <div className="absolute inset-0 origin-top transform scale-[0.25] w-[210mm] h-[297mm] pointer-events-none select-none">
          {type === "resume" ? (
            <TemplateRenderer
              resume={DUMMY_RESUME}
              templateId={getComponentId((template as ResumeTemplate).slug, template.category)}
            />
          ) : (
            // Fallback for cover letter or if type check fails
            <div className="w-full h-full bg-white p-8">
              <div className="h-4 w-1/3 bg-gray-200 mb-8" />
              <div className="space-y-4">
                <div className="h-2 w-full bg-gray-100" />
                <div className="h-2 w-full bg-gray-100" />
                <div className="h-2 w-3/4 bg-gray-100" />
              </div>
            </div>
          )}
        </div>

        {/* Hover overlay with actions */}
        <div
          className={`
            absolute inset-0 bg-black/50 flex items-center justify-center gap-3
            transition-opacity duration-200
            ${isHovered ? "opacity-100" : "opacity-0"}
          `}
        >
          <button
            onClick={() => onPreview?.(template.id)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            <Eye size={16} />
            Preview
          </button>
          <button
            onClick={() => onSelect?.(template.id)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            <Check size={16} />
            Select
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900">{template.name}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${badgeColor}`}>
            {template.category}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>

        {/* Font info */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <span>Font: {template.fonts.heading}</span>
          {"experienceLevel" in template && (
            <>
              <span>•</span>
              <span className="capitalize">{template.experienceLevel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
