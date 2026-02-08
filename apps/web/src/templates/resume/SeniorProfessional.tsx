/**
 * General/Senior Professional Resume Template
 * Clean, versatile single-column layout for any industry
 * Default font: Inter
 */

import type { Resume } from "@yukti/shared";
import { AVAILABLE_FONTS } from "@yukti/shared";

interface TemplateProps {
  resume: Resume;
  className?: string;
}

export default function SeniorProfessionalTemplate({ resume, className = "" }: TemplateProps) {
  const { basics, work, education, skills, projects, certifications } = resume;
  const fontFamily =
    AVAILABLE_FONTS.find((f) => f.id === resume.meta?.fontFamily)?.family || "'Inter', sans-serif";

  return (
    <div
      className={`bg-white min-h-[297mm] w-[210mm] mx-auto p-8 ${className}`}
      style={{ fontFamily }}
    >
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{basics.name || "Your Name"}</h1>
        {basics.label && <p className="text-lg text-gray-600 mt-1">{basics.label}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-600">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>|</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location?.city && <span>|</span>}
          {basics.location?.city && (
            <span>
              {basics.location.city}
              {basics.location.region && `, ${basics.location.region}`}
            </span>
          )}
          {basics.profiles.map((profile) => (
            <span key={profile.network} className="text-sky-600">
              | {profile.url || `${profile.network}: ${profile.username}`}
            </span>
          ))}
        </div>
        <div className="w-full h-0.5 bg-gradient-to-r from-sky-500 to-transparent mt-4"></div>
      </header>

      {/* Summary */}
      {basics.summary && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2">Summary</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{basics.summary}</p>
        </section>
      )}

      {/* Experience */}
      {work.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-3">
            Experience
          </h2>
          <div className="space-y-4">
            {work.map((job, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.position}</h3>
                    <p className="text-sm text-gray-600">{job.name}</p>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {job.startDate} — {job.endDate || "Present"}
                  </span>
                </div>
                {job.highlights.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {job.highlights.map(
                      (h, i) =>
                        h && (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-sky-500 mr-2 font-bold">►</span>
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

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <div key={idx} className="flex items-center">
                <span className="font-medium text-sm text-gray-800">{skill.name}</span>
                {skill.keywords.length > 0 && (
                  <span className="text-sm text-gray-600 ml-1">({skill.keywords.join(", ")})</span>
                )}
                {idx < skills.length - 1 && <span className="text-gray-300 ml-2">•</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Two-column: Education & Projects */}
      <div className="grid grid-cols-2 gap-6 mb-5">
        {/* Education */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2">
            Education
          </h2>
          {education.length > 0 ? (
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-sm text-gray-900">
                    {edu.studyType} in {edu.area}
                  </h3>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-xs text-gray-500">{edu.endDate || edu.startDate}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No education listed</p>
          )}
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2">
            Key Projects
          </h2>
          {projects.length > 0 ? (
            <div className="space-y-2">
              {projects.slice(0, 3).map((project, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-sm text-gray-900">{project.name}</h3>
                  {project.description && (
                    <p className="text-xs text-gray-600">{project.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No projects listed</p>
          )}
        </section>
      </div>

      {/* Certifications */}
      {certifications.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2">
            Certifications
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {certifications.map((cert, idx) => (
              <span key={idx} className="text-sm text-gray-700">
                {cert.name} <span className="text-gray-400">({cert.issuer})</span>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
