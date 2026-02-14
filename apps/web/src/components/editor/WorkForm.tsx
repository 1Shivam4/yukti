"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import type { Work } from "@yukti/shared";

export default function WorkForm() {
  const { resume, updateWork } = useResumeStore();

  if (!resume) return null;

  const { work } = resume;

  const inputClasses =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 transition-colors";

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
          <Briefcase className="w-5 h-5 text-indigo-600" />
          Work Experience
        </h2>
        <button
          onClick={addWork}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {work.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No work experience added yet.</p>
          <button
            onClick={addWork}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + Add your first experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {work.map((item, index) => (
            <div
              key={index}
              className="p-5 bg-gray-50/80 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Experience {index + 1}
                </span>
                <button
                  onClick={() => removeWork(index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateWorkItem(index, { name: e.target.value })}
                    placeholder="Google, Amazon..."
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={item.position}
                    onChange={(e) => updateWorkItem(index, { position: e.target.value })}
                    placeholder="Senior Software Engineer"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={item.startDate}
                    onChange={(e) => updateWorkItem(index, { startDate: e.target.value })}
                    placeholder="2022-01"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
                  <input
                    type="text"
                    value={item.endDate || ""}
                    onChange={(e) => updateWorkItem(index, { endDate: e.target.value })}
                    placeholder="Present"
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Highlights / Bullet Points */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">Key Achievements</label>
                  <button
                    onClick={() => addHighlight(index)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
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
                      placeholder="Achieved X by doing Y, resulting in Z..."
                      className={`flex-1 ${inputClasses}`}
                    />
                    <button
                      onClick={() => removeHighlight(index, hi)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
