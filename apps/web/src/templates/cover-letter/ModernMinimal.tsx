/**
 * Modern Minimal Cover Letter Template
 * Clean modern design with subtle accents
 * Default font: Inter
 */

import type { CoverLetter } from "@yukti/shared";
import { AVAILABLE_FONTS } from "@yukti/shared";

interface TemplateProps {
  coverLetter: CoverLetter;
  className?: string;
}

export default function ModernMinimalTemplate({ coverLetter, className = "" }: TemplateProps) {
  const { sender, recipient, content, jobTitle, meta } = coverLetter;
  const fontFamily =
    AVAILABLE_FONTS.find((f) => f.id === meta?.fontFamily)?.family || "'Inter', sans-serif";

  return (
    <div className={`bg-white min-h-[297mm] w-[210mm] mx-auto ${className}`} style={{ fontFamily }}>
      {/* Header with accent bar */}
      <header className="bg-slate-800 text-white px-10 py-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">{sender.name}</h1>
          <p className="text-slate-300 text-sm mt-1">{sender.email}</p>
          {sender.phone && <p className="text-slate-300 text-sm">{sender.phone}</p>}
        </div>
        <div className="text-right text-sm text-slate-300">
          {sender.city && <p>{sender.city}</p>}
          <p>
            {content.date ||
              new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
          </p>
        </div>
      </header>

      <div className="px-10 py-8">
        {/* Recipient */}
        <div className="mb-6 text-sm text-gray-600">
          {recipient.name && <p className="font-medium text-gray-800">{recipient.name}</p>}
          {recipient.title && <p>{recipient.title}</p>}
          <p className="font-medium text-gray-800">{recipient.company}</p>
          {recipient.address && <p>{recipient.address}</p>}
        </div>

        {/* Subject */}
        <div className="mb-6 py-2 border-l-4 border-blue-500 pl-4">
          <p className="font-medium text-gray-800">Application: {jobTitle || "Position"}</p>
        </div>

        {/* Greeting */}
        <p className="mb-5 text-gray-800">{content.greeting}</p>

        {/* Body */}
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>{content.opening}</p>
          {content.body.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
          <p>{content.closing}</p>
        </div>

        {/* Sign-off */}
        <div className="mt-10">
          <p className="text-gray-700 mb-6">{content.signoff}</p>
          <p className="font-semibold text-gray-900 text-lg">{content.signature || sender.name}</p>
        </div>
      </div>
    </div>
  );
}
