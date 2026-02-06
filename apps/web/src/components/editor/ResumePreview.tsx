"use client";

import { useResumeStore } from "@/stores/resumeStore";

export default function ResumePreview() {
  const { resume } = useResumeStore();

  if (!resume) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading preview...
      </div>
    );
  }

  const { basics, work, education, skills } = resume;

  return (
    <div className="p-8 bg-white min-h-full font-serif">
      {/* Header */}
      <header className="text-center mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{basics.name || "Your Name"}</h1>
        {basics.label && <p className="text-lg text-gray-600 mb-3">{basics.label}</p>}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 flex-wrap">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>• {basics.phone}</span>}
          {basics.location?.city && <span>• {basics.location.city}</span>}
          {basics.url && <span>• {basics.url}</span>}
        </div>
      </header>

      {/* Summary */}
      {basics.summary && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed">{basics.summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {work.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            EXPERIENCE
          </h2>
          <div className="space-y-4">
            {work.map((job, index) => (
              <div key={index}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.position || "Position"}</h3>
                    <p className="text-gray-600">{job.name || "Company"}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {job.startDate} — {job.endDate || "Present"}
                  </span>
                </div>
                {job.highlights.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
                    {job.highlights.map((h, i) => h && <li key={i}>{h}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            EDUCATION
          </h2>
          <div className="space-y-3">
            {education.map((edu, index) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {edu.studyType} in {edu.area}
                  </h3>
                  <p className="text-gray-600">{edu.institution}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {edu.startDate} — {edu.endDate || "Present"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
            SKILLS
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                {skill.name}
                {skill.keywords.length > 0 && `: ${skill.keywords.join(", ")}`}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
