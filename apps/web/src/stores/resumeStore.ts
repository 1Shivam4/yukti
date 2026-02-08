import { create } from "zustand";
import type { Resume, ResumeMeta } from "@yukti/shared";

// Default empty resume structure
const defaultResume: Resume = {
  basics: {
    name: "",
    label: "",
    email: "",
    phone: "",
    url: "",
    summary: "",
    location: {
      address: "",
      city: "",
      region: "",
      postalCode: "",
      countryCode: "",
    },
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
    templateId: "general-senior-professional",
    fontFamily: "Inter" as const,
    colorScheme: {
      primary: "#0f172a",
      secondary: "#475569",
      accent: "#0ea5e9",
    },
    fontSize: "medium" as const,
  },
};

interface ResumeState {
  resume: Resume;
  resumeId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;

  setResume: (resume: Resume) => void;
  setResumeId: (id: string) => void;
  initEmpty: () => void;
  updateBasics: (basics: Partial<Resume["basics"]>) => void;
  updateWork: (work: Resume["work"]) => void;
  updateEducation: (education: Resume["education"]) => void;
  updateSkills: (skills: Resume["skills"]) => void;
  updateProjects: (projects: Resume["projects"]) => void;
  updateMeta: (meta: Partial<ResumeMeta>) => void;
  markSaved: () => void;
  setSaving: (saving: boolean) => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  resume: defaultResume,
  resumeId: null,
  isDirty: false,
  isSaving: false,
  lastSaved: null,

  setResume: (resume) => set({ resume, isDirty: false }),
  setResumeId: (id) => set({ resumeId: id }),
  initEmpty: () => set({ resume: { ...defaultResume }, resumeId: null, isDirty: false }),

  updateBasics: (basics) =>
    set((state) => ({
      resume: { ...state.resume, basics: { ...state.resume.basics, ...basics } },
      isDirty: true,
    })),

  updateWork: (work) =>
    set((state) => ({
      resume: { ...state.resume, work },
      isDirty: true,
    })),

  updateEducation: (education) =>
    set((state) => ({
      resume: { ...state.resume, education },
      isDirty: true,
    })),

  updateSkills: (skills) =>
    set((state) => ({
      resume: { ...state.resume, skills },
      isDirty: true,
    })),

  updateProjects: (projects) =>
    set((state) => ({
      resume: { ...state.resume, projects },
      isDirty: true,
    })),

  updateMeta: (meta) =>
    set((state) => ({
      resume: { ...state.resume, meta: { ...state.resume.meta, ...meta } } as Resume,
      isDirty: true,
    })),

  markSaved: () => set({ isDirty: false, lastSaved: new Date() }),
  setSaving: (saving) => set({ isSaving: saving }),
}));
