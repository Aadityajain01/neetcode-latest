"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildMcqQuestionText, createEmptyMcqDraft, parseMcqQuestionText } from "./helpers";
import type { McqDraft, DraftQuestion } from "./types";
import { toast } from "sonner";
import { mcqApi } from "@/lib/api-modules";

const EMERALD_SCROLLBAR = "[scrollbar-color:rgba(16,185,129,0.45)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-500/40 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/60";

export function CreateMcqModal({
  open,
  onOpenChange,
  onFinish,
  editingQuestion,
  onSaveEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (questions: DraftQuestion[]) => void;
  editingQuestion?: DraftQuestion | null;
  onSaveEdit?: (question: DraftQuestion) => void;
}) {
  const [createdQuestions, setCreatedQuestions] = useState<DraftQuestion[]>([]);
  const [draft, setDraft] = useState<McqDraft>(createEmptyMcqDraft());
  const [language, setLanguage] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [meta, setMeta] = useState<{ languages: string[]; difficulties: string[] }>({
    languages: [],
    difficulties: [],
  });
  const isEditing = !!editingQuestion && editingQuestion.type === "mcq";

  useEffect(() => {
    if (!open) return;

    mcqApi
      .getMeta()
      .then((res) => setMeta(res.data))
      .catch(() => {
        setMeta({ languages: [], difficulties: [] });
      });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!isEditing || !editingQuestion || editingQuestion.type !== "mcq") return;

    const parsed = parseMcqQuestionText(editingQuestion.question || "");
    setDraft({
      headline: parsed.headline,
      details: parsed.details,
      options: editingQuestion.options?.length ? [...editingQuestion.options] : ["", "", "", ""],
      correctOption: editingQuestion.correctOption ?? 0,
      marks: editingQuestion.marks ?? 5,
    });
  }, [open, isEditing, editingQuestion]);

  const resetDraft = () => setDraft(createEmptyMcqDraft());

  const buildQuestionFromDraft = (): DraftQuestion | null => {
    const questionText = buildMcqQuestionText(draft.headline, draft.details);
    if (!questionText.trim()) {
      toast.error("Add the MCQ prompt before saving.");
      return null;
    }
    if (draft.options.some((opt) => !opt.trim())) {
      toast.error("All MCQ options must be filled.");
      return null;
    }

    return {
      type: "mcq",
      question: questionText,
      options: draft.options.map((o) => o.trim()),
      correctOption: draft.correctOption,
      marks: draft.marks,
    };
  };

  const handleSaveDraft = () => {
    const nextQuestion = buildQuestionFromDraft();
    if (!nextQuestion) return;

    if (isEditing && onSaveEdit) {
      onSaveEdit(nextQuestion);
      onOpenChange(false);
      resetDraft();
      return;
    }

    setCreatedQuestions((prev) => [...prev, nextQuestion]);
    resetDraft();
  };

  const handleRemove = (index: number) => {
    setCreatedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    if (isEditing) {
      onOpenChange(false);
      return;
    }

    onFinish(createdQuestions);
    setCreatedQuestions([]);
    resetDraft();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[92vh] w-[96vw] min-w-[840px] max-w-[1180px] border-zinc-800 bg-zinc-950 p-0 flex flex-col overflow-hidden text-zinc-200 max-md:min-w-0">
        <DialogHeader className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex gap-4 w-full items-center min-w-0 pr-3">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[170px] bg-zinc-950 border-zinc-800">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                <SelectItem className="focus:bg-zinc-900 focus:text-zinc-100" value="all">All Languages</SelectItem>
                {meta.languages.map((lang) => (
                  <SelectItem className="focus:bg-zinc-900 focus:text-zinc-100" key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[170px] bg-zinc-950 border-zinc-800">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                <SelectItem className="focus:bg-zinc-900 focus:text-zinc-100" value="all">All Difficulties</SelectItem>
                {meta.difficulties.map((diff) => (
                  <SelectItem className="focus:bg-zinc-900 focus:text-zinc-100" key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm font-semibold text-zinc-400 mr-auto ml-2">
              {isEditing ? "Edit Question" : "Create New Question"}
            </span>
          </div>

          <Button
            onClick={handleFinish}
            disabled={!isEditing && createdQuestions.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[110px] h-10 disabled:opacity-40"
          >
            {isEditing ? "Close" : "Finish"}
          </Button>
        </DialogHeader>

        <div className={"flex-1 min-h-0 p-4 overflow-y-auto " + EMERALD_SCROLLBAR}>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
            <div className="grid grid-cols-[minmax(0,1fr)_120px_120px] gap-3 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/40 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
              <div>Editor</div>
              <div>Correct</div>
              <div>Marks</div>
            </div>

            <div className="p-4 space-y-4">
              <Textarea
                placeholder="Problem Title / Headline"
                className="bg-zinc-950 border-zinc-800 min-h-[92px]"
                value={draft.headline}
                onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
              />

              <Textarea
                placeholder="Optional details / explanation"
                className="bg-zinc-950 border-zinc-800 min-h-[96px]"
                value={draft.details}
                onChange={(e) => setDraft({ ...draft, details: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                {draft.options.map((opt, i) => (
                  <div key={i} className="grid grid-cols-[24px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-2.5">
                    <div
                      className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-colors ${draft.correctOption === i ? "bg-emerald-600 border-emerald-600 ring-4 ring-emerald-600/20 ring-offset-1 ring-offset-background" : "border-muted-foreground hover:border-emerald-600"}`}
                      onClick={() => setDraft({ ...draft, correctOption: i })}
                    />
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...draft.options];
                        newOpts[i] = e.target.value;
                        setDraft({ ...draft, options: newOpts });
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="bg-zinc-950 border-zinc-800 h-10"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg shadow-sm">
                  <span className="text-sm font-semibold text-zinc-400">Marks:</span>
                  <Input
                    type="number"
                    className="w-20 bg-transparent border-none h-8 p-0 focus-visible:ring-0 text-center font-bold text-lg"
                    value={draft.marks}
                    min={1}
                    onChange={(e) => setDraft({ ...draft, marks: Number(e.target.value) })}
                  />
                </div>
                <Button onClick={handleSaveDraft} variant="secondary" className="px-8 font-semibold h-10 bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                  {isEditing ? "Save Changes" : "Save / Add"}
                </Button>
              </div>
            </div>
          </div>

          {!isEditing && (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
              <div className="p-3 border-b border-zinc-800 font-semibold text-sm text-zinc-200 bg-zinc-900/20">
                Created Questions ({createdQuestions.length})
              </div>

              <div className="grid grid-cols-[56px_minmax(0,1fr)_84px_56px] gap-3 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/30 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                <div>#</div>
                <div>Question</div>
                <div>Marks</div>
                <div className="text-right">Del</div>
              </div>

              <div className={"max-h-[260px] overflow-y-auto overflow-x-hidden p-2 " + EMERALD_SCROLLBAR}>
                {createdQuestions.length === 0 ? (
                  <div className="text-center text-zinc-400 text-sm py-12 italic border border-dashed border-zinc-800/50 rounded-lg bg-zinc-950">
                    No questions added yet.
                  </div>
                ) : (
                  createdQuestions.map((q, i) => (
                    <div key={i} className="grid grid-cols-[56px_minmax(0,1fr)_84px_56px] gap-3 items-center px-2 py-2.5 border-b border-zinc-800/60 last:border-b-0 hover:bg-zinc-900/20 rounded-md">
                      <div className="text-zinc-500 text-sm">{i + 1}</div>
                      <div className="overflow-x-auto whitespace-nowrap pb-1 text-zinc-200 text-sm">
                        {q.question?.split("\n")[0] || "Untitled Question"}
                      </div>
                      <div className="text-emerald-400 font-semibold text-sm">{q.marks}</div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleRemove(i)} className="h-8 w-8 text-red-400/80 hover:text-red-400 hover:bg-red-950/30">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
