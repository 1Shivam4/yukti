import { z } from "zod";

/**
 * JSON Resume Schema (Simplified)
 * Based on https://jsonresume.org/schema/
 */

export const BasicsSchema = z.object({
  name: z.string().min(1).max(100),
  label: z.string().max(100).optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  url: z.string().url().optional(),
  summary: z.string().max(1000).optional(),
  location: z
    .object({
      address: z.string().optional(),
      postalCode: z.string().optional(),
      city: z.string(),
      countryCode: z.string().length(2),
      region: z.string().optional(),
    })
    .optional(),
  profiles: z
    .array(
      z.object({
        network: z.string(),
        username: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),
});

export const WorkSchema = z.object({
  name: z.string(),
  position: z.string(),
  url: z.string().url().optional(),
  startDate: z.string(), // ISO date format
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

export const EducationSchema = z.object({
  institution: z.string(),
  url: z.string().url().optional(),
  area: z.string(),
  studyType: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  score: z.string().optional(),
  courses: z.array(z.string()).optional(),
});

export const SkillSchema = z.object({
  name: z.string(),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
  keywords: z.array(z.string()).default([]),
});

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  keywords: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  url: z.string().url().optional(),
  roles: z.array(z.string()).optional(),
});

export const ResumeSchema = z.object({
  basics: BasicsSchema,
  work: z.array(WorkSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
});

export type Resume = z.infer<typeof ResumeSchema>;
export type Basics = z.infer<typeof BasicsSchema>;
export type Work = z.infer<typeof WorkSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Project = z.infer<typeof ProjectSchema>;
