import { z } from "zod";

/**
 * Cover Letter Schema for Template-Based Resume Builder
 */

// ============= RECIPIENT INFO =============
export const RecipientSchema = z.object({
  name: z.string().optional(), // Hiring Manager's name
  title: z.string().optional(), // Hiring Manager, HR Director, etc.
  company: z.string(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

// ============= COVER LETTER CONTENT =============
export const CoverLetterContentSchema = z.object({
  date: z.string().optional(), // Letter date
  greeting: z.string().default("Dear Hiring Manager,"),
  opening: z.string(), // Why applying, enthusiasm
  body: z.array(z.string()).default([]), // 1-3 paragraphs about skills/experience
  closing: z.string(), // Call to action, thank you
  signoff: z.string().default("Sincerely,"),
  signature: z.string(), // Your name
});

// ============= COVER LETTER METADATA =============
export const CoverLetterMetaSchema = z.object({
  templateId: z.string().optional(),
  fontFamily: z
    .enum(["Arial", "Roboto", "SF Pro", "Montserrat", "Times New Roman", "Inter"])
    .default("Inter"),
  fontSize: z.enum(["small", "medium", "large"]).default("medium"),
});

// ============= MAIN COVER LETTER SCHEMA =============
export const CoverLetterSchema = z.object({
  jobTitle: z.string(), // Position applying for
  recipient: RecipientSchema,
  sender: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
  }),
  content: CoverLetterContentSchema,
  meta: CoverLetterMetaSchema.optional(),
});

// ============= TYPE EXPORTS =============
export type CoverLetter = z.infer<typeof CoverLetterSchema>;
export type Recipient = z.infer<typeof RecipientSchema>;
export type CoverLetterContent = z.infer<typeof CoverLetterContentSchema>;
export type CoverLetterMeta = z.infer<typeof CoverLetterMetaSchema>;

// ============= EMPTY COVER LETTER HELPER =============
export function createEmptyCoverLetter(senderName?: string, senderEmail?: string): CoverLetter {
  return {
    jobTitle: "",
    recipient: {
      company: "",
    },
    sender: {
      name: senderName || "",
      email: senderEmail || "",
    },
    content: {
      greeting: "Dear Hiring Manager,",
      opening: "",
      body: [],
      closing: "",
      signoff: "Sincerely,",
      signature: senderName || "",
    },
    meta: {
      fontFamily: "Inter",
      fontSize: "medium",
    },
  };
}
