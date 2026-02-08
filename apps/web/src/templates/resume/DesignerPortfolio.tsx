/**
 * Creative/Designer Portfolio Resume Template
 * Sidebar layout with visual flair for designers and creatives
 * Default font: Montserrat
 */

import type { Resume } from "@yukti/shared";
import { AVAILABLE_FONTS } from "@yukti/shared";

interface TemplateProps {
  resume: Resume;
  className?: string;
}

export default function DesignerPortfolioTemplate({ resume, className = "" }: TemplateProps) {
  const { basics, work, education, skills, projects, awards } = resume;
  const fontFamily =
    AVAILABLE_FONTS.find((f) => f.id === resume.meta?.fontFamily)?.family ||
    "'Montserrat', sans-serif";

  return (
    <div
      className={`bg-white min-h-[297mm] w-[210mm] mx-auto flex ${className}`}
      style={{ fontFamily }}
    >
      {/* Sidebar - Left */}
      <aside className="w-[35%] bg-gradient-to-b from-purple-600 to-purple-800 text-white p-6">
        {/* Profile Section */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-white/20 mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl font-bold">
              {basics.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "?"}
            </span>
          </div>
          <h1 className="text-xl font-bold">{basics.name || "Your Name"}</h1>
          {basics.label && <p className="text-purple-200 text-sm mt-1">{basics.label}</p>}
        </div>

        {/* Contact */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b border-purple-400 pb-1 mb-3">
            Contact
          </h2>
          <div className="space-y-2 text-sm">
            {basics.email && (
              <p className="flex items-center gap-2">
                <span className="text-purple-300">✉</span>
                {basics.email}
              </p>
            )}
            {basics.phone && (
              <p className="flex items-center gap-2">
                <span className="text-purple-300">☎</span>
                {basics.phone}
              </p>
            )}
            {basics.location?.city && (
              <p className="flex items-center gap-2">
                <span className="text-purple-300">📍</span>
                {basics.location.city}
              </p>
            )}
            {basics.url && (
              <p className="flex items-center gap-2">
                <span className="text-purple-300">🌐</span>
                {basics.url}
              </p>
            )}
          </div>
        </section>

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-purple-400 pb-1 mb-3">
              Skills
            </h2>
            <div className="space-y-3">
              {skills.map((skill, idx) => (
                <div key={idx}>
                  <h3 className="text-sm font-medium">{skill.name}</h3>
                  {skill.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {skill.keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white/20 rounded text-xs">
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
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-purple-400 pb-1 mb-3">
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={idx} className="text-sm">
                  <h3 className="font-medium">{edu.studyType}</h3>
                  <p className="text-purple-200 text-xs">{edu.institution}</p>
                  <p className="text-purple-300 text-xs">{edu.endDate || edu.startDate}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Social Links */}
        {basics.profiles.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-purple-400 pb-1 mb-3">
              Online
            </h2>
            <div className="space-y-1">
              {basics.profiles.map((profile) => (
                <p key={profile.network} className="text-sm text-purple-200">
                  {profile.network}: {profile.username}
                </p>
              ))}
            </div>
          </section>
        )}
      </aside>

      {/* Main Content - Right */}
      <main className="w-[65%] p-8">
        {/* About Me */}
        {basics.summary && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-purple-700 mb-2 flex items-center">
              <span className="w-8 h-0.5 bg-pink-500 mr-2"></span>
              About Me
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{basics.summary}</p>
          </section>
        )}

        {/* Experience */}
        {work.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-purple-700 mb-4 flex items-center">
              <span className="w-8 h-0.5 bg-pink-500 mr-2"></span>
              Experience
            </h2>
            <div className="space-y-4">
              {work.map((job, idx) => (
                <div key={idx} className="relative pl-4 border-l-2 border-purple-200">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-pink-500"></div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">{job.position}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {job.startDate} — {job.endDate || "Present"}
                    </span>
                  </div>
                  <p className="text-sm text-purple-600">{job.name}</p>
                  {job.highlights.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {job.highlights.map(
                        (h, i) =>
                          h && (
                            <li key={i} className="text-sm text-gray-600 flex items-start">
                              <span className="text-pink-500 mr-2">→</span>
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

        {/* Projects / Portfolio */}
        {projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-purple-700 mb-4 flex items-center">
              <span className="w-8 h-0.5 bg-pink-500 mr-2"></span>
              Portfolio
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {projects.map((project, idx) => (
                <div key={idx} className="p-3 border border-purple-100 rounded-lg bg-purple-50/50">
                  <h3 className="font-bold text-sm text-gray-900">{project.name}</h3>
                  {project.description && (
                    <p className="text-xs text-gray-600 mt-1">{project.description}</p>
                  )}
                  {project.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.keywords.slice(0, 3).map((kw, i) => (
                        <span key={i} className="text-xs text-purple-600">
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

        {/* Awards */}
        {awards.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-purple-700 mb-3 flex items-center">
              <span className="w-8 h-0.5 bg-pink-500 mr-2"></span>
              Awards
            </h2>
            <div className="space-y-2">
              {awards.map((award, idx) => (
                <div key={idx} className="flex items-center text-sm">
                  <span className="text-yellow-500 mr-2">★</span>
                  <span className="font-medium text-gray-800">{award.title}</span>
                  <span className="text-gray-400 mx-2">—</span>
                  <span className="text-gray-600">{award.awarder}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
