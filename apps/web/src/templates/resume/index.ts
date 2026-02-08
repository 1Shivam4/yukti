/**
 * Resume Template Index
 * Exports all resume templates and the renderer component
 */

export { default as DeveloperModernTemplate } from "./DeveloperModern";
export { default as ExecutiveClassicTemplate } from "./ExecutiveClassic";
export { default as DesignerPortfolioTemplate } from "./DesignerPortfolio";
export { default as MedicalProfessionalTemplate } from "./MedicalProfessional";
export { default as SeniorProfessionalTemplate } from "./SeniorProfessional";

// Template ID to Component mapping
import DeveloperModernTemplate from "./DeveloperModern";
import ExecutiveClassicTemplate from "./ExecutiveClassic";
import DesignerPortfolioTemplate from "./DesignerPortfolio";
import MedicalProfessionalTemplate from "./MedicalProfessional";
import SeniorProfessionalTemplate from "./SeniorProfessional";

export const TEMPLATE_COMPONENTS = {
  "it-developer-modern": DeveloperModernTemplate,
  "business-executive-classic": ExecutiveClassicTemplate,
  "creative-designer-portfolio": DesignerPortfolioTemplate,
  "healthcare-medical-professional": MedicalProfessionalTemplate,
  "general-senior-professional": SeniorProfessionalTemplate,
} as const;

export type TemplateId = keyof typeof TEMPLATE_COMPONENTS;
