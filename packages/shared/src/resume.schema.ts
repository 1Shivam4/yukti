import { z } from "zod";

/**
 * Enhanced Resume Schema for Template-Based Resume Builder
 * Based on JSON Resume standard with additional sections for experienced professionals
 */

// ============= BASICS =============
export const LocationSchema = z.object({
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  countryCode: z.string().max(2).optional(),
  region: z.string().optional(),
});

export const ProfileSchema = z.object({
  network: z.string(), // LinkedIn, GitHub, Twitter, etc.
  username: z.string(),
  url: z.string().url().optional(),
});

export const BasicsSchema = z.object({
  name: z.string().min(1).max(100),
  label: z.string().max(100).optional(), // Professional title
  image: z.string().url().optional(), // Profile photo URL
  email: z.string().email(),
  phone: z.string().optional(),
  url: z.string().url().optional(), // Portfolio/personal website
  summary: z.string().max(2000).optional(),
  location: LocationSchema.optional(),
  profiles: z.array(ProfileSchema).default([]),
});

// ============= WORK EXPERIENCE =============
export const WorkSchema = z.object({
  id: z.string().optional(), // For drag-drop ordering
  name: z.string(), // Company name
  position: z.string(),
  url: z.string().url().optional(),
  startDate: z.string(), // YYYY-MM format
  endDate: z.string().optional(), // Empty = Present
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

// ============= EDUCATION =============
export const EducationSchema = z.object({
  id: z.string().optional(),
  institution: z.string(),
  url: z.string().url().optional(),
  area: z.string(), // Field of study
  studyType: z.string(), // Degree type (B.Tech, MBA, etc.)
  startDate: z.string(),
  endDate: z.string().optional(),
  score: z.string().optional(), // GPA/percentage
  courses: z.array(z.string()).default([]),
});

// ============= SKILLS =============
export const SkillSchema = z.object({
  id: z.string().optional(),
  name: z.string(), // Skill category
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
  keywords: z.array(z.string()).default([]),
});

// ============= PROJECTS =============
export const ProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]), // Technologies used
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  url: z.string().url().optional(),
  roles: z.array(z.string()).default([]),
});

// ============= CERTIFICATIONS =============
export const CertificationSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  url: z.string().url().optional(),
});

// ============= LANGUAGES =============
export const LanguageSchema = z.object({
  id: z.string().optional(),
  language: z.string(),
  fluency: z.enum(["Native", "Fluent", "Professional", "Intermediate", "Basic"]),
});

// ============= AWARDS =============
export const AwardSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  date: z.string(),
  awarder: z.string(),
  summary: z.string().optional(),
});

// ============= PUBLICATIONS =============
export const PublicationSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  publisher: z.string(),
  releaseDate: z.string(),
  url: z.string().url().optional(),
  summary: z.string().optional(),
});

// ============= VOLUNTEER =============
export const VolunteerSchema = z.object({
  id: z.string().optional(),
  organization: z.string(),
  position: z.string(),
  url: z.string().url().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

// ============= RESUME METADATA =============
export const ResumeMetaSchema = z.object({
  templateId: z.string().optional(),
  fontFamily: z
    .enum(["Arial", "Roboto", "SF Pro", "Montserrat", "Times New Roman", "Inter"])
    .default("Inter"),
  colorScheme: z
    .object({
      primary: z.string().default("#1e40af"),
      secondary: z.string().default("#64748b"),
      accent: z.string().default("#0ea5e9"),
    })
    .optional(),
  fontSize: z.enum(["small", "medium", "large"]).default("medium"),
});

// ============= MAIN RESUME SCHEMA =============
export const ResumeSchema = z.object({
  basics: BasicsSchema,
  work: z.array(WorkSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
  awards: z.array(AwardSchema).default([]),
  publications: z.array(PublicationSchema).default([]),
  volunteer: z.array(VolunteerSchema).default([]),
  meta: ResumeMetaSchema.optional(),
});

// ============= TYPE EXPORTS =============
export type Resume = z.infer<typeof ResumeSchema>;
export type Basics = z.infer<typeof BasicsSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Work = z.infer<typeof WorkSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type Award = z.infer<typeof AwardSchema>;
export type Publication = z.infer<typeof PublicationSchema>;
export type Volunteer = z.infer<typeof VolunteerSchema>;
export type ResumeMeta = z.infer<typeof ResumeMetaSchema>;

// ============= EMPTY RESUME HELPER =============
export function createEmptyResume(): Resume {
  return {
    basics: {
      name: "",
      email: "",
      profiles: [],
    },
    work: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    publications: [],
    volunteer: [],
    meta: {
      fontFamily: "Inter",
      fontSize: "medium",
    },
  };
}
