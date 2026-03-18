"use client";

import { CheckCircle2, PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  parseMcqQuestionText,
  previewText,
  questionPrimaryText,
  questionTypeLabel,
} from "./helpers";
import type { DraftQuestion } from "./types";

export function QuestionCard({
  question,
  index,
  onEdit,
  onRemove,
}: {
  question: DraftQuestion;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-[20px] border border-zinc-800 bg-black p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-zinc-400">
              Question {index + 1}
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-300">
              {questionTypeLabel(question)}
            </span>
          </div>
          <p className="mt-3 text-base font-medium text-white">
            {questionPrimaryText(question)}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {question.type === "programming"
              ? previewText(
                  question.description,
                  "Programming question description"
                )
              : previewText(
                  parseMcqQuestionText(question.question || "").details,
                  "Question prompt and options are editable."
                )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start">
          <div className="rounded-[16px] border border-zinc-800 bg-zinc-950 px-3 py-2 text-right">
            <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Marks
            </div>
            <div className="mt-1 text-sm font-semibold text-white">
              {question.marks || 0}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-9 w-9 rounded-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            <PencilLine className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-9 w-9 rounded-sm text-zinc-400 hover:bg-zinc-900 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-[16px] border border-zinc-800 bg-zinc-950 px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Summary
          </div>
          <div className="mt-2 text-sm text-zinc-300">
            {question.type === "programming"
              ? `${question.customTestcases?.length || 0} custom test case(s)`
              : `${question.options?.length || 0} options`}
          </div>
        </div>

        <div className="rounded-[16px] border border-zinc-800 bg-zinc-950 px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Source
          </div>
          <div className="mt-2 text-sm text-zinc-300">
            {question.problemId ? "Question library" : "Custom builder"}
          </div>
        </div>

        <div className="rounded-[16px] border border-zinc-800 bg-zinc-950 px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Ready
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Editable from this list
          </div>
        </div>
      </div>
    </div>
  );
}
