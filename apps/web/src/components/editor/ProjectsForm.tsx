"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { FolderOpen, Plus, Trash2, X } from "lucide-react";
import type { Project } from "@yukti/shared";
import { useState } from "react";

export default function ProjectsForm() {
  const { resume, updateProjects } = useResumeStore();

  if (!resume) return null;

  const { projects } = resume;

  const inputClasses =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 transition-colors";

  const addProject = () => {
    const newProject: Project = {
      name: "",
      highlights: [],
      keywords: [],
      roles: [],
    };
    updateProjects([...projects, newProject]);
  };

  const removeProject = (index: number) => {
    updateProjects(projects.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<Project>) => {
    const updated = projects.map((item, i) => (i === index ? { ...item, ...updates } : item));
    updateProjects(updated);
  };

  const updateHighlight = (projIndex: number, highlightIndex: number, value: string) => {
    const updated = projects.map((item, i) => {
      if (i !== projIndex) return item;
      const highlights = [...item.highlights];
      highlights[highlightIndex] = value;
      return { ...item, highlights };
    });
    updateProjects(updated);
  };

  const addHighlight = (projIndex: number) => {
    const updated = projects.map((item, i) => {
      if (i !== projIndex) return item;
      return { ...item, highlights: [...item.highlights, ""] };
    });
    updateProjects(updated);
  };

  const removeHighlight = (projIndex: number, highlightIndex: number) => {
    const updated = projects.map((item, i) => {
      if (i !== projIndex) return item;
      return {
        ...item,
        highlights: item.highlights.filter((_, hi) => hi !== highlightIndex),
      };
    });
    updateProjects(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-indigo-600" />
          Projects
        </h2>
        <button
          onClick={addProject}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No projects added yet.</p>
          <button
            onClick={addProject}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + Add your first project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((item, index) => (
            <ProjectCard
              key={index}
              item={item}
              index={index}
              inputClasses={inputClasses}
              onUpdate={updateItem}
              onRemove={removeProject}
              onAddHighlight={addHighlight}
              onUpdateHighlight={updateHighlight}
              onRemoveHighlight={removeHighlight}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  item,
  index,
  inputClasses,
  onUpdate,
  onRemove,
  onAddHighlight,
  onUpdateHighlight,
  onRemoveHighlight,
}: {
  item: Project;
  index: number;
  inputClasses: string;
  onUpdate: (index: number, updates: Partial<Project>) => void;
  onRemove: (index: number) => void;
  onAddHighlight: (projIndex: number) => void;
  onUpdateHighlight: (projIndex: number, highlightIndex: number, value: string) => void;
  onRemoveHighlight: (projIndex: number, highlightIndex: number) => void;
}) {
  const [techInput, setTechInput] = useState("");

  const addTech = (keyword: string) => {
    if (!keyword.trim()) return;
    if (item.keywords.includes(keyword.trim())) return;
    onUpdate(index, { keywords: [...item.keywords, keyword.trim()] });
  };

  const removeTech = (ki: number) => {
    onUpdate(index, {
      keywords: item.keywords.filter((_, i) => i !== ki),
    });
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTech(techInput);
      setTechInput("");
    }
  };

  return (
    <div className="p-5 bg-gray-50/80 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Project {index + 1}
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
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Project Name</label>
          <input
            type="text"
            value={item.name}
            onChange={(e) => onUpdate(index, { name: e.target.value })}
            placeholder="E-Commerce Platform, AI Chatbot..."
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Project URL</label>
          <input
            type="url"
            value={item.url || ""}
            onChange={(e) => onUpdate(index, { url: e.target.value || undefined })}
            placeholder="https://github.com/..."
            className={inputClasses}
          />
        </div>
        <div className="col-span-full">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
          <textarea
            rows={2}
            value={item.description || ""}
            onChange={(e) => onUpdate(index, { description: e.target.value })}
            placeholder="Brief overview of what this project does..."
            className={inputClasses}
          />
        </div>
      </div>

      {/* Technologies */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Technologies (press Enter or comma)
        </label>
        <div className="flex flex-wrap gap-2 p-3 bg-white border border-gray-200 rounded-lg min-h-[44px]">
          {item.keywords.map((keyword, ki) => (
            <span
              key={ki}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium"
            >
              {keyword}
              <button
                onClick={() => removeTech(ki)}
                className="hover:text-emerald-900 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={handleTechKeyDown}
            onBlur={() => {
              if (techInput.trim()) {
                addTech(techInput);
                setTechInput("");
              }
            }}
            placeholder={item.keywords.length === 0 ? "React, TypeScript, AWS..." : "Add more..."}
            className="flex-1 min-w-[120px] border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent"
          />
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600">Key Highlights</label>
          <button
            onClick={() => onAddHighlight(index)}
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
              onChange={(e) => onUpdateHighlight(index, hi, e.target.value)}
              placeholder="Achieved X using Y resulting in Z..."
              className={`flex-1 ${inputClasses}`}
            />
            <button
              onClick={() => onRemoveHighlight(index, hi)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
