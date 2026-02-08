/**
 * Template Renderer Component
 * Dynamically renders the selected resume template
 */

"use client";

import type { Resume } from "@yukti/shared";
import { TEMPLATE_COMPONENTS, type TemplateId } from "./resume";
import SeniorProfessionalTemplate from "./resume/SeniorProfessional";

interface TemplateRendererProps {
  resume: Resume;
  templateId?: string;
  className?: string;
  scale?: number;
}

export default function TemplateRenderer({
  resume,
  templateId,
  className = "",
  scale = 1,
}: TemplateRendererProps) {
  // Get the template component or fallback to default
  const effectiveTemplateId = (templateId ||
    resume.meta?.templateId ||
    "general-senior-professional") as TemplateId;
  const TemplateComponent = TEMPLATE_COMPONENTS[effectiveTemplateId] || SeniorProfessionalTemplate;

  return (
    <div
      className={className}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top center",
      }}
    >
      <TemplateComponent resume={resume} />
    </div>
  );
}
