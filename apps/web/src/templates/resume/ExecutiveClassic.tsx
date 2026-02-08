/**
 * Business/Executive Classic Resume Template
 * Single-column traditional layout for executives and business professionals
 * Default font: Times New Roman
 */

import type { Resume } from "@yukti/shared";
import { AVAILABLE_FONTS } from "@yukti/shared";

interface TemplateProps {
  resume: Resume;
  className?: string;
}

export default function ExecutiveClassicTemplate({ resume, className = "" }: TemplateProps) {
  const { basics, work, education, skills, certifications, awards } = resume;
  const fontFamily =
    AVAILABLE_FONTS.find((f) => f.id === resume.meta?.fontFamily)?.family ||
    "'Times New Roman', serif";

  return (
    <div
      className={`bg-white min-h-[297mm] w-[210mm] mx-auto p-10 ${className}`}
      style={{ fontFamily }}
    >
      {/* Header - Centered */}
      <header className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold tracking-wide text-gray-900 uppercase">
          {basics.name || "Your Name"}
        </h1>
        {basics.label && <p className="text-lg text-gray-600 mt-1 italic">{basics.label}</p>}
        <div className="flex justify-center flex-wrap gap-x-3 mt-3 text-sm text-gray-600">
          {basics.email && <span>{basics.email}</span>}
          {basics.phone && <span>|</span>}
          {basics.phone && <span>{basics.phone}</span>}
          {basics.location?.city && <span>|</span>}
          {basics.location?.city && <span>{basics.location.city}</span>}
          {basics.profiles.length > 0 && <span>|</span>}
          {basics.profiles.map((profile, idx) => (
            <span key={profile.network}>
              {idx > 0 && " | "}
              {profile.url || `${profile.network}: ${profile.username}`}
            </span>
          ))}
        </div>
      </header>

      {/* Executive Summary */}
      {basics.summary && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-3">
            Executive Summary
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed text-justify">{basics.summary}</p>
        </section>
      )}

      {/* Professional Experience */}
      {work.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-3">
            Professional Experience
          </h2>
          <div className="space-y-5">
            {work.map((job, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-gray-900 uppercase">{job.position}</h3>
                  <span className="text-sm text-gray-600">
                    {job.startDate} — {job.endDate || "Present"}
                  </span>
                </div>
                <p className="text-sm text-gray-700 italic">{job.name}</p>
                {job.summary && <p className="text-sm text-gray-600 mt-1">{job.summary}</p>}
                {job.highlights.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {job.highlights.map(
                      (h, i) =>
                        h && (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
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

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-bold text-gray-900">
                    {edu.studyType} in {edu.area}
                  </h3>
                  <p className="text-sm text-gray-600 italic">{edu.institution}</p>
                </div>
                <span className="text-sm text-gray-600">{edu.endDate || edu.startDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Two-column footer: Skills | Certifications/Awards */}
      <div className="grid grid-cols-2 gap-8">
        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-3">
              Core Competencies
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {skills
                .flatMap((skill) => (skill.keywords.length > 0 ? skill.keywords : [skill.name]))
                .map((item, idx) => (
                  <span key={idx} className="text-sm text-gray-700">
                    • {item}
                  </span>
                ))}
            </div>
          </section>
        )}

        {/* Awards & Certifications */}
        <section>
          {certifications.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-3">
                Certifications
              </h2>
              <div className="space-y-1">
                {certifications.map((cert, idx) => (
                  <p key={idx} className="text-sm text-gray-700">
                    {cert.name} — {cert.issuer}
                  </p>
                ))}
              </div>
            </div>
          )}

          {awards.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-1 mb-3">
                Awards
              </h2>
              <div className="space-y-1">
                {awards.map((award, idx) => (
                  <p key={idx} className="text-sm text-gray-700">
                    {award.title} — {award.awarder} ({award.date})
                  </p>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
