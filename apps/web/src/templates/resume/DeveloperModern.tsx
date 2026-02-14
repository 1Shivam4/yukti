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
      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 6mm;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          /* Prevent content from splitting across pages */
          section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Prevent work experience items from splitting */
          section > div > div {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Prevent list items from splitting */
          li {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Control page breaks between sections */
          section {
            page-break-after: auto;
          }
          
          /* Avoid breaks after headers */
          h2, h3 {
            page-break-after: avoid;
            break-after: avoid;
          }
          
          /* Remove box shadows and borders for print */
          * {
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Header - Centered */}
      <header className="text-center px-8 pt-6 pb-4">
        {/* Name - Large, Bold, Centered */}
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
          {basics.name || "Your Name"}
        </h1>

        {/* Single Contact Line - All info with | separators */}
        <div className="flex justify-center flex-wrap items-center gap-2 mt-2 text-base text-gray-700">
          {basics.phone && <span>{basics.phone}</span>}

          {basics.email && (
            <>
              <span className="text-gray-400">|</span>
              <span>{basics.email}</span>
            </>
          )}

          {/* LinkedIn Profile */}
          {basics.profiles.find((p) => p.network.toLowerCase() === "linkedin") && (
            <>
              <span className="text-gray-400">|</span>
              <span>LinkedIn</span>
            </>
          )}

          {/* GitHub Profile */}
          {basics.profiles.find((p) => p.network.toLowerCase() === "github") && (
            <>
              <span className="text-gray-400">|</span>
              <span>
                GitHub:{" "}
                {basics.profiles.find((p) => p.network.toLowerCase() === "github")?.username}
              </span>
            </>
          )}

          {/* Portfolio/Website */}
          {basics.url && (
            <>
              <span className="text-gray-400">|</span>
              <span>Portfolio</span>
            </>
          )}

          {/* Other profiles */}
          {basics.profiles
            .filter((p) => !["linkedin", "github"].includes(p.network.toLowerCase()))
            .map((profile) => (
              <span key={profile.network} className="flex items-center gap-x-2">
                <span className="text-gray-400">|</span>
                <span>
                  {profile.network}: {profile.username}
                </span>
              </span>
            ))}

          {/* Location */}
          {basics.location?.city && (
            <>
              <span className="text-gray-400">|</span>
              <span>
                {basics.location.city}
                {basics.location.region && `, ${basics.location.region}`}
              </span>
            </>
          )}
        </div>

        {/* Thin divider line */}
        <div className="w-full h-px bg-gray-300 mt-3" />
      </header>

      {/* Single Column Layout */}
      <div className="flex flex-col gap-4 px-8 py-2">
        {/* Summary */}
        {basics.summary && (
          <section className="mb-5">
            <h2 className="text-sm font-bold uppercase text-gray-900 border-b-2 border-blue-500 pb-1 mb-3">
              Professional Summary
            </h2>
            <p className="text-base text-gray-900 leading-relaxed">{basics.summary}</p>
          </section>
        )}

        {/* Technical Skills */}
        {skills.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-bold uppercase text-gray-900 border-b-2 border-blue-500 pb-1 mb-3">
              Technical Skills
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {skills.map((skill, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-sm text-gray-900">{skill.name}</h3>
                  {skill.keywords.length > 0 && (
                    <p className="text-sm text-gray-800 mt-0.5">{skill.keywords.join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-bold uppercase text-gray-900 border-b-2 border-blue-500 pb-1 mb-3">
              Certifications
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {certifications.map((cert, idx) => (
                <div key={idx}>
                  <h3 className="font-medium text-sm text-gray-900">{cert.name}</h3>
                  <p className="text-sm text-gray-800">
                    {cert.issuer} • {cert.date}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Work Experience */}
        {work.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-bold uppercase text-gray-900 border-b-2 border-blue-500 pb-1 mb-3">
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
                            <li key={i} className="text-base text-gray-900 flex items-start gap-2">
                              <span>•</span>
                              <span>{h}</span>
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
            <h2 className="text-sm font-bold uppercase text-gray-900 border-b-2 border-blue-500 pb-1 mb-3">
              Projects
            </h2>
            <div className="space-y-3">
              {projects.map((project, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    {project.url && <span className="text-md text-black">{project.url}</span>}
                  </div>
                  {project.description && (
                    <p className="text-base text-gray-800 mt-1">{project.description}</p>
                  )}
                  {project.highlights.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {project.highlights.map(
                        (h, i) =>
                          h && (
                            <li key={i} className="text-base text-gray-900 flex gap-2">
                              <span className="text-blue-500 mr-2">•</span>
                              <span className="text-black">{h}</span>
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

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-bold uppercase text-gray-900 border-b-2 border-blue-500 pb-1 mb-3">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">
                      {edu.studyType} in {edu.area}
                    </h3>
                    <p className="text-sm text-gray-800">{edu.institution}</p>
                  </div>
                  <p className="text-sm text-gray-700">
                    {edu.startDate} — {edu.endDate || "Present"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
