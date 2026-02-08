import { z } from "zod";

/**
 * Template Registry Schema
 * Defines the structure for resume and cover letter templates
 */

// ============= TEMPLATE CATEGORIES =============
export const TemplateCategorySchema = z.enum([
  "it",
  "business",
  "creative",
  "healthcare",
  "general",
]);

export const ExperienceLevelSchema = z.enum(["fresher", "mid", "senior", "executive"]);

export const LayoutTypeSchema = z.enum([
  "single-column",
  "two-column",
  "sidebar-left",
  "sidebar-right",
]);

// ============= COLOR SCHEME =============
export const ColorSchemeSchema = z.object({
  primary: z.string(), // Header, section titles
  secondary: z.string(), // Subtitles, dates
  accent: z.string(), // Highlights, links
  background: z.string().default("#ffffff"),
  text: z.string().default("#1f2937"),
});

// ============= FONT CONFIG =============
export const FontConfigSchema = z.object({
  heading: z.string(), // Font for headers
  body: z.string(), // Font for body text
  size: z.object({
    name: z.number().default(24), // Name font size (pt)
    heading: z.number().default(14), // Section heading size
    body: z.number().default(11), // Body text size
    small: z.number().default(9), // Dates, metadata
  }),
});

// ============= RESUME TEMPLATE =============
export const ResumeTemplateSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  category: TemplateCategorySchema,
  experienceLevel: ExperienceLevelSchema,
  layout: LayoutTypeSchema,
  thumbnail: z.string(), // URL or path to preview image
  colors: ColorSchemeSchema,
  fonts: FontConfigSchema,
  sections: z.array(z.string()), // Ordered list of sections to show
  isBuiltIn: z.boolean().default(true),
});

// ============= COVER LETTER TEMPLATE =============
export const CoverLetterTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: TemplateCategorySchema,
  thumbnail: z.string(),
  colors: ColorSchemeSchema,
  fonts: FontConfigSchema,
  isBuiltIn: z.boolean().default(true),
});

// ============= TYPE EXPORTS =============
export type TemplateCategory = z.infer<typeof TemplateCategorySchema>;
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;
export type LayoutType = z.infer<typeof LayoutTypeSchema>;
export type ColorScheme = z.infer<typeof ColorSchemeSchema>;
export type FontConfig = z.infer<typeof FontConfigSchema>;
export type ResumeTemplate = z.infer<typeof ResumeTemplateSchema>;
export type CoverLetterTemplate = z.infer<typeof CoverLetterTemplateSchema>;

// ============= AVAILABLE FONTS =============
export const AVAILABLE_FONTS = [
  { id: "Arial", name: "Arial", family: "Arial, sans-serif" },
  { id: "Roboto", name: "Roboto", family: "'Roboto', sans-serif" },
  {
    id: "SF Pro",
    name: "SF Pro",
    family: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  { id: "Montserrat", name: "Montserrat", family: "'Montserrat', sans-serif" },
  { id: "Times New Roman", name: "Times New Roman", family: "'Times New Roman', serif" },
  { id: "Inter", name: "Inter", family: "'Inter', sans-serif" },
] as const;

export type AvailableFont = (typeof AVAILABLE_FONTS)[number]["id"];
export type FontFamily = AvailableFont;
