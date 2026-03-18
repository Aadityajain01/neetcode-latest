"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildMcqQuestionText, createEmptyMcqDraft } from "./helpers";
import type { McqDraft, DraftQuestion } from "./types";
import { toast } from "sonner";
import { mcqApi } from "@/lib/api-modules";

const PROGRAMMING_LANGUAGES = ["javascript", "python", "java", "c", "cpp", "csharp", "ruby", "go", "swift", "kotlin", "rust", "php", "typescript", "html", "css", "sql", "bash"];
const DIFFICULTIES = ["easy", "medium", "hard"];

export function CreateMcqModal({
  open,
  onOpenChange,
  onFinish,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (questions: DraftQuestion[]) => void;
}) {
  const [createdQuestions, setCreatedQuestions] = useState<DraftQuestion[]>([]);
  const [draft, setDraft] = useState<McqDraft>(createEmptyMcqDraft());
  const [language, setLanguage] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const resetDraft = () => setDraft(createEmptyMcqDraft());

  const handleAddDraft = () => {
    const questionText = buildMcqQuestionText(draft.headline, draft.details);
    if (!questionText.trim()) {
      toast.error("Add the MCQ prompt before adding.");
      return;
    }
    if (draft.options.some((opt) => !opt.trim())) {
      toast.error("All MCQ options must be filled.");
      return;
    }

    const newQuestion: DraftQuestion = {
      type: "mcq",
      question: questionText,
      options: draft.options.map((o) => o.trim()),
      correctOption: draft.correctOption,
      marks: draft.marks,
    };

    setCreatedQuestions((prev) => [...prev, newQuestion]);
    resetDraft();
  };

  const handleRemove = (index: number) => {
    setCreatedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    onFinish(createdQuestions);
    setCreatedQuestions([]);
    resetDraft();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[calc(100vw-2rem)] max-w-5xl border-zinc-800 bg-zinc-950 p-0 flex flex-col overflow-hidden text-zinc-200">
        <DialogHeader className="border-b border-zinc-800 bg-zinc-900/20 px-6 py-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex gap-4 w-full items-center">
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[140px] bg-zinc-950 border-zinc-800">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                        <SelectItem className="focus:bg-zinc-900 focus:text-zinc-100" value="all">All Languages</SelectItem>
                        <SelectItem className="focus:bg-zinc-900 focus:text-zinc-100" value="javascript">JavaScript</SelectItem>
                        <SelectItem className="focus:bg-zinc-900 focus:text-zinc-100" value="python">Python</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="w-[140px] bg-zinc-950 border-zinc-800">
                        <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                        <SelectItem className="focus:bg-zinc-900 focus:text-zinc-100" value="all">All Difficulties</SelectItem>
                        <SelectItem className="focus:bg-zinc-900 focus:text-zinc-100" value="easy">Easy</SelectItem>
                        <SelectItem className="focus:bg-zinc-900 focus:text-zinc-100" value="medium">Medium</SelectItem>
                        <SelectItem className="focus:bg-zinc-900 focus:text-zinc-100" value="hard">Hard</SelectItem>
                    </SelectContent>
                </Select>

                <span className="text-sm font-semibold text-zinc-400 mr-auto ml-4">Create New Question</span>
            </div>
            
            <Button onClick={handleFinish} className="bg-emerald-600 hover:bg-emerald-600 text-white min-w-[100px]">
                Finish
            </Button>
        </DialogHeader>

        <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex flex-col gap-4 border border-zinc-800 bg-zinc-900/5 p-5 rounded-xl shadow-sm">
                <Textarea 
                    placeholder="Problem Title / Headline" 
                    className="bg-zinc-950 border-zinc-800 shrink-0 min-h-[80px]"
                    value={draft.headline}
                    onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
                />
                
                <div className="grid grid-cols-2 gap-4 shrink-0">
                  {draft.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div 
                           className={`w-5 h-5 rounded-full border-2 cursor-pointer flex-shrink-0 transition-colors ${draft.correctOption === i ? 'bg-emerald-600 border-emerald-600 ring-4 ring-emerald-600/20 ring-offset-1 ring-offset-background' : 'border-muted-foreground hover:border-emerald-600'}`}
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
                            className="bg-zinc-950 border-zinc-800 h-11"
                        />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-2 shrink-0">
                    <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg shadow-sm">
                        <span className="text-sm font-semibold text-zinc-400">Marks:</span>
                        <Input 
                            type="number" 
                            className="w-20 bg-transparent border-none h-8 p-0 focus-visible:ring-0 text-center font-bold text-lg" 
                            value={draft.marks} 
                            min={1}
                            onChange={(e) => setDraft({ ...draft, marks: Number(e.target.value) })}
                        />
                    </div>
                    <Button onClick={handleAddDraft} variant="secondary" className="px-8 font-semibold h-11">
                      Save / Add
                    </Button>
                </div>
            </div>

            <div className="mt-6 flex-1 min-h-0 bottom-0 border border-zinc-800 rounded-xl flex flex-col bg-zinc-900/5 shadow-sm">
                <div className="p-3 border-b border-zinc-800 font-semibold text-sm text-zinc-200 bg-zinc-900/20">
                  Created Questions ({createdQuestions.length})
                </div>
                <ScrollArea className="flex-1 p-4">
                    {createdQuestions.length === 0 ? (
                        <div className="text-center text-zinc-400 text-sm py-12 italic border border-dashed border-zinc-800/50 rounded-lg bg-zinc-950">
                            No questions added yet.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {createdQuestions.map((q, i) => (
                                <div key={i} className="p-4 border border-zinc-800 rounded-lg bg-zinc-950 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                                    <div className="overflow-x-auto whitespace-nowrap custom-scrollbar pb-1 max-w-[75%] font-medium text-sm text-zinc-200">
                                      {q.question?.split('\n')[0] || "Untitled Question"}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold bg-emerald-600 text-emerald-500 px-3 py-1.5 rounded-full border border-emerald-600/20">
                                          {q.marks} Pts
                                        </span>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemove(i)} className="text-destructive opacity-70 hover:opacity-100 hover:bg-destructive/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}