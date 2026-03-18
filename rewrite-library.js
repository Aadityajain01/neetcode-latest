const fs = require('fs');

const content = `"use client";

import { useEffect, useState } from "react";
import { Search, Trash2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DraftQuestion } from "./types";
import type { MCQ } from "@/lib/api-modules";
import { mcqApi } from "@/lib/api-modules";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PROGRAMMING_LANGUAGES = ["javascript", "python", "java", "c", "cpp", "csharp", "ruby", "go", "swift", "kotlin", "rust", "php", "typescript", "html", "css", "sql", "bash"];
const DIFFICULTIES = ["easy", "medium", "hard"];

export function LibraryMcqModal({
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
  
  const [libraryItems, setLibraryItems] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedQuestions, setSelectedQuestions] = useState<(DraftQuestion & { originalId: string })[]>([]);

  useEffect(() => {
    if (!open) return;
    const fetchLibrary = async () => {
      setLoading(true);
      try {
        const response = await mcqApi.getMCQs({
          language: language === "all" ? undefined : language,
          difficulty: difficulty === "all" ? undefined : difficulty,
          search: search || undefined,
          limit: 30,
        });
        setLibraryItems(response.mcqs || []);
      } catch (error) {
        toast.error("Failed to load library items");
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchLibrary, 300);
    return () => clearTimeout(timeout);
  }, [open, language, difficulty, search]);

  const handleAdd = (item: MCQ) => {
    if (selectedQuestions.some(q => q.originalId === item._id)) {
      toast.error("Question already selected");
      return;
    }
    
    setSelectedQuestions(prev => [
      ...prev,
      {
        originalId: item._id,
        type: "mcq",
        question: item.question,
        options: item.options,
        correctOption: item.correctOption || 0,
        marks: 5,
      }
    ]);
  };

  const handleRemove = (id: string) => {
    setSelectedQuestions(prev => prev.filter(q => q.originalId !== id));
  };

  const handleUpdateMarks = (id: string, marks: number) => {
    setSelectedQuestions(prev => 
      prev.map(q => q.originalId === id ? { ...q, marks } : q)
    );
  };

  const handleFinish = () => {
    const toReturn = selectedQuestions.map(({ originalId, ...rest }) => rest as DraftQuestion);
    onFinish(toReturn);
    setSelectedQuestions([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] w-[calc(100vw-2rem)] max-w-5xl border-zinc-800 bg-zinc-950 p-0 flex flex-col overflow-hidden text-zinc-200">
        <DialogTitle className="sr-only">Select Question from Library</DialogTitle>
        <DialogHeader className="border-b border-zinc-800 flex-shrink-0 bg-black/40 px-5 py-3 flex flex-row items-center justify-between space-y-0">
            <div className="flex gap-3 items-center w-full max-w-2xl">
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[160px] bg-black border-zinc-800 text-zinc-200">
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
                    <SelectTrigger className="w-[160px] bg-black border-zinc-800 text-zinc-200">
                        <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200 shadow-xl">
                        <SelectItem value="all" className="focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer">All Difficulties</SelectItem>
                        {DIFFICULTIES.map((diff) => (
                           <SelectItem key={diff} value={diff} className="focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer">{diff.charAt(0).toUpperCase() + diff.slice(1)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex items-center flex-1 border border-zinc-800 rounded-lg bg-black px-3 py-1.5 focus-within:border-zinc-600 transition-colors">
                    <Search className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
                    <Input 
                        placeholder="Search questions..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="p-0 border-none bg-transparent h-auto focus-visible:ring-0 text-zinc-200 placeholder:text-zinc-600 w-full shadow-none"
                    />
                </div>
            </div>
            
            <Button onClick={handleFinish} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px] ml-4 shrink-0 shadow-none border-none">
                Confirm
            </Button>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4 bg-zinc-950/50">
            
            {/* Upper: Fetched List */}
            <div className="flex-1 flex flex-col border border-zinc-800 rounded-xl bg-black overflow-hidden min-h-0">
                <div className="px-4 py-3 border-b border-zinc-800 font-semibold text-xs text-zinc-400 uppercase tracking-wider flex justify-between items-center bg-zinc-900/30">
                    <span>Available Questions</span>
                    {loading && <span className="text-[10px] text-zinc-500 animate-pulse">Loading...</span>}
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 flex flex-col gap-3">
                        {!loading && libraryItems.length === 0 ? (
                            <div className="text-center text-zinc-500 text-sm py-8 italic border border-dashed border-zinc-800 rounded-lg bg-zinc-900/10">No questions found.</div>
                        ) : (
                            libraryItems.map((item) => {
                                const isAdded = selectedQuestions.some(q => q.originalId === item._id);
                                return (
                                    <div key={item._id} className={cn("p-4 border rounded-xl flex justify-between items-center transition-all shadow-sm", isAdded ? "border-emerald-900/50 bg-emerald-950/10" : "border-zinc-800 bg-zinc-950 hover:border-zinc-700")}>
                                        <div className="flex flex-col gap-2 flex-1 min-w-0 pr-6 overflow-hidden">
                                            <div className="font-medium text-sm text-zinc-200 overflow-x-auto whitespace-nowrap custom-scrollbar pb-1 pr-4">{item.question.split('\\\\n')[0] || "Untitled"}</div>
                                            <div className="flex gap-2">
                                                <span className={cn("text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-bold", item.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-500" : item.difficulty === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500")}>
                                                    {item.difficulty}
                                                </span>
                                                {item.language && (
                                                  <span className="text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider font-bold bg-zinc-800 text-zinc-400">
                                                    {item.language}
                                                  </span>
                                                )}
                                            </div>
                                        </div>
                                        <Button 
                                            variant={isAdded ? "secondary" : "outline"}
                                            size="sm"
                                            disabled={isAdded}
                                            onClick={() => handleAdd(item)}
                                            className={cn("min-w-[100px] shrink-0", isAdded ? "opacity-70 bg-zinc-800/50 text-zinc-400 border-transparent" : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white")}
                                        >
                                            {isAdded ? <><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Added</> : "Add"}
                                        </Button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Lower: Selected Questions */}
            <div className="flex-1 flex flex-col border border-zinc-800 rounded-xl bg-black overflow-hidden min-h-0">
                <div className="px-4 py-3 border-b border-zinc-800 font-semibold text-xs text-zinc-400 uppercase tracking-wider bg-zinc-900/30">
                    Selected Questions ({selectedQuestions.length})
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 flex flex-col gap-3">
                        {selectedQuestions.length === 0 ? (
                            <div className="text-center text-zinc-500 text-sm py-8 italic border border-dashed border-zinc-800 rounded-lg bg-zinc-900/10">
                                No questions selected.
                            </div>
                        ) : (
                            selectedQuestions.map((q, i) => (
                                <div key={q.originalId} className="p-3 border border-zinc-800 rounded-xl bg-zinc-950 flex justify-between items-center shadow-sm group">
                                    <div className="font-medium text-sm text-zinc-300 flex-1 min-w-0 pr-4 overflow-x-auto whitespace-nowrap custom-scrollbar pb-1">
                                      <span className="text-zinc-500 mr-2">Q{i + 1}.</span> 
                                      {q.question?.split('\\\\n')[0]}
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="flex items-center gap-3 bg-black border border-zinc-800 px-3 py-1.5 rounded-xl">
                                            <span className="text-xs text-zinc-500 font-semibold">Marks:</span>
                                            <Input 
                                                type="number"
                                                min={1}
                                                className="w-16 h-7 text-sm font-bold bg-zinc-950 border-zinc-800 text-emerald-400 focus-visible:ring-emerald-500/50 shadow-none text-center"
                                                value={q.marks}
                                                onChange={(e) => handleUpdateMarks(q.originalId, Number(e.target.value))}
                                            />
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemove(q.originalId)} className="text-red-400/70 hover:bg-red-950/30 hover:text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
`;

fs.writeFileSync('C:/startup/Neetcode/neetcode-latest/src/components/communities/test-builder/LibraryMcqModal.tsx', content);
