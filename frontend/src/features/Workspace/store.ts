import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Problem } from "@/types/Problem";
import type { ProblemSetup } from "@/types/ProblemSetup";
import type { EditorRef } from "../Editor/Editor";
import type { Submission } from "@/types/Submission";

interface WorkspaceState {
  problem: Problem | null;
  setup: ProblemSetup | null;
  editor: EditorRef | null;
  rightTab: string;
  leftTab: string;

  selectedSubmission: Submission | null;
  submissionResults: any;

  setProblem: (p: Problem | null) => void;
  setSetup: (id: string | null) => void;
  setEditor: (editorRef: EditorRef | null) => void;
  setRightTab: (tab: string) => void;
  setLeftTab: (tab: string) => void;
  setSelectedSubmission: (submission: Submission | null) => void;
  setSubmissionResults: (results: any) => void;

  clear: () => void;
  initialize: (problem: Problem | null) => void;

  onSubmissionFinished: (submission: Submission) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  (set, get) => ({
    problem: null,
    setup: null,
    editor: null,
    rightTab: "editor",
    leftTab: "statement",
    selectedSubmission: null,
    submissionResults: null,
    setupTestcases: null,


    setProblem(problem) {
      set({ problem });
    },

    setSetup(id) {
      set((state) => {
        if (!id) return { setup: null };

        if(state.problem?.id) {
          const storageKey = `workspace-storage-${state.problem?.id}`;
          localStorage.setItem(storageKey, id);
        }
        
        return {
          setup: state.problem?.setups.find((s) => s.id === id) || null,
        };
      });
    },

    setEditor(editor) {
      set({ editor });
    },

    setRightTab(tab) {
      set({ rightTab: tab });
    },
    
    setLeftTab(tab) {
      set({ leftTab: tab });
    },

    setSelectedSubmission(submission) {
      set({ selectedSubmission: submission });
    },

    setSubmissionResults(results) {
      set({ submissionResults: results });
    },

    clear() {
      set({ problem: null, setup: null });
    },

    initialize(problem) {
      if(!problem) {
        set({ problem: null, setup: null });
        return
      }

      const storageKey = `workspace-storage-${problem.id}`;
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        set({
          problem,
          setup: problem.setups.find((s) => s.id === savedData) ?? null,
          leftTab: "statement",
          rightTab: "editor",
        });
      }
      else {
        set({ problem, setup: problem.setups.length === 1 ? problem.setups[0] : null, leftTab: "statement", rightTab: "editor" });
      }
    },

    onSubmissionFinished(submission) {
      get().setLeftTab("submissions");
      get().setSelectedSubmission(submission);
    },
  }),
);

if (import.meta.env.DEV) {
  (window as any).workspaceStore = useWorkspaceStore;
}