/**
 * IT/Developer Modern Resume Template
 * Two-column layout optimized for software engineers and developers
 * Default font: Roboto
 */

import type { Resume } from "@yukti/shared";
import { AVAILABLE_FONTS } from "@yukti/shared";

interface TemplateProps {
  resume: Resume;
  className?: string;
}

export default function DeveloperModernTemplate({ resume, className = "" }: TemplateProps) {
  const { basics, work, education, skills, projects, certifications } = resume;
  const fontFamily =
    AVAILABLE_FONTS.find((f) => f.id === resume.meta?.fontFamily)?.family || "'Roboto', sans-serif";

  return (
    <div className={`bg-white min-h-[297mm] w-[210mm] mx-auto ${className}`} style={{ fontFamily }}>
      {/* Header - Full Width */}
      <header className="bg-slate-800 text-white px-8 py-6">
        <h1 className="text-3xl font-bold tracking-tight">{basics.name || "Your Name"}</h1>
        {basics.label && <p className="text-lg text-slate-300 mt-1">{basics.label}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-base text-slate-200">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>• {basics.phone}</span>}
          {basics.location?.city && <span>• {basics.location.city}</span>}
          {basics.url && <span>• {basics.url}</span>}
          {basics.profiles.map((profile) => (
            <span key={profile.network}>• {profile.url || profile.username}</span>
          ))}
        </div>
      </header>

      {/* Two-Column Layout */}
      <div className="flex">
        {/* Main Column - Left (65%) */}
        <main className="w-[65%] p-6 pr-4">
          {/* Summary */}
          {basics.summary && (
            <section className="mb-5">
              <h2 className="text-sm font-bold uppercase text-slate-800 border-b-2 border-blue-500 pb-1 mb-3">
                Professional Summary
              </h2>
              <p className="text-base text-gray-900 leading-relaxed">{basics.summary}</p>
            </section>
          )}

          {/* Work Experience */}
          {work.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-bold uppercase text-slate-800 border-b-2 border-blue-500 pb-1 mb-3">
                Experience
              </h2>
              <div className="space-y-4">
                {work.map((job, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.position}</h3>
                        <p className="text-base text-gray-800">{job.name}</p>
                      </div>
                      <span className="text-sm text-gray-700 whitespace-nowrap">
                        {job.startDate} — {job.endDate || "Present"}
                      </span>
                    </div>
                    {job.highlights.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {job.highlights.map(
                          (h, i) =>
                            h && (
                              <li key={i} className="text-base text-gray-900 flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {h}
                              </li>
                            )
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-bold uppercase text-slate-800 border-b-2 border-blue-500 pb-1 mb-3">
                Projects
              </h2>
              <div className="space-y-3">
                {projects.map((project, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      {project.url && <span className="text-xs text-blue-500">{project.url}</span>}
                    </div>
                    {project.description && (
                      <p className="text-base text-gray-800 mt-1">{project.description}</p>
                    )}
                    {project.highlights.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {project.highlights.map(
                          (h, i) =>
                            h && (
                              <li key={i} className="text-base text-gray-900 flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {h}
                              </li>
                            )
                        )}
                      </ul>
                    )}
                    {project.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-100 text-sm text-gray-800 rounded"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Sidebar - Right (35%) */}
        <aside className="w-[35%] bg-slate-50 p-6 pl-4">
          {/* Technical Skills */}
          {skills.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-bold uppercase text-slate-800 border-b-2 border-blue-500 pb-1 mb-3">
                Technical Skills
              </h2>
              <div className="space-y-2">
                {skills.map((skill, idx) => (
                  <div key={idx}>
                    <h3 className="font-medium text-base text-gray-900">{skill.name}</h3>
                    {skill.keywords.length > 0 && (
                      <p className="text-sm text-gray-800 mt-0.5">{skill.keywords.join(", ")}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-bold uppercase text-slate-800 border-b-2 border-blue-500 pb-1 mb-3">
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-sm text-gray-900">
                      {edu.studyType} in {edu.area}
                    </h3>
                    <p className="text-sm text-gray-800">{edu.institution}</p>
                    <p className="text-sm text-gray-700">
                      {edu.startDate} — {edu.endDate || "Present"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-bold uppercase text-slate-800 border-b-2 border-blue-500 pb-1 mb-3">
                Certifications
              </h2>
              <div className="space-y-2">
                {certifications.map((cert, idx) => (
                  <div key={idx}>
                    <h3 className="font-medium text-base text-gray-900">{cert.name}</h3>
                    <p className="text-sm text-gray-800">
                      {cert.issuer} • {cert.date}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
