"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Trash2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DraftQuestion } from "./types";
import { PROGRAMMING_LANGUAGES } from "./types";
import type { Problem } from "@/lib/api-modules";
import { problemApi } from "@/lib/api-modules";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BRAND_SCROLLBAR = "[scrollbar-color:rgba(255,106,31,0.45)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-brand-500/40 hover:[&::-webkit-scrollbar-thumb]:bg-brand-500/60";
const DIFFICULTIES = ["all", "easy", "medium", "hard"];

export function LibraryProgrammingModal({
  open,
  onOpenChange,
  onFinish,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (questions: DraftQuestion[]) => void;
}) {
  const [language, setLanguage] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [search, setSearch] = useState("");

  const [libraryItems, setLibraryItems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedQuestions, setSelectedQuestions] = useState<(DraftQuestion & { originalId: string })[]>([]);

  useEffect(() => {
    if (!open) return;

    const fetchLibrary = async () => {
      setLoading(true);
      try {
        const response = await problemApi.getProblems({
          type: "dsa",
          difficulty: difficulty === "all" ? undefined : difficulty,
          search: search || undefined,
          limit: 30,
        });
        setLibraryItems(response.problems || []);
      } catch {
        toast.error("Failed to load programming problems");
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchLibrary, 300);
    return () => clearTimeout(timeout);
  }, [open, difficulty, search]);

  const filteredItems = useMemo(() => {
    if (language === "all") return libraryItems;
    return libraryItems.filter((item) => item.languages?.includes(language));
  }, [libraryItems, language]);

  const handleAdd = (item: Problem) => {
    if (selectedQuestions.some((q) => q.originalId === item._id)) {
      toast.error("Problem already selected");
      return;
    }

    setSelectedQuestions((prev) => [
      ...prev,
      {
        originalId: item._id,
        type: "programming",
        problemId: item._id,
        title: item.title,
        description: item.description,
        constraints: "",
        inputFormat: "",
        outputFormat: "",
        languages: item.languages?.length ? item.languages : PROGRAMMING_LANGUAGES,
        customTestcases: [{ input: "", output: "", isHidden: false }],
        marks: 20,
      },
    ]);
  };

  const handleRemove = (id: string) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.originalId !== id));
  };

  const handleUpdateMarks = (id: string, marks: number) => {
    setSelectedQuestions((prev) => prev.map((q) => (q.originalId === id ? { ...q, marks } : q)));
  };

  const handleFinish = () => {
    const toReturn = selectedQuestions.map(({ originalId, ...rest }) => rest as DraftQuestion);
    onFinish(toReturn);
    setSelectedQuestions([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[92vh] w-[96vw] min-w-[820px] max-w-[1220px] border-zinc-800 bg-zinc-950 p-0 flex flex-col overflow-hidden text-zinc-200 max-md:min-w-0">
        <DialogTitle className="sr-only">Select Programming Questions from Library</DialogTitle>

        <DialogHeader className="border-b border-zinc-800 flex-shrink-0 bg-zinc-950 px-5 py-2 flex flex-row items-center justify-between space-y-0">
          <div className="flex gap-3 items-center flex-1 min-w-0 pr-3">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[170px] bg-zinc-950 border-zinc-800 text-zinc-200">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200 shadow-xl">
                <SelectItem value="all" className="focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer">All Languages</SelectItem>
                {PROGRAMMING_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang} className="focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer">{lang.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[170px] bg-zinc-950 border-zinc-800 text-zinc-200">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200 shadow-xl">
                {DIFFICULTIES.map((diff) => (
                  <SelectItem key={diff} value={diff} className="focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer">
                    {diff === "all" ? "All Difficulties" : diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center flex-1 border border-zinc-800 rounded-lg bg-zinc-950 px-3 py-1.5 focus-within:border-zinc-600 transition-colors">
              <Search className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
              <Input
                placeholder="Search programming problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-0 border-none bg-transparent h-auto focus-visible:ring-0 text-zinc-200 placeholder:text-zinc-600 w-full shadow-none"
              />
            </div>
          </div>

          <Button onClick={handleFinish} className="bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold min-w-[120px] h-10 shrink-0 shadow-none border-none mr-6">
            Confirm
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-zinc-950/50 -mt-4">
          <div className="h-full overflow-hidden border border-zinc-800 bg-zinc-950/60 flex flex-col">
            <div className="px-4 py-3 border-b border-zinc-800 font-semibold text-xs text-zinc-400 uppercase tracking-wider flex justify-between items-center bg-zinc-900/30 shrink-0">
              <span>Available Programming Questions</span>
              {loading && <span className="text-[10px] text-zinc-500 animate-pulse">Loading...</span>}
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_220px_108px] gap-3 px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/80 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500 shrink-0">
              <div>Problem</div>
              <div>Meta</div>
              <div className="text-right">Action</div>
            </div>

            <div className={cn("flex-1 min-h-[230px] overflow-y-auto overflow-x-hidden", BRAND_SCROLLBAR)}>
              {!loading && filteredItems.length === 0 ? (
                <div className="mx-4 my-4 text-center text-zinc-500 text-sm py-10 italic border border-dashed border-zinc-800 rounded-lg bg-zinc-900/10">No problems found.</div>
              ) : (
                filteredItems.map((item) => {
                  const isAdded = selectedQuestions.some((q) => q.originalId === item._id);
                  return (
                    <div key={item._id} className="grid grid-cols-[minmax(0,1fr)_220px_108px] gap-3 px-4 py-3 border-b border-zinc-800/60 last:border-b-0 items-center hover:bg-zinc-900/30 transition-colors">
                      <div className="min-w-0 overflow-x-auto whitespace-nowrap pb-1">
                        <span className="font-medium text-sm text-zinc-200">{item.title}</span>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {item.difficulty && (
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-bold", item.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-500" : item.difficulty === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500")}>
                            {item.difficulty}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-bold bg-zinc-800 text-zinc-400">{(item.languages || []).join(", ") || "N/A"}</span>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isAdded}
                          onClick={() => handleAdd(item)}
                          className={cn("h-8 min-w-[92px]", isAdded ? "opacity-70 border-brand-500/30 bg-brand-500/10 text-brand-500 font-bold" : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800")}
                        >
                          {isAdded ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1.5 text-brand-500" />
                              Added
                            </>
                          ) : (
                            "Add"
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-zinc-800 shrink-0">
              <div className="px-4 py-3 border-b border-zinc-800 font-semibold text-xs text-zinc-400 uppercase tracking-wider bg-zinc-900/30">
                Selected Questions ({selectedQuestions.length})
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_120px_56px] gap-3 px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/80 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                <div>Problem</div>
                <div>Marks</div>
                <div className="text-right">Remove</div>
              </div>

              <div className={cn("max-h-[230px] overflow-y-auto overflow-x-hidden", BRAND_SCROLLBAR)}>
                {selectedQuestions.length === 0 ? (
                  <div className="mx-4 my-4 text-center text-zinc-500 text-sm py-8 italic border border-dashed border-zinc-800 rounded-lg bg-zinc-900/10">
                    No programming questions selected.
                  </div>
                ) : (
                  selectedQuestions.map((q, i) => (
                    <div key={q.originalId} className="grid grid-cols-[minmax(0,1fr)_120px_56px] gap-3 px-4 py-3 border-b border-zinc-800/60 last:border-b-0 items-center hover:bg-zinc-900/20 transition-colors">
                      <div className="min-w-0 overflow-x-auto whitespace-nowrap pb-1">
                        <span className="text-zinc-500 mr-2">Q{i + 1}.</span>
                        <span className="font-medium text-sm text-zinc-300">{q.title || "Untitled"}</span>
                      </div>

                      <Input
                        type="number"
                        min={1}
                        className="h-8 w-[96px] text-sm font-semibold bg-zinc-950 border-zinc-800 text-brand-500 focus-visible:ring-brand-500/40"
                        value={q.marks}
                        onChange={(e) => handleUpdateMarks(q.originalId, Number(e.target.value))}
                      />

                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(q.originalId)}
                          className="h-8 w-8 text-red-400/70 hover:bg-red-950/30 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
