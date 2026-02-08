import { TEMPLATE_COMPONENTS } from "@/templates/resume";

/**
 * Maps a database slug or template ID to a valid React Component Key.
 * This ensures that even if we add new database templates with custom slugs,
 * they resolve to one of the 5 implemented frontend layouts.
 */
export const getComponentId = (slugOrId: string = "", category: string = ""): string => {
  const s = slugOrId.toLowerCase();

  // Direct matches (if ID is already a valid component key)
  if (Object.keys(TEMPLATE_COMPONENTS).includes(s)) return s;

  // Keyword mapping for DB slugs
  if (s.includes("modern") || s.includes("developer")) return "it-developer-modern";
  if (s.includes("creative") || s.includes("design")) return "creative-designer-portfolio";
  if (s.includes("medical") || s.includes("health")) return "healthcare-medical-professional";
  if (s.includes("executive")) return "business-executive-classic";

  // Category fallback
  if (category === "creative") return "creative-designer-portfolio";
  if (category === "minimal") return "general-senior-professional";
  if (category === "it") return "it-developer-modern";
  if (category === "healthcare") return "healthcare-medical-professional";

  // Default fallback
  return "general-senior-professional";
};
