/**
 * Template Switcher Component
 * Compact inline switcher for changing templates in the editor
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { LayoutTemplate, ChevronDown, Check } from "lucide-react";
import { RESUME_TEMPLATES } from "@/templates/registry";

interface TemplateSwitcherProps {
  value: string;
  onChange: (templateId: string) => void;
  className?: string;
}

export default function TemplateSwitcher({
  value,
  onChange,
  className = "",
}: TemplateSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedTemplate = RESUME_TEMPLATES.find((t) => t.id === value) || RESUME_TEMPLATES[0];

  // Category colors
  const categoryColors: Record<string, string> = {
    it: "bg-blue-100 text-blue-700",
    business: "bg-amber-100 text-amber-700",
    creative: "bg-purple-100 text-purple-700",
    healthcare: "bg-teal-100 text-teal-700",
    general: "bg-gray-100 text-gray-700",
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        <LayoutTemplate size={16} className="text-gray-700" />
        <span className="text-gray-600">{selectedTemplate.name}</span>
        <ChevronDown
          size={14}
          className={`text-gray-700 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[280px] py-1 max-h-[400px] overflow-y-auto">
          {RESUME_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onChange(template.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                template.id === value ? "bg-indigo-50" : ""
              }`}
            >
              {/* Color preview */}
              <div
                className="w-8 h-10 rounded border flex-shrink-0"
                style={{
                  background: `linear-gradient(180deg, ${template.colors.primary} 30%, ${template.colors.background} 30%)`,
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800 truncate">{template.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs capitalize ${categoryColors[template.category]}`}
                  >
                    {template.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{template.description}</p>
              </div>
              {template.id === value && (
                <Check size={16} className="text-indigo-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
