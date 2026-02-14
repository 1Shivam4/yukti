/**
 * Font Selector Component
 * Dropdown for switching resume/cover letter fonts
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Type, ChevronDown, Check } from "lucide-react";
import { AVAILABLE_FONTS, type FontFamily } from "@yukti/shared";

interface FontSelectorProps {
  value: FontFamily;
  onChange: (font: FontFamily) => void;
  className?: string;
}

export default function FontSelector({ value, onChange, className = "" }: FontSelectorProps) {
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

  const selectedFont = AVAILABLE_FONTS.find((f) => f.id === value) || AVAILABLE_FONTS[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        <Type size={16} className="text-gray-700" />
        <span style={{ fontFamily: selectedFont.family }} className="text-gray-500">
          {selectedFont.id}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-700 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[200px] py-1">
          {AVAILABLE_FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => {
                onChange(font.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                font.id === value ? "bg-indigo-50" : ""
              }`}
              style={{ fontFamily: font.family }}
            >
              <span className="text-gray-800">{font.id}</span>
              {font.id === value && <Check size={16} className="text-indigo-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
