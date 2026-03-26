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
import { CreateProgrammingModal } from "./test-builder/CreateProgrammingModal";
import { LibraryProgrammingModal } from "./test-builder/LibraryProgrammingModal";
import { DateTimePopoverField } from "./test-builder/DateTimePopoverField";
import { QuestionCard } from "./test-builder/QuestionCard";
import { createEmptyMcqDraft, createEmptyProgrammingDraft } from "./test-builder/helpers";
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
  const QUESTIONS_PER_PAGE = 8;
  const { community } = useCommunity();
  const [open, setOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<"mcq" | "programming" | "mixed">("mcq");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    durationMinutes: 60,
    isResultVisible: false,
  } as {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    isResultVisible: boolean;
  });
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);

  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [createProgrammingModalOpen, setCreateProgrammingModalOpen] = useState(false);
  const [libraryProgrammingModalOpen, setLibraryProgrammingModalOpen] = useState(false);
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
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(questions.length / QUESTIONS_PER_PAGE)),
    [questions.length, QUESTIONS_PER_PAGE]
  );

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const end = start + QUESTIONS_PER_PAGE;
    return questions.slice(start, end);
  }, [questions, currentPage, QUESTIONS_PER_PAGE]);

  const editingMcqQuestion = useMemo(() => {
    if (editingQuestionIndex === null) return null;
    const target = questions[editingQuestionIndex];
    if (!target || target.type !== "mcq") return null;
    return target;
  }, [editingQuestionIndex, questions]);

  const editingProgrammingQuestion = useMemo(() => {
    if (editingQuestionIndex === null) return null;
    const target = questions[editingQuestionIndex];
    if (!target || target.type !== "programming") return null;
    return target;
  }, [editingQuestionIndex, questions]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
    setCreateModalOpen(false);
    setLibraryModalOpen(false);
    setCreateProgrammingModalOpen(false);
    setLibraryProgrammingModalOpen(false);
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
    setSelectedTestType("mcq");
    setCurrentPage(1);
    setLoading(false);
    resetPopoverState();
  };

  const openBuilderForType = (type: "mcq" | "programming" | "mixed") => {
    setSelectedTestType(type);
    setOpen(true);
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
    setEditingQuestionIndex(null);
    if (mode === "programming") {
      setCreateProgrammingModalOpen(true);
      return;
    }
    setCreateModalOpen(true);
  };

  const openLibraryBuilder = (mode: LibraryType) => {
    setAddPopoverOpen(false);
    if (mode === "programming") {
      setLibraryProgrammingModalOpen(true);
      return;
    }
    setLibraryModalOpen(true);
  };

  const handleCreate = async () => {
    if (!community) return;

    if (!form.title || !form.startTime || !form.endTime) {
      toast.error("Fill the basic test details first");
      return;
    }

    const now = new Date();
    const startDate = new Date(form.startTime);
    const endDate = new Date(form.endTime);

    if (startDate < now) {
      toast.error("Start time cannot be in the past");
      return;
    }

    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }

    if (!form.durationMinutes || form.durationMinutes <= 0) {
      toast.error("Duration must be a positive number");
      return;
    }

    if (questions.length === 0) {
      toast.error("Add at least one question");
      return;
    }

    setLoading(true);
    try {
      const mcqQuestions = questions.filter((question) => question.type === "mcq");
      if (process.env.NODE_ENV !== "production") {
        console.info("[MCQ_DEBUG][FE][CREATE_TEST] Sending test payload", {
          communityId: community._id,
          title: form.title,
          selectedTestType,
          derivedType,
          totalQuestions: questions.length,
          mcqCount: mcqQuestions.length,
          mcqQuestions: mcqQuestions.map((question, index) => ({
            index,
            sourceMcqId: (question as any).sourceMcqId,
            question: question.type === "mcq" ? (question.question || "").slice(0, 140) : "",
            optionsCount: question.type === "mcq" ? (question.options?.length || 0) : 0,
            correctOption: question.type === "mcq" ? question.correctOption : undefined,
            marks: question.marks,
          })),
        });
      }

      await communityApi.createTest(community._id, {
        ...form,
        type: selectedTestType,
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
          <DropdownMenuItem onClick={() => openBuilderForType("mcq")} className="cursor-pointer font-medium focus:bg-zinc-900 focus:text-zinc-100">
            MCQ
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openBuilderForType("programming")} className="cursor-pointer font-medium focus:bg-zinc-900 focus:text-zinc-100">
            Programming
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openBuilderForType("mixed")} className="cursor-pointer font-medium focus:bg-zinc-900 focus:text-zinc-100">
            Mixed
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="h-[90vh] w-[95vw] min-w-[700px] max-w-[980px] gap-0 overflow-hidden border-zinc-800 bg-zinc-950 p-0 text-zinc-200 flex flex-col max-md:min-w-0">
        <DialogHeader className="border-b border-zinc-800 bg-zinc-950 px-6 py-4">
          <DialogTitle className="w-full pr-6">
            <div className="mb-3 space-y-2">
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Test name"
                className="h-9 w-full bg-zinc-900 border-zinc-800 focus:border-zinc-700 px-3"
              />
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Test description (optional)"
                className="bg-zinc-900 border-zinc-800 focus:border-zinc-700 min-h-[56px] resize-none text-sm"
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-3 text-zinc-200 font-normal text-sm w-full xl:flex-row xl:items-end">
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:flex-1">
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

                <div className="flex min-w-0 flex-col items-start gap-1">
                  <span className="text-zinc-400 whitespace-nowrap text-xs ml-1">Duration (min)</span>
                  <Input
                    type="number"
                    className="w-full h-8 bg-zinc-900 border-zinc-800 focus:border-zinc-700"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                  />
                </div>

                <div className="flex min-w-0 flex-col items-start gap-1">
                  <span className="text-zinc-400 whitespace-nowrap text-xs ml-1">Show results to students</span>
                  <div className="flex h-8 w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3">
                    <Switch
                      checked={form.isResultVisible}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, isResultVisible: checked }))
                      }
                    />
                    <span className="text-xs text-zinc-300">{form.isResultVisible ? "Visible" : "Hidden"}</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleCreate} disabled={loading} className="w-full xl:w-28 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-9 shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex h-full flex-col overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden relative p-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold text-zinc-200">Added Questions ({questions.length}) {totalMarks > 0 && <span className="ml-2 text-sm font-normal text-emerald-400">{totalMarks} marks</span>}</h3>
               <div className="flex items-center gap-3">
                 <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
                   <PopoverTrigger asChild>
                     <Button variant="outline" className="bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-900 h-8">Add</Button>
                   </PopoverTrigger>
                   <PopoverContent align="end" className="w-48 bg-zinc-950 border-zinc-800 text-zinc-200">
                      <div className="flex flex-col gap-1">
                        {(selectedTestType === "mcq" || selectedTestType === "mixed") && (
                          <>
                            <Button variant="ghost" className="justify-start w-full hover:bg-zinc-900" onClick={() => openCustomBuilder("mcq")}>Create MCQ</Button>
                            <Button variant="ghost" className="justify-start w-full hover:bg-zinc-900" onClick={() => openLibraryBuilder("mcq")}>MCQ from library</Button>
                          </>
                        )}
                        {(selectedTestType === "programming" || selectedTestType === "mixed") && (
                          <>
                            <Button variant="ghost" className="justify-start w-full hover:bg-zinc-900" onClick={() => openCustomBuilder("programming")}>Create Programming</Button>
                            <Button variant="ghost" className="justify-start w-full hover:bg-zinc-900" onClick={() => openLibraryBuilder("programming")}>Programming from library</Button>
                          </>
                        )}
                      </div>
                   </PopoverContent>
                 </Popover>
               </div>
               <CreateMcqModal 
                 open={createModalOpen} 
                 onOpenChange={(nextOpen) => {
                   setCreateModalOpen(nextOpen);
                   if (!nextOpen) {
                    setEditingQuestionIndex(null);
                   }
                 }}
                 editingQuestion={editingMcqQuestion}
                 onSaveEdit={(updatedQuestion) => {
                   if (editingQuestionIndex === null) return;
                   setQuestions((prev) => {
                     const next = [...prev];
                     next[editingQuestionIndex] = updatedQuestion;
                     return next;
                   });
                   toast.success("Question updated");
                   setEditingQuestionIndex(null);
                 }}
                 onFinish={(newQs) => {
                   setQuestions((prev) => [...prev, ...newQs]);
                   if (newQs.length > 0) {
                     const nextTotal = questions.length + newQs.length;
                     setCurrentPage(Math.ceil(nextTotal / QUESTIONS_PER_PAGE));
                   }
                 }} 
               />
               <LibraryMcqModal 
                 open={libraryModalOpen} 
                 onOpenChange={setLibraryModalOpen} 
                 onFinish={(newQs) => {
                   setQuestions((prev) => [...prev, ...newQs]);
                   if (newQs.length > 0) {
                     const nextTotal = questions.length + newQs.length;
                     setCurrentPage(Math.ceil(nextTotal / QUESTIONS_PER_PAGE));
                   }
                 }} 
               />
               <CreateProgrammingModal
                 open={createProgrammingModalOpen}
                 onOpenChange={(nextOpen) => {
                   setCreateProgrammingModalOpen(nextOpen);
                   if (!nextOpen) {
                     setEditingQuestionIndex(null);
                   }
                 }}
                 editingQuestion={editingProgrammingQuestion}
                 onSaveEdit={(updatedQuestion) => {
                   if (editingQuestionIndex === null) return;
                   setQuestions((prev) => {
                     const next = [...prev];
                     next[editingQuestionIndex] = updatedQuestion;
                     return next;
                   });
                   toast.success("Programming question updated");
                   setEditingQuestionIndex(null);
                 }}
                 onFinish={(newQs) => {
                   setQuestions((prev) => [...prev, ...newQs]);
                   if (newQs.length > 0) {
                     const nextTotal = questions.length + newQs.length;
                     setCurrentPage(Math.ceil(nextTotal / QUESTIONS_PER_PAGE));
                   }
                 }}
               />
               <LibraryProgrammingModal
                 open={libraryProgrammingModalOpen}
                 onOpenChange={setLibraryProgrammingModalOpen}
                 onFinish={(newQs) => {
                   setQuestions((prev) => [...prev, ...newQs]);
                   if (newQs.length > 0) {
                     const nextTotal = questions.length + newQs.length;
                     setCurrentPage(Math.ceil(nextTotal / QUESTIONS_PER_PAGE));
                   }
                 }}
               />
            </div>
            
            {/* Table structure as per wireframe */}
            <div className="flex-1 border border-zinc-800 rounded-lg overflow-hidden flex flex-col bg-zinc-950/20">
                <div className="grid grid-cols-[minmax(0,1fr)_96px_88px_72px] gap-3 p-3 border-b border-zinc-800 bg-zinc-900/50 text-xs font-medium text-zinc-400 shrink-0">
                  <div className="pl-2">Sr no</div>
                  <div className="text-center">Type</div>
                  <div className="text-center">Marks</div>
                  <div></div>
                </div>

                  {questions.length === 0 ? (
                    <div className="flex-1 min-h-[300px] items-center justify-center text-zinc-500 flex">
                       No questions added yet
                    </div>
                    
                  ) : (
                    <div className="flex-1 min-h-0 divide-y divide-zinc-800/50 overflow-y-auto overflow-x-hidden scrollbar-emerald">
                      {paginatedQuestions.map((q, i) => {
                        const absoluteIndex = (currentPage - 1) * QUESTIONS_PER_PAGE + i;

                        return (
                        <QuestionCard
                          key={absoluteIndex}
                          question={q}
                          index={absoluteIndex}
                          onEdit={() => {
                            if (q.type === "programming") {
                              setEditingQuestionIndex(absoluteIndex);
                              setCreateProgrammingModalOpen(true);
                              return;
                            }

                            setEditingQuestionIndex(absoluteIndex);
                            setCreateModalOpen(true);
                          }}
                          onRemove={() =>
                            setQuestions((prev) =>
                              prev.filter((_, idx) => idx !== absoluteIndex)
                            )
                          }
                        />
                        );
                      })}
                    </div>
                  )}

              {questions.length > 0 && (
                <div className="p-2 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-between text-sm shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="h-7 px-3 border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
                  >
                    Prev
                  </Button>
                  <div className="flex items-center gap-2 text-zinc-500">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const page = idx + 1;
                      const isActive = page === currentPage;

                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={isActive ? "text-zinc-100 font-semibold" : "hover:text-zinc-300"}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className="h-7 px-3 border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
