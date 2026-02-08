/**
 * Corporate Executive Cover Letter Template
 * Premium feel with structured paragraphs
 * Default font: SF Pro (system-ui)
 */

import type { CoverLetter } from "@yukti/shared";
import { AVAILABLE_FONTS } from "@yukti/shared";

interface TemplateProps {
  coverLetter: CoverLetter;
  className?: string;
}

export default function CorporateExecutiveTemplate({ coverLetter, className = "" }: TemplateProps) {
  const { sender, recipient, content, jobTitle, meta } = coverLetter;
  const fontFamily =
    AVAILABLE_FONTS.find((f) => f.id === meta?.fontFamily)?.family ||
    "system-ui, -apple-system, sans-serif";

  return (
    <div
      className={`bg-white min-h-[297mm] w-[210mm] mx-auto p-10 ${className}`}
      style={{ fontFamily }}
    >
      {/* Header - Centered with border */}
      <header className="text-center border-b-2 border-gray-900 pb-4 mb-8">
        <h1 className="text-2xl font-bold tracking-wide text-gray-900 uppercase">{sender.name}</h1>
        <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600">
          <span>{sender.email}</span>
          {sender.phone && (
            <>
              <span className="text-gray-400">|</span>
              <span>{sender.phone}</span>
            </>
          )}
          {sender.city && (
            <>
              <span className="text-gray-400">|</span>
              <span>{sender.city}</span>
            </>
          )}
        </div>
      </header>

      {/* Date - Right aligned */}
      <p className="text-right text-sm text-gray-600 mb-6">
        {content.date ||
          new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
      </p>

      {/* Recipient */}
      <div className="mb-6 text-sm text-gray-700">
        {recipient.name && <p className="font-medium">{recipient.name}</p>}
        {recipient.title && <p>{recipient.title}</p>}
        <p className="font-medium">{recipient.company}</p>
        {recipient.address && <p>{recipient.address}</p>}
        {recipient.city && <p>{recipient.city}</p>}
      </div>

      {/* Subject with uppercase styling */}
      <p className="mb-6 text-sm uppercase tracking-wider font-medium text-gray-900">
        Re: {jobTitle || "Application for Position"}
      </p>

      {/* Greeting */}
      <p className="mb-5 text-gray-800">{content.greeting}</p>

      {/* Body - Justified for executive feel */}
      <div className="space-y-4 text-gray-700 leading-relaxed text-justify">
        <p>{content.opening}</p>
        {content.body.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
        <p>{content.closing}</p>
      </div>

      {/* Sign-off - Formal spacing */}
      <div className="mt-10">
        <p className="text-gray-700 mb-10">{content.signoff}</p>
        <div className="border-t border-gray-300 pt-2 inline-block">
          <p className="font-medium text-gray-900">{content.signature || sender.name}</p>
        </div>
      </div>
    </div>
  );
}
