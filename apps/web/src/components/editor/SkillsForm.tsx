"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { Wrench, Plus, Trash2, X } from "lucide-react";
import type { Skill } from "@yukti/shared";
import { useState } from "react";

export default function SkillsForm() {
  const { resume, updateSkills } = useResumeStore();

  if (!resume) return null;

  const { skills } = resume;

  const inputClasses =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 transition-colors";

  const addSkill = () => {
    const newSkill: Skill = {
      name: "",
      keywords: [],
    };
    updateSkills([...skills, newSkill]);
  };

  const removeSkill = (index: number) => {
    updateSkills(skills.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<Skill>) => {
    const updated = skills.map((item, i) => (i === index ? { ...item, ...updates } : item));
    updateSkills(updated);
  };

  const addKeyword = (skillIndex: number, keyword: string) => {
    if (!keyword.trim()) return;
    const updated = skills.map((item, i) => {
      if (i !== skillIndex) return item;
      if (item.keywords.includes(keyword.trim())) return item;
      return { ...item, keywords: [...item.keywords, keyword.trim()] };
    });
    updateSkills(updated);
  };

  const removeKeyword = (skillIndex: number, keywordIndex: number) => {
    const updated = skills.map((item, i) => {
      if (i !== skillIndex) return item;
      return {
        ...item,
        keywords: item.keywords.filter((_, ki) => ki !== keywordIndex),
      };
    });
    updateSkills(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-indigo-600" />
          Skills
        </h2>
        <button
          onClick={addSkill}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Skill Group
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No skills added yet.</p>
          <button
            onClick={addSkill}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + Add your first skill group
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((item, index) => (
            <SkillCard
              key={index}
              item={item}
              index={index}
              inputClasses={inputClasses}
              onUpdate={updateItem}
              onRemove={removeSkill}
              onAddKeyword={addKeyword}
              onRemoveKeyword={removeKeyword}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SkillCard({
  item,
  index,
  inputClasses,
  onUpdate,
  onRemove,
  onAddKeyword,
  onRemoveKeyword,
}: {
  item: Skill;
  index: number;
  inputClasses: string;
  onUpdate: (index: number, updates: Partial<Skill>) => void;
  onRemove: (index: number) => void;
  onAddKeyword: (skillIndex: number, keyword: string) => void;
  onRemoveKeyword: (skillIndex: number, keywordIndex: number) => void;
}) {
  const [keywordInput, setKeywordInput] = useState("");

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      onAddKeyword(index, keywordInput);
      setKeywordInput("");
    }
  };

  const levels = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;

  return (
    <div className="p-5 bg-gray-50/80 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Skill Group {index + 1}
        </span>
        <button
          onClick={() => onRemove(index)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Category Name</label>
          <input
            type="text"
            value={item.name}
            onChange={(e) => onUpdate(index, { name: e.target.value })}
            placeholder="Programming Languages, Frameworks..."
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Proficiency Level
          </label>
          <select
            value={item.level || ""}
            onChange={(e) =>
              onUpdate(index, {
                level: (e.target.value || undefined) as Skill["level"],
              })
            }
            className={inputClasses}
          >
            <option value="">Select level...</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Keywords / Individual Skills */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Skills (press Enter or comma to add)
        </label>
        <div className="flex flex-wrap gap-2 p-3 bg-white border border-gray-200 rounded-lg min-h-[44px]">
          {item.keywords.map((keyword, ki) => (
            <span
              key={ki}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium"
            >
              {keyword}
              <button
                onClick={() => onRemoveKeyword(index, ki)}
                className="hover:text-indigo-900 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeywordKeyDown}
            onBlur={() => {
              if (keywordInput.trim()) {
                onAddKeyword(index, keywordInput);
                setKeywordInput("");
              }
            }}
            placeholder={item.keywords.length === 0 ? "React, Node.js, Python..." : "Add more..."}
            className="flex-1 min-w-[120px] border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent"
          />
        </div>
      </div>
    </div>
  );
}
