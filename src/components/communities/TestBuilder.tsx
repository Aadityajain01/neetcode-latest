"use client";

import { useEffect, useMemo, useState } from "react";
import { useCommunity } from "./CommunityContext";
import { communityApi, mcqApi, problemApi } from "@/lib/api-modules";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CreateMcqModal } from "./test-builder/CreateMcqModal";
import { LibraryMcqModal } from "./test-builder/LibraryMcqModal";
import { DateTimePopoverField } from "./test-builder/DateTimePopoverField";
import { QuestionCard } from "./test-builder/QuestionCard";
import {
  buildMcqQuestionText,
  createEmptyMcqDraft,
  createEmptyProgrammingDraft,
  getDateFromValue,
  parseMcqQuestionText,
} from "./test-builder/helpers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PROGRAMMING_LANGUAGES,
  type DraftQuestion,
  type AddPopoverView,
  type CustomQuestionMode,
  type LibraryItem,
  type LibraryType,
  type McqDraft,
  type ProgrammingDraft,
} from "./test-builder/types";

export function TestBuilder({ onTestCreated }: { onTestCreated: () => void }) {
  const { community } = useCommunity();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    durationMinutes: 60,
    isResultVisible: false,
  });
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);

  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [addPopoverView, setAddPopoverView] = useState<AddPopoverView>("menu");
  const [customMode, setCustomMode] = useState<CustomQuestionMode>("mcq");
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(
    null
  );

  const [mcqDraft, setMcqDraft] = useState<McqDraft>(createEmptyMcqDraft());
  const [programmingDraft, setProgrammingDraft] = useState<ProgrammingDraft>(
    createEmptyProgrammingDraft()
  );

  const [libraryType, setLibraryType] = useState<LibraryType>("mcq");
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryLanguage, setLibraryLanguage] = useState("all");
  const [libraryDifficulty, setLibraryDifficulty] = useState("all");

  const totalMarks = useMemo(
    () => questions.reduce((sum, question) => sum + Number(question.marks || 0), 0),
    [questions]
  );

  const derivedType = useMemo(() => {
    const hasMcq = questions.some((question) => question.type === "mcq");
    const hasProgramming = questions.some(
      (question) => question.type === "programming"
    );

    if (hasMcq && hasProgramming) return "mixed";
    if (hasProgramming) return "programming";
    return "mcq";
  }, [questions]);

  useEffect(() => {
    if (
      !open ||
      !addPopoverOpen ||
      addPopoverView !== "library" ||
      !libraryType
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      void fetchLibrary();
    }, 250);

    return () => clearTimeout(timeout);
  }, [
    open,
    addPopoverOpen,
    addPopoverView,
    libraryType,
    librarySearch,
    libraryLanguage,
    libraryDifficulty,
  ]);

  const resetCustomDrafts = () => {
    setCustomMode("mcq");
    setMcqDraft(createEmptyMcqDraft());
    setProgrammingDraft(createEmptyProgrammingDraft());
    setEditingQuestionIndex(null);
  };

  const resetLibraryState = () => {
    setLibraryType("mcq");
    setLibraryItems([]);
    setLibrarySearch("");
    setLibraryLanguage("all");
    setLibraryDifficulty("all");
  };

  const resetPopoverState = () => {
    setAddPopoverOpen(false);
    setAddPopoverView("menu");
    resetCustomDrafts();
    resetLibraryState();
  };

  const resetBuilder = () => {
    setForm({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      durationMinutes: 60,
      isResultVisible: false,
    });
    setQuestions([]);
    setLoading(false);
    resetPopoverState();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetBuilder();
    }
  };

  const fetchLibrary = async () => {
    setLibraryLoading(true);
    try {
      if (libraryType === "mcq") {
        const response = await mcqApi.getMCQs({
          language: libraryLanguage === "all" ? undefined : libraryLanguage,
          difficulty: libraryDifficulty === "all" ? undefined : libraryDifficulty,
          search: librarySearch || undefined,
          limit: 20,
        });
        setLibraryItems(response.mcqs || []);
        return;
      }

      const response = await problemApi.getProblems({
        type: "dsa",
        difficulty: libraryDifficulty === "all" ? undefined : libraryDifficulty,
        search: librarySearch || undefined,
        limit: 20,
      });
      setLibraryItems(response.problems || []);
    } catch {
      toast.error("Failed to load library items");
    } finally {
      setLibraryLoading(false);
    }
  };

  const openCustomBuilder = (mode: CustomQuestionMode, index?: number) => {
    setAddPopoverOpen(false);
    setCreateModalOpen(true);
  };

  const openLibraryBuilder = () => {
    setAddPopoverOpen(false);
    setLibraryModalOpen(true);
  };

  const upsertQuestion = (nextQuestion: DraftQuestion) => {
    setQuestions((prev) => {
      if (editingQuestionIndex === null) {
        return [...prev, nextQuestion];
      }

      const next = [...prev];
      next[editingQuestionIndex] = nextQuestion;
      return next;
    });
  };

  const saveCustomQuestion = () => {
    if (customMode === "mcq") {
      const questionText = buildMcqQuestionText(mcqDraft.headline, mcqDraft.details);
      if (!questionText.trim()) {
        toast.error("Add the MCQ prompt before saving");
        return;
      }

      if (mcqDraft.options.some((option) => !option.trim())) {
        toast.error("All MCQ options must be filled");
        return;
      }

      upsertQuestion({
        type: "mcq",
        question: questionText,
        options: mcqDraft.options.map((option) => option.trim()),
        correctOption: mcqDraft.correctOption,
        marks: mcqDraft.marks,
      });

      toast.success(
        editingQuestionIndex === null ? "MCQ added to test" : "MCQ updated"
      );
      resetPopoverState();
      return;
    }

    if (!programmingDraft.title.trim() || !programmingDraft.description.trim()) {
      toast.error("Add the programming question title and description");
      return;
    }

    upsertQuestion({
      type: "programming",
      problemId: programmingDraft.problemId,
      title: programmingDraft.title.trim(),
      description: programmingDraft.description.trim(),
      constraints: programmingDraft.constraints.trim(),
      inputFormat: programmingDraft.inputFormat.trim(),
      outputFormat: programmingDraft.outputFormat.trim(),
      languages: programmingDraft.languages.length
        ? programmingDraft.languages
        : PROGRAMMING_LANGUAGES,
      customTestcases: programmingDraft.customTestcases.length
        ? programmingDraft.customTestcases
        : [{ input: "", output: "", isHidden: false }],
      marks: programmingDraft.marks,
    });

    toast.success(
      editingQuestionIndex === null
        ? "Programming question added"
        : "Programming question updated"
    );
    resetPopoverState();
  };

  const addFromLibrary = (item: LibraryItem) => {
    if (libraryType === "mcq" && "question" in item) {
      upsertQuestion({
        type: "mcq",
        question: item.question,
        options: item.options,
        correctOption: item.correctOption || 0,
        marks: 5,
      });
      toast.success("Question added from library");
      resetPopoverState();
      return;
    }

    if (libraryType === "programming" && "title" in item) {
      upsertQuestion({
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
      });
      toast.success("Question added from library");
      resetPopoverState();
    }
  };

  const handleCreate = async () => {
    if (!community) return;

    if (!form.title || !form.startTime || !form.endTime) {
      toast.error("Fill the basic test details first");
      return;
    }

    if (new Date(form.endTime) <= new Date(form.startTime)) {
      toast.error("End date must be after start date");
      return;
    }

    if (questions.length === 0) {
      toast.error("Add at least one question");
      return;
    }

    setLoading(true);
    try {
      await communityApi.createTest(community._id, {
        ...form,
        type: derivedType,
        questions,
      });

      toast.success("Test created successfully");
      handleOpenChange(false);
      onTestCreated();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create test";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-12 rounded-full border border-zinc-800 bg-zinc-900/80 px-5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            Create Test
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-zinc-800 text-zinc-200 shadow-xl">
          <DropdownMenuItem onClick={() => setOpen(true)} className="cursor-pointer focus:bg-zinc-900 focus:text-zinc-100 focus:bg-zinc-900 focus:text-zinc-100 font-medium">
            MCQ
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="opacity-50">
            Programming
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="opacity-50">
            Mixed
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="h-[90vh] w-[calc(100vw-2rem)] max-w-[1200px] gap-0 overflow-hidden border-zinc-800 bg-zinc-950 p-0 text-zinc-200 md:min-w-[760px] flex flex-col">
        <DialogHeader className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4">
          <DialogTitle className="text-xl font-bold flex gap-4 text-zinc-200 items-center">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Test name"
              className="max-w-[200px] h-8 bg-transparent border-transparent hover:border-zinc-800 focus:border-primary px-2"
            />
            <DateTimePopoverField
              label="Start date"
              value={form.startTime}
              onChange={(val) => setForm({ ...form, startTime: val })}
            />
            <DateTimePopoverField
              label="End date"
              value={form.endTime}
              onChange={(val) => setForm({ ...form, endTime: val })}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 whitespace-nowrap">Time allowed:</span>
              <Input
                 type="number"
                 className="w-20 h-8"
                 value={form.durationMinutes}
                 onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
              />
            </div>
            <div className="ml-auto">
               <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20">Category: MCQ</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full flex-col px-6 py-6 overflow-hidden">
          {/* Main Content / Canvas */}
          <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/10 flex flex-col overflow-hidden relative">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
               <h3 className="font-semibold text-zinc-200">Added Questions ({questions.length})</h3>
               <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
                 <PopoverTrigger asChild>
                   <Button variant="outline" className="bg-zinc-950">Add question</Button>
                 </PopoverTrigger>
                 <PopoverContent align="end" className="w-48">
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" className="justify-start w-full" onClick={() => openCustomBuilder("mcq")}>Create new</Button>
                      <Button variant="ghost" className="justify-start w-full" onClick={() => openLibraryBuilder()}>Select from library</Button>
                    </div>
                 </PopoverContent>
               </Popover>
               <CreateMcqModal 
                 open={createModalOpen} 
                 onOpenChange={setCreateModalOpen} 
                 onFinish={(newQs) => setQuestions(prev => [...prev, ...newQs])} 
               />
               <LibraryMcqModal 
                 open={libraryModalOpen} 
                 onOpenChange={setLibraryModalOpen} 
                 onFinish={(newQs) => setQuestions(prev => [...prev, ...newQs])} 
               />
            </div>
            <ScrollArea className="flex-1 p-4">
              {questions.length === 0 ? (
                <div className="flex h-full min-h-[300px] items-center justify-center text-zinc-400 bg-zinc-900/5 rounded-lg border border-dashed border-zinc-800/50">
                   if create mcq (Canvas is empty)
                </div>
              ) : (
                <div className="space-y-4">
                  {/* render items here ideally */}
                  {questions.map((q, i) => (
                    <QuestionCard
                      key={i}
                      question={q}
                      index={i}
                      onEdit={() => {}}
                      onRemove={() => setQuestions((prev) => prev.filter((_, idx) => idx !== i))}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end gap-4 absolute bottom-0 right-0 left-0">
                 <Button onClick={handleCreate} className="w-32 bg-primary text-primary-foreground hover:bg-primary/90">Publish Test</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
