"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  createEmptyProgrammingDraft,
  previewText,
} from "./helpers";
import {
  PROGRAMMING_LANGUAGES,
  type DraftQuestion,
  type ProgrammingDraft,
  type TestCaseDraft,
} from "./types";
import { toast } from "sonner";

const EMERALD_SCROLLBAR = "[scrollbar-color:rgba(16,185,129,0.45)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-500/40 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/60";

export function CreateProgrammingModal({
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
  const [draft, setDraft] = useState<ProgrammingDraft>(createEmptyProgrammingDraft());

  const isEditing = !!editingQuestion && editingQuestion.type === "programming";

  useEffect(() => {
    if (!open) return;
    if (!isEditing || !editingQuestion || editingQuestion.type !== "programming") return;

    setDraft({
      problemId: editingQuestion.problemId,
      title: editingQuestion.title || "",
      description: editingQuestion.description || "",
      constraints: editingQuestion.constraints || "",
      inputFormat: editingQuestion.inputFormat || "",
      outputFormat: editingQuestion.outputFormat || "",
      languages: editingQuestion.languages?.length
        ? [...editingQuestion.languages]
        : PROGRAMMING_LANGUAGES,
      customTestcases: editingQuestion.customTestcases?.length
        ? editingQuestion.customTestcases.map((tc) => ({
            input: tc.input || "",
            output: tc.output || "",
            isHidden: !!tc.isHidden,
          }))
        : [{ input: "", output: "", isHidden: false }],
      marks: editingQuestion.marks ?? 20,
    });
  }, [open, isEditing, editingQuestion]);

  const resetDraft = () => setDraft(createEmptyProgrammingDraft());

  const updateTestcase = (index: number, key: keyof TestCaseDraft, value: string | boolean) => {
    setDraft((prev) => {
      const next = [...prev.customTestcases];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, customTestcases: next };
    });
  };

  const addTestcaseRow = () => {
    setDraft((prev) => ({
      ...prev,
      customTestcases: [...prev.customTestcases, { input: "", output: "", isHidden: false }],
    }));
  };

  const removeTestcaseRow = (index: number) => {
    setDraft((prev) => {
      const next = prev.customTestcases.filter((_, i) => i !== index);
      return {
        ...prev,
        customTestcases: next.length ? next : [{ input: "", output: "", isHidden: false }],
      };
    });
  };

  const toggleLanguage = (lang: string) => {
    setDraft((prev) => {
      const exists = prev.languages.includes(lang);
      if (exists) {
        const next = prev.languages.filter((l) => l !== lang);
        return { ...prev, languages: next.length ? next : [lang] };
      }
      return { ...prev, languages: [...prev.languages, lang] };
    });
  };

  const buildQuestionFromDraft = (): DraftQuestion | null => {
    if (!draft.title.trim() || !draft.description.trim()) {
      toast.error("Title and description are required.");
      return null;
    }

    const invalidTc = draft.customTestcases.some(
      (tc) => !tc.input.trim() || !tc.output.trim()
    );
    if (invalidTc) {
      toast.error("Each test case must include both input and expected output.");
      return null;
    }

    return {
      type: "programming",
      problemId: draft.problemId,
      title: draft.title.trim(),
      description: draft.description.trim(),
      constraints: draft.constraints.trim(),
      inputFormat: draft.inputFormat.trim(),
      outputFormat: draft.outputFormat.trim(),
      languages: draft.languages,
      customTestcases: draft.customTestcases,
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

  const handleRemoveCreated = (index: number) => {
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
      <DialogContent className="h-[92vh] w-[96vw] min-w-[900px] max-w-[1240px] border-zinc-800 bg-zinc-950 p-0 flex flex-col overflow-hidden text-zinc-200 max-md:min-w-0">
        <DialogHeader className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex flex-row items-center justify-between space-y-0">
          <span className="text-sm font-semibold text-zinc-400">
            {isEditing ? "Edit Programming Question" : "Create Programming Question"}
          </span>

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
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <Input
                  placeholder="Problem Title"
                  className="bg-zinc-950 border-zinc-800 h-10"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg">
                  <span className="text-sm font-semibold text-zinc-400">Marks:</span>
                  <Input
                    type="number"
                    min={1}
                    value={draft.marks}
                    onChange={(e) => setDraft({ ...draft, marks: Number(e.target.value) })}
                    className="w-20 bg-transparent border-none h-8 p-0 focus-visible:ring-0 text-center font-bold text-lg"
                  />
                </div>
              </div>

              <Textarea
                placeholder="Problem Description"
                className="bg-zinc-950 border-zinc-800 min-h-[120px]"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />

              <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
                <Textarea
                  placeholder="Constraints"
                  className="bg-zinc-950 border-zinc-800 min-h-[90px]"
                  value={draft.constraints}
                  onChange={(e) => setDraft({ ...draft, constraints: e.target.value })}
                />
                <Textarea
                  placeholder="Input Format"
                  className="bg-zinc-950 border-zinc-800 min-h-[90px]"
                  value={draft.inputFormat}
                  onChange={(e) => setDraft({ ...draft, inputFormat: e.target.value })}
                />
                <Textarea
                  placeholder="Output Format"
                  className="bg-zinc-950 border-zinc-800 min-h-[90px]"
                  value={draft.outputFormat}
                  onChange={(e) => setDraft({ ...draft, outputFormat: e.target.value })}
                />
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <div className="text-xs uppercase tracking-[0.1em] text-zinc-500 font-semibold mb-2">
                  Language Constraints
                </div>
                <div className="flex flex-wrap gap-2">
                  {PROGRAMMING_LANGUAGES.map((lang) => {
                    const active = draft.languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className={active
                          ? "px-3 py-1.5 rounded-md text-xs uppercase tracking-wide font-semibold bg-emerald-600/20 border border-emerald-500/40 text-emerald-400"
                          : "px-3 py-1.5 rounded-md text-xs uppercase tracking-wide font-semibold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden">
                <div className="px-3 py-2.5 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.1em] text-zinc-500 font-semibold">Custom Test Cases</span>
                  <Button type="button" variant="outline" size="sm" onClick={addTestcaseRow} className="h-8 border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800">
                    <Plus className="h-4 w-4 mr-1" /> Add Row
                  </Button>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_86px_52px] gap-2 px-3 py-2 text-[11px] uppercase tracking-wide text-zinc-500 border-b border-zinc-800">
                  <div>Input</div>
                  <div>Expected Output</div>
                  <div>Hidden</div>
                  <div></div>
                </div>

                <div className="max-h-[260px] overflow-y-auto overflow-x-hidden">
                  {draft.customTestcases.map((tc, i) => (
                    <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_86px_52px] gap-2 px-3 py-2 border-b border-zinc-800/60 last:border-b-0 items-center">
                      <Input
                        placeholder="Input"
                        className="bg-zinc-950 border-zinc-800 h-9"
                        value={tc.input}
                        onChange={(e) => updateTestcase(i, "input", e.target.value)}
                      />
                      <Input
                        placeholder="Expected output"
                        className="bg-zinc-950 border-zinc-800 h-9"
                        value={tc.output}
                        onChange={(e) => updateTestcase(i, "output", e.target.value)}
                      />
                      <div className="flex items-center justify-center">
                        <Switch
                          checked={tc.isHidden}
                          onCheckedChange={(checked) => updateTestcase(i, "isHidden", checked)}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeTestcaseRow(i)} className="h-8 w-8 text-red-400/80 hover:text-red-400 hover:bg-red-950/30">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveDraft} className="px-8 font-semibold h-10 bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                  {isEditing ? "Save Changes" : "Save / Add"}
                </Button>
              </div>
            </div>
          </div>

          {!isEditing && (
            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
              <div className="p-3 border-b border-zinc-800 font-semibold text-sm text-zinc-200 bg-zinc-900/20">
                Created Programming Questions ({createdQuestions.length})
              </div>

              <div className="max-h-[220px] overflow-y-auto overflow-x-hidden">
                {createdQuestions.length === 0 ? (
                  <div className="text-center text-zinc-400 text-sm py-10 italic border border-dashed border-zinc-800/50 rounded-lg bg-zinc-950 m-3">
                    No programming questions added yet.
                  </div>
                ) : (
                  createdQuestions.map((q, i) => (
                    <div key={i} className="grid grid-cols-[56px_minmax(0,1fr)_84px_56px] gap-3 items-center px-3 py-2.5 border-b border-zinc-800/60 last:border-b-0 hover:bg-zinc-900/20">
                      <div className="text-zinc-500 text-sm">{i + 1}</div>
                      <div className="overflow-x-auto whitespace-nowrap pb-1 text-zinc-200 text-sm">
                        {previewText(q.title, "Untitled programming question")}
                      </div>
                      <div className="text-emerald-400 font-semibold text-sm">{q.marks}</div>
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveCreated(i)} className="h-8 w-8 text-red-400/80 hover:text-red-400 hover:bg-red-950/30">
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
