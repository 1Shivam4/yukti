/**
 * Healthcare/Medical Professional Resume Template
 * Clean, structured layout for healthcare workers
 * Default font: Arial
 */

import type { Resume } from "@yukti/shared";
import { AVAILABLE_FONTS } from "@yukti/shared";

interface TemplateProps {
  resume: Resume;
  className?: string;
}

export default function MedicalProfessionalTemplate({ resume, className = "" }: TemplateProps) {
  const { basics, work, education, skills, certifications, publications } = resume;
  const fontFamily =
    AVAILABLE_FONTS.find((f) => f.id === resume.meta?.fontFamily)?.family || "Arial, sans-serif";

  return (
    <div className={`bg-white min-h-[297mm] w-[210mm] mx-auto ${className}`} style={{ fontFamily }}>
      {/* Header with blue accent */}
      <header className="bg-sky-700 text-white px-8 py-5">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">{basics.name || "Your Name"}</h1>
            {basics.label && <p className="text-sky-200 mt-0.5">{basics.label}</p>}
          </div>
          <div className="text-right text-base text-sky-50">
            {basics.email && <p>{basics.email}</p>}
            {basics.phone && <p>{basics.phone}</p>}
            {basics.location?.city && <p>{basics.location.city}</p>}
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Professional Profile */}
        {basics.summary && (
          <section className="mb-5">
            <h2 className="text-sm font-bold uppercase text-sky-700 border-b-2 border-sky-700 pb-1 mb-2">
              Professional Profile
            </h2>
            <p className="text-base text-gray-900 leading-relaxed">{basics.summary}</p>
          </section>
        )}

        {/* Clinical Experience */}
        {work.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-bold uppercase text-sky-700 border-b-2 border-sky-700 pb-1 mb-3">
              Clinical Experience
            </h2>
            <div className="space-y-4">
              {work.map((job, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline border-b border-gray-200 pb-0.5">
                    <h3 className="font-bold text-gray-900">{job.position}</h3>
                    <span className="text-sm text-gray-700">
                      {job.startDate} — {job.endDate || "Present"}
                    </span>
                  </div>
                  <p className="text-base text-gray-800 mt-0.5">{job.name}</p>
                  {job.highlights.length > 0 && (
                    <ul className="mt-2 grid grid-cols-1 gap-1">
                      {job.highlights.map(
                        (h, i) =>
                          h && (
                            <li key={i} className="text-base text-gray-900 flex items-start">
                              <span className="text-sky-600 mr-2">▪</span>
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

        {/* Two-column: Certifications & Education */}
        <div className="grid grid-cols-2 gap-6 mb-5">
          {/* Certifications & Licenses */}
          <section>
            <h2 className="text-sm font-bold uppercase text-sky-700 border-b-2 border-sky-700 pb-1 mb-3">
              Certifications & Licenses
            </h2>
            {certifications.length > 0 ? (
              <div className="space-y-2">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="text-base">
                    <p className="font-medium text-gray-900">{cert.name}</p>
                    <p className="text-sm text-gray-800">
                      {cert.issuer} • {cert.date}
                      {cert.expiryDate && ` — Exp: ${cert.expiryDate}`}
                    </p>
                    {cert.credentialId && (
                      <p className="text-sm text-gray-700">ID: {cert.credentialId}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No certifications listed</p>
            )}
          </section>

          {/* Education */}
          <section>
            <h2 className="text-sm font-bold uppercase text-sky-700 border-b-2 border-sky-700 pb-1 mb-3">
              Education & Training
            </h2>
            {education.length > 0 ? (
              <div className="space-y-2">
                {education.map((edu, idx) => (
                  <div key={idx} className="text-base">
                    <p className="font-medium text-gray-900">
                      {edu.studyType} — {edu.area}
                    </p>
                    <p className="text-sm text-gray-800">{edu.institution}</p>
                    <p className="text-sm text-gray-700">{edu.endDate || edu.startDate}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No education listed</p>
            )}
          </section>
        </div>

        {/* Publications */}
        {publications.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-bold uppercase text-sky-700 border-b-2 border-sky-700 pb-1 mb-3">
              Publications & Research
            </h2>
            <div className="space-y-2">
              {publications.map((pub, idx) => (
                <div key={idx} className="text-base">
                  <p className="font-medium text-gray-900">"{pub.name}"</p>
                  <p className="text-sm text-gray-800">
                    {pub.publisher} • {pub.releaseDate}
                  </p>
                  {pub.summary && <p className="text-sm text-gray-700 mt-0.5">{pub.summary}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills/Competencies */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-sm font-bold uppercase text-sky-700 border-b-2 border-sky-700 pb-1 mb-3">
              Clinical Skills & Competencies
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills
                .flatMap((skill) => (skill.keywords.length > 0 ? skill.keywords : [skill.name]))
                .map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-sky-50 text-sky-700 text-sm rounded border border-sky-200"
                  >
                    {item}
                  </span>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
