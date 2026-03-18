import type { MCQ, Problem, TestQuestion } from "@/lib/api-modules";

export type DraftQuestion = Partial<TestQuestion>;
export type LibraryType = "mcq" | "programming";
export type AddPopoverView = "menu" | "custom" | "library";
export type CustomQuestionMode = "mcq" | "programming";
export type LibraryItem = MCQ | Problem;
export type TestCaseDraft = { input: string; output: string; isHidden: boolean };

export type McqDraft = {
  headline: string;
  details: string;
  options: string[];
  correctOption: number;
  marks: number;
};

export type ProgrammingDraft = {
  problemId?: string;
  title: string;
  description: string;
  constraints: string;
  inputFormat: string;
  outputFormat: string;
  languages: string[];
  customTestcases: TestCaseDraft[];
  marks: number;
};

export const PROGRAMMING_LANGUAGES = ["javascript", "python3", "cpp"];
