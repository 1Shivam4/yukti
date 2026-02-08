/**
 * Professional Classic Cover Letter Template
 * Traditional formal layout
 * Default font: Times New Roman
 */

import type { CoverLetter } from "@yukti/shared";
import { AVAILABLE_FONTS } from "@yukti/shared";

interface TemplateProps {
  coverLetter: CoverLetter;
  className?: string;
}

export default function ProfessionalClassicTemplate({
  coverLetter,
  className = "",
}: TemplateProps) {
  const { sender, recipient, content, jobTitle, meta } = coverLetter;
  const fontFamily =
    AVAILABLE_FONTS.find((f) => f.id === meta?.fontFamily)?.family || "'Times New Roman', serif";

  return (
    <div
      className={`bg-white min-h-[297mm] w-[210mm] mx-auto p-12 ${className}`}
      style={{ fontFamily }}
    >
      {/* Sender Info */}
      <header className="mb-8">
        <p className="font-semibold text-gray-900">{sender.name}</p>
        {sender.address && <p className="text-sm text-gray-700">{sender.address}</p>}
        {sender.city && <p className="text-sm text-gray-700">{sender.city}</p>}
        <p className="text-sm text-gray-700">{sender.email}</p>
        {sender.phone && <p className="text-sm text-gray-700">{sender.phone}</p>}
      </header>

      {/* Date */}
      <p className="text-sm text-gray-700 mb-6">
        {content.date ||
          new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
      </p>

      {/* Recipient Info */}
      <div className="mb-6 text-sm text-gray-700">
        {recipient.name && <p className="font-semibold">{recipient.name}</p>}
        {recipient.title && <p>{recipient.title}</p>}
        <p>{recipient.company}</p>
        {recipient.address && <p>{recipient.address}</p>}
        {recipient.city && <p>{recipient.city}</p>}
      </div>

      {/* Subject Line */}
      <p className="mb-6 text-sm">
        <span className="font-semibold">Re: </span>
        Application for {jobTitle || "the position"}
      </p>

      {/* Greeting */}
      <p className="mb-4 text-sm text-gray-800">{content.greeting}</p>

      {/* Body */}
      <div className="space-y-4 text-sm text-gray-700 leading-relaxed text-justify">
        <p>{content.opening}</p>
        {content.body.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
        <p>{content.closing}</p>
      </div>

      {/* Sign-off */}
      <div className="mt-8">
        <p className="text-sm text-gray-700 mb-8">{content.signoff}</p>
        <p className="font-semibold text-gray-900">{content.signature || sender.name}</p>
      </div>
    </div>
  );
}
