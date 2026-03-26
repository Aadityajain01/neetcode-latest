"use client";

import { useEffect, useState, use } from "react";
import { useCommunity } from "@/components/communities/CommunityContext";
import { communityApi, CommunityTest, TestQuestion, TestResult } from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, CheckCircle, ListTodo, ChevronLeft, ChevronRight, Clock, Lock, AlertTriangle, RefreshCw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { isPast, differenceInSeconds } from "date-fns";
import { BackButton } from "@/components/BackButton";
import { CodeExecutor } from "@/components/code-execution";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ParamsType = Promise<{ id: string; testId: string }>;

export default function TestTakingInterface(props: { params: ParamsType }) {
  const params = use(props.params);
  const communityId = params.id;
  const testId = params.testId;
  const { community } = useCommunity();

  const [test, setTest] = useState<CommunityTest | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [resultHidden, setResultHidden] = useState(false);
  const [evaluationComplete, setEvaluationComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [codes, setCodes] = useState<Record<string, { language: string; code: string }>>({});
  const [lockedAnswers, setLockedAnswers] = useState<Record<string, boolean>>({});
  const [lockedProgramming, setLockedProgramming] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [pollFailed, setPollFailed] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!communityId || !testId) return;
    const fetchTest = async () => {
      try {
        const data = await communityApi.getTestById(communityId, testId);
        setTest(data.test);
        setQuestions(data.questions);
        setHasSubmitted(data.hasSubmitted);
        setResult(data.result);
        setResultHidden(data.resultHidden ?? false);
        setEvaluationComplete(data.evaluationComplete ?? false);

        const initialCodes: Record<string, any> = {};
        data.questions.forEach((q: TestQuestion) => {
          if (q.type === "programming") {
            initialCodes[q._id] = { language: q.languages?.[0] || "javascript", code: "" };
          }
        });
        setCodes(initialCodes);

        const end = new Date(data.test.endTime);
        const durationSec = data.test.durationMinutes * 60;
        const remainingUntilEnd = differenceInSeconds(end, new Date());
        setTimeLeft(Math.max(0, Math.min(durationSec, remainingUntilEnd)));
      } catch (e) {
        toast.error("Failed to load test");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [communityId, testId]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !hasSubmitted) {
      const t = setInterval(() => setTimeLeft((l) => (l && l > 0 ? l - 1 : 0)), 1000);
      return () => clearInterval(t);
    } else if (timeLeft === 0 && !hasSubmitted) {
      handleSubmit();
    }
  }, [timeLeft, hasSubmitted]);

  useEffect(() => {
    // Don't poll if: no submission, result already loaded, results hidden by instructor, or evaluation already done (hidden)
    if (!communityId || !testId || !hasSubmitted || result || resultHidden || evaluationComplete) return;

    let isCancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    const maxAttempts = 40; // ~80s at 2s interval

    const pollResult = async () => {
      if (isCancelled) return;

      try {
        const data = await communityApi.getTestById(communityId, testId);
        if (isCancelled) return;

        setHasSubmitted(data.hasSubmitted);
        setResultHidden(data.resultHidden ?? false);
        setEvaluationComplete(data.evaluationComplete ?? false);

        // If results are hidden by instructor, stop polling
        if (data.resultHidden || data.evaluationComplete) {
          return;
        }

        if (data.result) {
          setResult(data.result);
          toast.success("Results are ready");
          return;
        }
      } catch {
        // Keep polling silently; transient failures are expected on slow networks.
      }

      attempts += 1;
      setPollAttempts(attempts);
      if (!isCancelled && attempts < maxAttempts) {
        timer = setTimeout(pollResult, 2000);
      } else if (!isCancelled) {
        setPollFailed(true);
      }
    };

    timer = setTimeout(pollResult, 2000);

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [communityId, testId, hasSubmitted, result, resultHidden, evaluationComplete]);

  const handleManualRefresh = async () => {
    try {
      const data = await communityApi.getTestById(communityId, testId);
      setHasSubmitted(data.hasSubmitted);
      setResultHidden(data.resultHidden ?? false);
      setEvaluationComplete(data.evaluationComplete ?? false);
      if (data.resultHidden) {
        toast.info("Results are hidden by the instructor.");
        setPollFailed(false);
      } else if (data.result) {
        setResult(data.result);
        toast.success("Results are ready");
        setPollFailed(false);
      } else {
        toast.info("Still evaluating... Try again in a few seconds.");
      }
    } catch {
      toast.error("Failed to fetch results");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersArr = Object.keys(answers).map((qId) => ({
        questionId: qId,
        selectedOption: answers[qId],
      }));
      const programmingQuestionIds = questions
        .filter((question) => question.type === "programming")
        .map((question) => question._id);

      const codesArr = programmingQuestionIds
        .map((qId) => {
          const payload: {
            questionId: string;
            code?: string;
            language?: string;
            isLocked?: boolean;
          } = {
            questionId: qId,
          };

          if (lockedProgramming[qId]) {
            payload.isLocked = true;
            payload.language = codes[qId]?.language;
            payload.code = "";
            return payload;
          }

          const code = codes[qId]?.code || "";
          if (code.trim().length > 0) {
            payload.code = code;
            payload.language = codes[qId]?.language;
            return payload;
          }

          return null;
        })
        .filter((item): item is { questionId: string; code?: string; language?: string; isLocked?: boolean } => !!item);

      await communityApi.submitTest(communityId, testId, {
        answers: answersArr,
        codeSubmissions: codesArr,
      });
      toast.success("Test submitted successfully!");
      setHasSubmitted(true);
      setPollAttempts(0);
      setPollFailed(false);
      const data = await communityApi.getTestById(communityId, testId);
      setResult(data.result);
      setResultHidden(data.resultHidden ?? false);
      setEvaluationComplete(data.evaluationComplete ?? false);
    } catch {
      toast.error("Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Summary counts ──
  const mcqQuestions = questions.filter((q) => q.type === "mcq");
  const programmingQuestions = questions.filter((q) => q.type === "programming");
  const answeredMcqCount = mcqQuestions.filter((q) => answers[q._id] !== undefined).length;
  const answeredProgCount = programmingQuestions.filter((q) => (codes[q._id]?.code || "").trim().length > 0 || lockedProgramming[q._id]).length;
  const totalAnswered = answeredMcqCount + answeredProgCount;

  if (loading) {
    return (
      <div className="flex justify-center p-24">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }
  if (!test) return <div className="p-12 text-center">Test not found</div>;

  const q = questions[activeIndex];
  const isStarted = isPast(new Date(test.startTime));
  const isEnded = isPast(new Date(test.endTime));

  if (!isStarted) {
    return <div className="p-12 text-center text-zinc-500">This test has not started yet.</div>;
  }

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const getQuestionState = (question: TestQuestion): "locked" | "solved" | "attempted" | "unattempted" => {
    if (question.type === "mcq") {
      if (lockedAnswers[question._id]) return "locked";
      if (answers[question._id] !== undefined) return "attempted";
      return "unattempted";
    }

    if (lockedProgramming[question._id]) return "locked";
    const code = (codes[question._id]?.code || "").trim();
    if (code.length > 0) return "attempted";
    return "unattempted";
  };

  // ── Submitted / Ended States ──
  if (hasSubmitted || isEnded) {
    // Results hidden by instructor — show a clear message, no spinner
    if (resultHidden) {
      return (
        <div className="max-w-3xl mx-auto pt-12 text-center px-4">
          <BackButton href={`/communities/${communityId}/tests`} className="mb-6 justify-center" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 shadow-lg">
            <div className="relative mx-auto mb-6 w-20 h-20 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Test Submitted Successfully</h2>
            <div className="mt-6 text-amber-500 bg-amber-500/10 p-4 rounded-xl text-sm border border-amber-500/20">
              Results are hidden by the instructor. You will be able to see your score when results are published.
            </div>
          </div>
        </div>
      );
    }

    // Evaluating state — show animated loading with progress
    if (!result) {
      return (
        <div className="max-w-3xl mx-auto pt-12 text-center px-4">
          <BackButton href={`/communities/${communityId}/tests`} className="mb-6 justify-center" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 shadow-lg">
            {/* Animated evaluation indicator */}
            <div className="relative mx-auto mb-6 w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-emerald-500/30 border-b-transparent border-l-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {pollFailed ? "Evaluation is taking longer" : "Evaluating Your Answers"}
            </h2>
            <p className="text-zinc-400 mb-1">
              {pollFailed
                ? "The server is still processing your submission."
                : "Your submission has been received and is being evaluated."}
            </p>

            {!pollFailed && (
              <div className="mt-6 max-w-xs mx-auto">
                <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(95, (pollAttempts / 40) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">This usually takes a few seconds...</p>
              </div>
            )}

            {pollFailed && (
              <div className="mt-6 space-y-3">
                <div className="text-amber-500 bg-amber-500/10 p-3 rounded-xl text-sm border border-amber-500/20 flex items-center gap-2 justify-center">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Evaluation is taking longer than expected.
                </div>
                <Button
                  onClick={handleManualRefresh}
                  variant="outline"
                  className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check for Results
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Results View
    const correctCount = result.mcqResults?.filter(r => r.isCorrect).length ?? 0;
    const totalMcq = result.mcqResults?.length ?? 0;

    return (
      <div className="w-full h-full min-h-0 animate-in fade-in flex flex-col">

        {/* ── Sticky Score Header ────────────────────────────── */}
        <div className="shrink-0 bg-zinc-950 border-b border-zinc-800/80">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <BackButton href={`/communities/${communityId}/tests`} className="shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base font-bold text-zinc-100 truncate">{test.title}</h1>
                <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold">Results</p>
              </div>
            </div>

            <div className="flex items-stretch gap-2 sm:gap-3 shrink-0">
              {/* Total */}
              <div className="flex flex-col items-center justify-center px-4 py-2 bg-zinc-900 border border-emerald-500/20 rounded-xl">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">Score</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-black text-emerald-400 leading-none">{result.totalScore}</span>
                  <span className="text-xs text-zinc-600 font-semibold">/{test.totalMarks}</span>
                </div>
              </div>
              {/* MCQ pill */}
              <div className="flex flex-col items-center justify-center px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">MCQ</span>
                <span className="text-sm font-bold text-zinc-200 leading-none">{result.mcqScore}</span>
              </div>
              {/* Code pill */}
              <div className="flex flex-col items-center justify-center px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">Code</span>
                <span className="text-sm font-bold text-zinc-200 leading-none">{result.programmingScore}</span>
              </div>
              {/* Accuracy dot */}
              {totalMcq > 0 && (
                <div className="flex flex-col items-center justify-center px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">Accuracy</span>
                  <span className={cn("text-sm font-bold leading-none", correctCount === totalMcq ? "text-emerald-400" : "text-amber-400")}>
                    {Math.round((correctCount / totalMcq) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Review Body ───────────────────────────────────── */}
        <ScrollArea className="flex-1 min-h-0 scrollbar-emerald">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-10">

            {/* MCQ Review */}
            {result.mcqResults && result.mcqResults.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-5 bg-emerald-500 rounded-full shrink-0" />
                  <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">MCQ Review</h2>
                  <span className="text-xs text-zinc-500 font-medium ml-1">{correctCount}/{totalMcq} correct</span>
                  <div className="flex-1 h-px bg-zinc-800 ml-2" />
                </div>

                <div className="space-y-3">
                  {result.mcqResults.map((item, index) => {
                    const fallbackQuestion = questions.find(q => q._id === item.questionId);
                    const options = Array.isArray(item.options) && item.options.length > 0
                      ? item.options
                      : (Array.isArray(fallbackQuestion?.options) ? fallbackQuestion!.options : []);
                    const selectedIndex = typeof item.selectedOption === "number" ? item.selectedOption : null;
                    const correctIndex = typeof item.correctOption === "number" ? item.correctOption : null;
                    const selectedText = selectedIndex !== null && options[selectedIndex] != null
                      ? options[selectedIndex]
                      : ((item as any).selectedOptionText || "Not answered");
                    const correctText = correctIndex !== null && options[correctIndex] != null
                      ? options[correctIndex]
                      : ((item as any).correctOptionText || "N/A");

                    return (
                      <div
                        key={item.questionId}
                        className={cn(
                          "rounded-xl border overflow-hidden",
                          item.isCorrect ? "border-emerald-500/25" : "border-zinc-800"
                        )}
                      >
                        {/* Question row */}
                        <div className={cn(
                          "flex items-start gap-3 px-4 py-3",
                          item.isCorrect ? "bg-emerald-500/8" : "bg-zinc-900/60"
                        )}>
                          <div className={cn(
                            "shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                            item.isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                          )}>
                            {item.isCorrect
                              ? <CheckCircle className="w-3.5 h-3.5" />
                              : <XCircle className="w-3.5 h-3.5" />
                            }
                          </div>
                          <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Q{index + 1}</p>
                              <p className="text-sm text-zinc-100 leading-relaxed">{item.question || fallbackQuestion?.question || "—"}</p>
                            </div>
                            <span className={cn(
                              "shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border mt-0.5",
                              item.isCorrect
                                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                                : "text-rose-400 bg-rose-500/10 border-rose-500/25"
                            )}>
                              {item.isCorrect ? `+${item.marksAwarded ?? 0}` : "0"} pts
                            </span>
                          </div>
                        </div>

                        {/* Answer comparison row — always two columns */}
                        <div className="grid grid-cols-2 divide-x divide-zinc-800 border-t border-zinc-800">
                          {/* Your answer */}
                          <div className={cn(
                            "px-4 py-3 flex flex-col gap-1",
                            !item.isCorrect ? "bg-rose-950/30" : "bg-zinc-950/40"
                          )}>
                            <div className="flex items-center gap-1.5 mb-1">
                              {!item.isCorrect
                                ? <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                                : <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                              }
                              <span className={cn(
                                "text-[9px] font-bold uppercase tracking-widest",
                                !item.isCorrect ? "text-rose-400" : "text-emerald-400"
                              )}>Your Answer</span>
                            </div>
                            <p className={cn(
                              "text-xs font-medium leading-snug",
                              !item.isCorrect ? "text-rose-200" : "text-emerald-100"
                            )}>
                              {selectedText}
                            </p>
                          </div>

                          {/* Correct answer */}
                          <div className={cn(
                            "px-4 py-3 flex flex-col gap-1",
                            item.isCorrect ? "bg-zinc-950/40" : "bg-emerald-950/30"
                          )}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Correct Answer</span>
                            </div>
                            <p className="text-xs font-medium text-emerald-100 leading-snug">{correctText}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Programming Review */}
            {result.programmingResults && result.programmingResults.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-5 bg-cyan-500 rounded-full shrink-0" />
                  <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">Programming Review</h2>
                  <div className="flex-1 h-px bg-zinc-800 ml-2" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {result.programmingResults.map((item, index) => {
                    const isAccepted = item.status === "Accepted";
                    const pct = item.totalCases > 0 ? (item.passedCases / item.totalCases) * 100 : 0;
                    const qTitle = questions.find(q => q._id === item.questionId)?.title;
                    return (
                      <div
                        key={item.questionId}
                        className={cn(
                          "rounded-xl border overflow-hidden flex flex-col",
                          isAccepted ? "border-emerald-500/25" : "border-zinc-800"
                        )}
                      >
                        {/* Header */}
                        <div className={cn(
                          "px-4 py-3 flex items-start justify-between gap-2",
                          isAccepted ? "bg-emerald-500/8" : "bg-zinc-900/60"
                        )}>
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">P{index + 1}</p>
                            <h3 className="text-xs font-semibold text-zinc-200 truncate" title={qTitle}>{qTitle || "Programming Question"}</h3>
                          </div>
                          <span className={cn(
                            "shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border",
                            isAccepted
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                              : item.status === "Wrong Answer"
                              ? "text-rose-400 bg-rose-500/10 border-rose-500/25"
                              : "text-amber-400 bg-amber-500/10 border-amber-500/25"
                          )}>
                            {item.status}
                          </span>
                        </div>

                        {/* Stats */}
                        <div className="px-4 py-3 bg-zinc-950/60 border-t border-zinc-800 flex-1 flex flex-col gap-2.5">
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 mb-1.5">
                              <span>Test Cases</span>
                              <span className={cn(isAccepted ? "text-emerald-400" : "text-zinc-300")}>{item.passedCases}/{item.totalCases}</span>
                            </div>
                            <div className="h-1 rounded-full bg-zinc-900 overflow-hidden">
                              <div
                                className={cn("h-full rounded-full transition-all duration-700", isAccepted ? "bg-emerald-500" : "bg-amber-500")}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-zinc-800/60">
                            <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Marks</span>
                            <span className={cn("text-sm font-black", isAccepted ? "text-emerald-400" : "text-zinc-500")}>{item.marksAwarded}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        </ScrollArea>
      </div>
    );
  }




  const isLocked = q?.type === "mcq" ? !!lockedAnswers[q._id] : !!lockedProgramming[q?._id || ""];

  const lockCurrentProgrammingQuestion = () => {
    if (!q || q.type !== "programming") return;
    setLockedProgramming((prev) => ({ ...prev, [q._id]: true }));
    toast.success("Question locked. It will be scored as 0 if not accepted.");
  };

  // ── Question Progress Grid (used in multiple places) ──
  const QuestionGrid = ({ onSelect }: { onSelect: (idx: number) => void }) => (
    <div className="grid grid-cols-5 gap-1.5">
      {questions.map((question, idx) => {
        const state = getQuestionState(question);
        return (
          <button
            key={question._id}
            onClick={() => onSelect(idx)}
            className={cn(
              "w-9 h-9 rounded-lg text-xs font-bold transition-all border",
              activeIndex === idx && "ring-2 ring-emerald-500 ring-offset-1 ring-offset-zinc-950",
              state === "locked" && "bg-amber-500/15 border-amber-500/30 text-amber-400",
              state === "attempted" && "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
              state === "unattempted" && "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-400",
            )}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );

  // ── Navigation bar (shared between MCQ and programming views) ──
  const BottomNavBar = ({ children }: { children?: React.ReactNode }) => (
    <div className="h-16 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur flex items-center justify-between px-4 md:px-6 shrink-0 gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-800 font-bold uppercase tracking-wide">
            <ListTodo className="w-4 h-4 mr-2" /> Questions
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-auto min-w-[220px] bg-zinc-900 border-zinc-800 p-3 shadow-2xl rounded-xl">
          <p className="text-xs text-zinc-500 mb-2 font-semibold uppercase tracking-wider">Question Map</p>
          <QuestionGrid onSelect={setActiveIndex} />
          <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center gap-3 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500/40" /> Answered</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500/40" /> Locked</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-zinc-700" /> Pending</span>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        <Button
          variant="outline"
          className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((a) => a - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="text-sm font-medium text-zinc-500 px-2">
          {activeIndex + 1} of {questions.length}
        </span>

        <Button
          variant="outline"
          className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
          disabled={activeIndex === questions.length - 1}
          onClick={() => setActiveIndex((a) => a + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {children}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 w-full h-full min-h-0 relative overflow-hidden">
      {/* ── Header ── */}
      <div className="h-16 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-white text-base sm:text-lg truncate">{test.title}</h1>
            {community?.name && (
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                {community.name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>{questions.length} Questions</span>
            <span>•</span>
            <span>{test.totalMarks} Marks</span>
            <span>•</span>
            <span className={cn(
              "font-semibold",
              totalAnswered === questions.length ? "text-emerald-400" : "text-zinc-400"
            )}>
              {totalAnswered}/{questions.length} answered
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 font-mono font-bold text-base sm:text-xl px-3 sm:px-4 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
          </div>
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit Test
          </Button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 min-h-0 p-2 md:p-4 max-w-[1920px] mx-auto w-full">
        {!q ? (
          <div className="flex items-center justify-center h-full text-zinc-500">Select a question</div>
        ) : q.type === "mcq" ? (
          <div className="h-full flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <ScrollArea className="flex-1 min-h-0 p-6 lg:p-10 scrollbar-emerald">
              <div className="max-w-4xl mx-auto w-full">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                      Question {activeIndex + 1}
                    </span>
                    <span className="text-zinc-500 text-sm font-medium">{q.marks} Marks</span>
                  </div>
                  <h2 className="text-xl md:text-2xl text-zinc-100 font-medium leading-relaxed">{q.question}</h2>
                </div>

                <div className="pr-1">
                  <RadioGroup
                    value={answers[q._id]?.toString()}
                    onValueChange={(val) =>
                      setAnswers((prev) => ({ ...prev, [q._id]: parseInt(val) }))
                    }
                    className="space-y-3 mt-6"
                    disabled={isLocked}
                  >
                    {q.options?.map((opt, i) => (
                      <label
                        key={i}
                        className={cn(
                          "flex items-center p-4 rounded-xl border cursor-pointer transition-all",
                          answers[q._id] === i
                            ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700",
                          isLocked && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        <RadioGroupItem
                          value={i.toString()}
                          id={`opt-${i}`}
                          className="text-emerald-500 border-zinc-600"
                        />
                        <span className="ml-4 text-zinc-300 font-medium">{opt}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6">
                  <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-zinc-500" />
                    {isLocked ? "Answer locked. You cannot change this." : "Lock answer to prevent changes."}
                  </div>
                  <Button
                    onClick={() => setLockedAnswers((prev) => ({ ...prev, [q._id]: true }))}
                    disabled={isLocked || answers[q._id] === undefined}
                    className={cn(
                      "h-9 px-4 text-xs font-semibold",
                      isLocked ? "bg-zinc-800 text-zinc-400" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    )}
                  >
                    {isLocked ? "Answer Locked" : "Lock Answer"}
                  </Button>
                </div>
              </div>
            </ScrollArea>

            <BottomNavBar>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 h-9"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit
              </Button>
            </BottomNavBar>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full rounded-xl gap-2">
            <ResizablePanel defaultSize={40} minSize={30} className="flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              <ScrollArea className="flex-1 min-h-0 p-6 space-y-6 scrollbar-emerald">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                      Question {activeIndex + 1}
                    </span>
                    <span className="text-zinc-500 text-sm font-medium">{q.marks} Marks</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-6">{q.title}</h2>
                  <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed" style={{ whiteSpace: "pre-wrap" }}>
                    {q.description}
                  </div>
                </div>

                <div className="space-y-4 mt-8 pb-4">
                  <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4">
                    <h4 className="font-bold text-zinc-400 text-[10px] uppercase mb-2 tracking-widest">Input Format</h4>
                    <p className="text-sm text-zinc-300">{q.inputFormat || "N/A"}</p>
                  </div>
                  <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4">
                    <h4 className="font-bold text-zinc-400 text-[10px] uppercase mb-2 tracking-widest">Output Format</h4>
                    <p className="text-sm text-zinc-300">{q.outputFormat || "N/A"}</p>
                  </div>
                  <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4">
                    <h4 className="font-bold text-zinc-400 text-[10px] uppercase mb-2 tracking-widest">Constraints</h4>
                    <pre className="text-xs text-amber-500/90 font-mono bg-black/30 p-3 rounded-lg overflow-x-auto border border-amber-500/10">
                      {q.constraints || "None"}
                    </pre>
                  </div>
                </div>
              </ScrollArea>

              <BottomNavBar>
                <Button
                  onClick={lockCurrentProgrammingQuestion}
                  disabled={!!lockedProgramming[q._id]}
                  className={cn(
                    "h-9",
                    lockedProgramming[q._id]
                      ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-800"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {lockedProgramming[q._id] ? "Question Locked" : "Lock Question"}
                </Button>
              </BottomNavBar>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-transparent" />

            <ResizablePanel defaultSize={60} minSize={40} className="h-full relative overflow-hidden">
              <CodeExecutor
                problem={{
                  _id: q.problemId || q._id,
                  title: q.title || "",
                  description: q.description || "",
                  difficulty: "Medium",
                  topicTags: [],
                  languages: q.languages || ["javascript"],
                } as any}
                problemType="practice"
                sampleTestCases={
                  q.customTestcases
                    ?.filter((t) => !t.isHidden)
                    .map((tc) => ({
                      input: tc.input,
                      expectedOutput: tc.output,
                      isHidden: false,
                      _id: "fake",
                    })) as any || []
                }
                initialCode={codes[q._id]?.code}
                onCodeChange={(val) =>
                  setCodes((prev) => ({ ...prev, [q._id]: { ...prev[q._id], code: val } }))
                }
                initialLanguage={codes[q._id]?.language}
                onLanguageChange={(val) =>
                  setCodes((prev) => ({ ...prev, [q._id]: { ...prev[q._id], language: val } }))
                }
                isReadOnly={!!lockedProgramming[q._id]}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {/* ── Submit Confirmation Dialog ── */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Submit Test?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              You have answered <span className="text-white font-semibold">{totalAnswered}</span> of{" "}
              <span className="text-white font-semibold">{questions.length}</span> questions.
              {totalAnswered < questions.length && (
                <span className="block mt-1 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                  {questions.length - totalAnswered} question(s) are unanswered.
                </span>
              )}
              <span className="block mt-2">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                handleSubmit();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirm Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
