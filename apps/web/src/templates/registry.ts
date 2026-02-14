/**
 * Resume Template Registry
 * Central registry of all available resume templates
 */

import type { ResumeTemplate, CoverLetterTemplate } from "@yukti/shared";

// ============= RESUME TEMPLATES =============

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "it-developer-modern",
    slug: "it-developer-modern",
    name: "Developer Modern",
    description:
      "Clean two-column layout perfect for software engineers and developers. Highlights technical skills prominently.",
    category: "it",
    experienceLevel: "senior",
    layout: "two-column",
    thumbnail: "/templates/it-developer-modern.png",
    colors: {
      primary: "#1e293b", // Dark slate
      secondary: "#52525b", // Neutral gray
      accent: "#9333ea", // Elegant deep violet accent
      background: "#ffffff",
      text: "#0f172a",
    },
    fonts: {
      heading: "Roboto",
      body: "Roboto",
      size: { name: 28, heading: 14, body: 11, small: 9 },
    },
    sections: ["basics", "summary", "work", "skills", "projects", "education", "certifications"],
    isBuiltIn: true,
  },
  {
    id: "business-executive-classic",
    slug: "business-executive-classic",
    name: "Executive Classic",
    description:
      "Traditional professional layout with elegant typography. Ideal for managers, executives, and business professionals.",
    category: "business",
    experienceLevel: "executive",
    layout: "single-column",
    thumbnail: "/templates/business-executive-classic.png",
    colors: {
      primary: "#1e293b", // Dark slate
      secondary: "#52525b", // Neutral gray
      accent: "#9333ea", // Elegant deep violet accent
      background: "#ffffff",
      text: "#0f172a",
    },
    fonts: {
      heading: "Times New Roman",
      body: "Times New Roman",
      size: { name: 26, heading: 13, body: 11, small: 9 },
    },
    sections: ["basics", "summary", "work", "education", "skills", "certifications", "awards"],
    isBuiltIn: true,
  },
  {
    id: "creative-designer-portfolio",
    slug: "creative-designer-portfolio",
    name: "Designer Portfolio",
    description:
      "Modern creative layout with visual flair. Perfect for designers, artists, and creative professionals.",
    category: "creative",
    experienceLevel: "senior",
    layout: "sidebar-left",
    thumbnail: "/templates/creative-designer-portfolio.png",
    colors: {
      primary: "#1e293b", // Dark slate
      secondary: "#52525b", // Neutral gray
      accent: "#9333ea", // Elegant deep violet accent
      background: "#ffffff",
      text: "#0f172a",
    },
    fonts: {
      heading: "Montserrat",
      body: "Inter",
      size: { name: 32, heading: 14, body: 11, small: 9 },
    },
    sections: ["basics", "summary", "work", "projects", "skills", "education", "awards"],
    isBuiltIn: true,
  },
  {
    id: "healthcare-medical-professional",
    slug: "healthcare-medical-professional",
    name: "Medical Professional",
    description:
      "Clean, structured layout for healthcare workers. Emphasizes credentials, certifications, and clinical experience.",
    category: "healthcare",
    experienceLevel: "senior",
    layout: "single-column",
    thumbnail: "/templates/healthcare-medical-professional.png",
    colors: {
      primary: "#1e293b", // Dark slate
      secondary: "#52525b", // Neutral gray
      accent: "#9333ea", // Elegant deep violet accent
      background: "#ffffff",
      text: "#0f172a",
    },
    fonts: {
      heading: "Arial",
      body: "Arial",
      size: { name: 24, heading: 13, body: 11, small: 9 },
    },
    sections: [
      "basics",
      "summary",
      "work",
      "certifications",
      "education",
      "publications",
      "skills",
    ],
    isBuiltIn: true,
  },
  {
    id: "general-senior-professional",
    slug: "general-senior-professional",
    name: "Senior Professional",
    description:
      "Versatile clean design suitable for any industry. Balanced layout with clear sections and modern typography.",
    category: "general",
    experienceLevel: "senior",
    layout: "single-column",
    thumbnail: "/templates/general-senior-professional.png",
    colors: {
      primary: "#1e293b", // Dark slate
      secondary: "#52525b", // Neutral gray
      accent: "#9333ea", // Elegant deep violet accent
      background: "#ffffff",
      text: "#0f172a",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      size: { name: 26, heading: 14, body: 11, small: 9 },
    },
    sections: ["basics", "summary", "work", "skills", "education", "projects", "certifications"],
    isBuiltIn: true,
  },
];

// ============= COVER LETTER TEMPLATES =============

export const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
  {
    id: "professional-classic",
    name: "Professional Classic",
    description: "Traditional formal cover letter with clean structure",
    category: "general",
    thumbnail: "/templates/cl-professional-classic.png",
    colors: {
      primary: "#1f2937",
      secondary: "#4b5563",
      accent: "#1e40af",
      background: "#ffffff",
      text: "#111827",
    },
    fonts: {
      heading: "Times New Roman",
      body: "Times New Roman",
      size: { name: 14, heading: 14, body: 11, small: 10 },
    },
    isBuiltIn: true,
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Clean modern design with subtle accents",
    category: "it",
    thumbnail: "/templates/cl-modern-minimal.png",
    colors: {
      primary: "#1e293b",
      secondary: "#64748b",
      accent: "#3b82f6",
      background: "#ffffff",
      text: "#1f2937",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      size: { name: 14, heading: 14, body: 11, small: 10 },
    },
    isBuiltIn: true,
  },
  {
    id: "corporate-executive",
    name: "Corporate Executive",
    description: "Premium feel with structured paragraphs for executives",
    category: "business",
    thumbnail: "/templates/cl-corporate-executive.png",
    colors: {
      primary: "#0f172a",
      secondary: "#334155",
      accent: "#1e40af",
      background: "#ffffff",
      text: "#0f172a",
    },
    fonts: {
      heading: "SF Pro",
      body: "SF Pro",
      size: { name: 13, heading: 13, body: 11, small: 10 },
    },
    isBuiltIn: true,
  },
];

// ============= HELPER FUNCTIONS =============

export function getTemplateById(id: string): ResumeTemplate | undefined {
  return RESUME_TEMPLATES.find((t) => t.id === id);
}

export function getCoverLetterTemplateById(id: string): CoverLetterTemplate | undefined {
  return COVER_LETTER_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): ResumeTemplate[] {
  return RESUME_TEMPLATES.filter((t) => t.category === category);
}

export function getMatchingCoverLetters(resumeCategory: string): CoverLetterTemplate[] {
  // Return cover letters from same category + general ones
  return COVER_LETTER_TEMPLATES.filter(
    (t) => t.category === resumeCategory || t.category === "general"
  );
}
