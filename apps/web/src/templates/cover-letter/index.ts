/**
 * Cover Letter Templates Index
 */

export { default as ProfessionalClassicTemplate } from "./ProfessionalClassic";
export { default as ModernMinimalTemplate } from "./ModernMinimal";
export { default as CorporateExecutiveTemplate } from "./CorporateExecutive";

// Template ID to Component mapping
import ProfessionalClassicTemplate from "./ProfessionalClassic";
import ModernMinimalTemplate from "./ModernMinimal";
import CorporateExecutiveTemplate from "./CorporateExecutive";

export const COVER_LETTER_COMPONENTS = {
  "professional-classic": ProfessionalClassicTemplate,
  "modern-minimal": ModernMinimalTemplate,
  "corporate-executive": CorporateExecutiveTemplate,
} as const;

export type CoverLetterTemplateId = keyof typeof COVER_LETTER_COMPONENTS;
