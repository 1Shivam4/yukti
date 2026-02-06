"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import type { Work } from "@yukti/shared";

export default function WorkForm() {
  const { resume, updateWork } = useResumeStore();

  if (!resume) return null;

  const { work } = resume;

  const addWork = () => {
    const newWork: Work = {
      name: "",
      position: "",
      startDate: "",
      highlights: [],
    };
    updateWork([...work, newWork]);
  };

  const removeWork = (index: number) => {
    updateWork(work.filter((_, i) => i !== index));
  };

  const updateWorkItem = (index: number, updates: Partial<Work>) => {
    const updated = work.map((item, i) => (i === index ? { ...item, ...updates } : item));
    updateWork(updated);
  };

  const updateHighlight = (workIndex: number, highlightIndex: number, value: string) => {
    const updated = work.map((item, i) => {
      if (i !== workIndex) return item;
      const highlights = [...item.highlights];
      highlights[highlightIndex] = value;
      return { ...item, highlights };
    });
    updateWork(updated);
  };

  const addHighlight = (workIndex: number) => {
    const updated = work.map((item, i) => {
      if (i !== workIndex) return item;
      return { ...item, highlights: [...item.highlights, ""] };
    });
    updateWork(updated);
  };

  const removeHighlight = (workIndex: number, highlightIndex: number) => {
    const updated = work.map((item, i) => {
      if (i !== workIndex) return item;
      return {
        ...item,
        highlights: item.highlights.filter((_, hi) => hi !== highlightIndex),
      };
    });
    updateWork(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Work Experience
        </h2>
        <button
          onClick={addWork}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {work.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No work experience added yet. Click &quot;Add&quot; to get started.
        </p>
      ) : (
        <div className="space-y-6">
          {work.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">Experience {index + 1}</span>
                <button
                  onClick={() => removeWork(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateWorkItem(index, { name: e.target.value })}
                  placeholder="Company Name"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={item.position}
                  onChange={(e) => updateWorkItem(index, { position: e.target.value })}
                  placeholder="Job Title"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={item.startDate}
                  onChange={(e) => updateWorkItem(index, { startDate: e.target.value })}
                  placeholder="Start Date (YYYY-MM)"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={item.endDate || ""}
                  onChange={(e) => updateWorkItem(index, { endDate: e.target.value })}
                  placeholder="End Date (or Present)"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Highlights</span>
                  <button
                    onClick={() => addHighlight(index)}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    + Add bullet
                  </button>
                </div>
                {item.highlights.map((highlight, hi) => (
                  <div key={hi} className="flex gap-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => updateHighlight(index, hi, e.target.value)}
                      placeholder="Achievement or responsibility..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => removeHighlight(index, hi)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
