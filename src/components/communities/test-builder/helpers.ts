import { format } from "date-fns";
import type { Problem } from "@/lib/api-modules";
import type {
  DraftQuestion,
  LibraryItem,
  McqDraft,
  ProgrammingDraft,
} from "./types";
import { PROGRAMMING_LANGUAGES } from "./types";

export function getCurrentDefaultTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

export const DEFAULT_TIME = getCurrentDefaultTime();

export function createEmptyMcqDraft(): McqDraft {
  return {
    headline: "",
    details: "",
    options: ["", "", "", ""],
    correctOption: 0,
    marks: 5,
  };
}

export function createEmptyProgrammingDraft(): ProgrammingDraft {
  return {
    title: "",
    description: "",
    constraints: "",
    inputFormat: "",
    outputFormat: "",
    languages: PROGRAMMING_LANGUAGES,
    customTestcases: [{ input: "", output: "", isHidden: false }],
    marks: 20,
  };
}

export function formatDateTimeLabel(value: string, fallback: string) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return format(date, "dd MMM yy, HH:mm");
}

export function formatTimeValue(date: Date) {
  return format(date, "HH:mm");
}

export function toDateTimeLocalValue(date: Date) {
  // Always emit a full ISO-8601 UTC string so the server interprets the
  // timestamp identically regardless of the user's local timezone.
  return date.toISOString();
}

export function parseMcqQuestionText(question: string) {
  const parts = question
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return { headline: question.trim(), details: "" };
  }

  return {
    headline: parts[0],
    details: parts.slice(1).join("\n\n"),
  };
}

export function buildMcqQuestionText(headline: string, details: string) {
  return [headline.trim(), details.trim()].filter(Boolean).join("\n\n");
}

export function previewText(value?: string, fallback = "Untitled") {
  if (!value?.trim()) return fallback;
  const singleLine = value.replace(/\s+/g, " ").trim();
  return singleLine.length > 72 ? `${singleLine.slice(0, 72)}...` : singleLine;
}

export function isProblem(item: LibraryItem): item is Problem {
  return "title" in item;
}

export function questionTypeLabel(question: DraftQuestion) {
  return question.type === "programming" ? "DSA" : "MCQ";
}

export function questionPrimaryText(question: DraftQuestion) {
  return question.type === "programming"
    ? previewText(question.title, "Untitled programming question")
    : previewText(question.question, "Untitled MCQ");
}

export function getDateFromValue(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
