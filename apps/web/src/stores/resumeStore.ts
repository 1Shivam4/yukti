import { create } from "zustand";
import type { Resume } from "@yukti/shared";

interface ResumeState {
  resume: Resume | null;
  resumeId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;

  setResume: (resume: Resume) => void;
  setResumeId: (id: string) => void;
  updateBasics: (basics: Partial<Resume["basics"]>) => void;
  updateWork: (work: Resume["work"]) => void;
  updateEducation: (education: Resume["education"]) => void;
  updateSkills: (skills: Resume["skills"]) => void;
  updateProjects: (projects: Resume["projects"]) => void;
  markSaved: () => void;
  setSaving: (saving: boolean) => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  resume: null,
  resumeId: null,
  isDirty: false,
  isSaving: false,
  lastSaved: null,

  setResume: (resume) => set({ resume, isDirty: false }),
  setResumeId: (id) => set({ resumeId: id }),

  updateBasics: (basics) =>
    set((state) => ({
      resume: state.resume
        ? { ...state.resume, basics: { ...state.resume.basics, ...basics } }
        : null,
      isDirty: true,
    })),

  updateWork: (work) =>
    set((state) => ({
      resume: state.resume ? { ...state.resume, work } : null,
      isDirty: true,
    })),

  updateEducation: (education) =>
    set((state) => ({
      resume: state.resume ? { ...state.resume, education } : null,
      isDirty: true,
    })),

  updateSkills: (skills) =>
    set((state) => ({
      resume: state.resume ? { ...state.resume, skills } : null,
      isDirty: true,
    })),

  updateProjects: (projects) =>
    set((state) => ({
      resume: state.resume ? { ...state.resume, projects } : null,
      isDirty: true,
    })),

  markSaved: () => set({ isDirty: false, lastSaved: new Date() }),
  setSaving: (saving) => set({ isSaving: saving }),
}));
