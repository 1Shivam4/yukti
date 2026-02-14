"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import type { Education } from "@yukti/shared";

export default function EducationForm() {
  const { resume, updateEducation } = useResumeStore();

  if (!resume) return null;

  const { education } = resume;

  const inputClasses =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 transition-colors";

  const addEducation = () => {
    const newEdu: Education = {
      institution: "",
      area: "",
      studyType: "",
      startDate: "",
      courses: [],
    };
    updateEducation([...education, newEdu]);
  };

  const removeEducation = (index: number) => {
    updateEducation(education.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<Education>) => {
    const updated = education.map((item, i) => (i === index ? { ...item, ...updates } : item));
    updateEducation(updated);
  };

  const updateCourse = (eduIndex: number, courseIndex: number, value: string) => {
    const updated = education.map((item, i) => {
      if (i !== eduIndex) return item;
      const courses = [...item.courses];
      courses[courseIndex] = value;
      return { ...item, courses };
    });
    updateEducation(updated);
  };

  const addCourse = (eduIndex: number) => {
    const updated = education.map((item, i) => {
      if (i !== eduIndex) return item;
      return { ...item, courses: [...item.courses, ""] };
    });
    updateEducation(updated);
  };

  const removeCourse = (eduIndex: number, courseIndex: number) => {
    const updated = education.map((item, i) => {
      if (i !== eduIndex) return item;
      return {
        ...item,
        courses: item.courses.filter((_, ci) => ci !== courseIndex),
      };
    });
    updateEducation(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          Education
        </h2>
        <button
          onClick={addEducation}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No education added yet.</p>
          <button
            onClick={addEducation}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + Add your first education
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((item, index) => (
            <div
              key={index}
              className="p-5 bg-gray-50/80 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Education {index + 1}
                </span>
                <button
                  onClick={() => removeEducation(index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={item.institution}
                    onChange={(e) => updateItem(index, { institution: e.target.value })}
                    placeholder="MIT, Stanford, IIT Delhi..."
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Degree Type
                  </label>
                  <input
                    type="text"
                    value={item.studyType}
                    onChange={(e) => updateItem(index, { studyType: e.target.value })}
                    placeholder="B.Tech, MBA, M.Sc..."
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    value={item.area}
                    onChange={(e) => updateItem(index, { area: e.target.value })}
                    placeholder="Computer Science, Business..."
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    GPA / Score
                  </label>
                  <input
                    type="text"
                    value={item.score || ""}
                    onChange={(e) => updateItem(index, { score: e.target.value })}
                    placeholder="3.8/4.0 or 85%"
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
                    onChange={(e) => updateItem(index, { startDate: e.target.value })}
                    placeholder="2020-08"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
                  <input
                    type="text"
                    value={item.endDate || ""}
                    onChange={(e) => updateItem(index, { endDate: e.target.value })}
                    placeholder="2024-05 or Present"
                    className={inputClasses}
                  />
                </div>
              </div>

              {/* Relevant Courses */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">Relevant Courses</label>
                  <button
                    onClick={() => addCourse(index)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    + Add course
                  </button>
                </div>
                {item.courses.map((course, ci) => (
                  <div key={ci} className="flex gap-2">
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => updateCourse(index, ci, e.target.value)}
                      placeholder="Data Structures, Machine Learning..."
                      className={`flex-1 ${inputClasses}`}
                    />
                    <button
                      onClick={() => removeCourse(index, ci)}
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
