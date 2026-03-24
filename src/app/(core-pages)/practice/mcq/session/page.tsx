"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import { mcqApi, MCQ } from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  LogOut,
  Send,
  BarChart3,
  Settings2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LocalAnswer {
  mcqId: string;
  answer: number;
}

interface BatchResultItem {
  mcqId: string;
  isCorrect: boolean;
  alreadySolved: boolean;
  correctAnswer: number;
  explanation?: string;
  difficulty: string;
}

interface BatchSummary {
  total: number;
  correct: number;
  newCorrect: number;
  wrong: number;
  score: number;
}

// ── Batch-size options ──
const BATCH_OPTIONS = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "30", value: 30 },
  { label: "50", value: 50 },
  { label: "75", value: 75 },
  { label: "100", value: 100 },
  { label: "150", value: 150 },
  { label: "200", value: 200 },
];

// ── Setup Screen ──
function SetupScreen({
  lang,
  difficulty,
  onStart,
}: {
  lang: string;
  difficulty: string | null;
  onStart: (batchSize: number) => void;
}) {
  const [batchSize, setBatchSize] = useState(20);

  return (
    <div className="max-w-lg mx-auto py-16 flex flex-col items-center gap-8">
      <div className="text-center space-y-2">
        <div className="inline-flex p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 mb-2">
          <Zap className="h-10 w-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">MCQ Session</h2>
        <div className="flex gap-2 justify-center mt-2">
          <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold uppercase">
            {lang}
          </span>
          <span
            className={cn(
              "px-3 py-1 rounded-full bg-zinc-800 text-xs font-bold uppercase",
              difficulty === "easy"
                ? "text-emerald-400"
                : difficulty === "medium"
                  ? "text-yellow-400"
                  : difficulty === "hard"
                    ? "text-red-400"
                    : "text-blue-400"
            )}
          >
            {difficulty || "Mixed"}
          </span>
        </div>
        <p className="text-zinc-500 text-sm mt-3 max-w-xs">
          Unsolved questions appear first. Solved ones are appended at the end
          so you can revisit if you want.
        </p>
      </div>

      {/* Batch Size Picker */}
      <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
          <Settings2 className="h-4 w-4" />
          How many questions per session?
        </div>
        <div className="grid grid-cols-4 gap-2">
          {BATCH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBatchSize(opt.value)}
              className={cn(
                "h-12 rounded-xl text-sm font-bold transition-all",
                batchSize === opt.value
                  ? "bg-emerald-500 text-white ring-2 ring-emerald-500/40 shadow-[0_0_15px_-5px_rgba(16,185,129,0.5)]"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-zinc-600">
          You can submit at any time — no need to answer all questions.
        </p>
      </div>

      <Button
        onClick={() => onStart(batchSize)}
        className="bg-emerald-500 hover:bg-emerald-600 text-white h-14 px-12 text-base rounded-2xl font-bold shadow-[0_0_25px_-8px_rgba(16,185,129,0.5)] transition-all hover:scale-105"
      >
        Start Session ({batchSize} Qs) <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}

function MCQSessionContent() {
  const router = useRouter();
  const params = useSearchParams();
  const lang = params.get("lang");
  const difficulty = params.get("difficulty");

  // Phase: "setup" | "session" | "results"
  const [phase, setPhase] = useState<"setup" | "session" | "results">("setup");
  const [loading, setLoading] = useState(false);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [unsolvedCount, setUnsolvedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [submitting, setSubmitting] = useState(false);

  // Results
  const [batchResults, setBatchResults] = useState<BatchResultItem[]>([]);
  const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);

  const fetchMCQs = async (batchSize: number) => {
    if (!lang) return;
    try {
      setLoading(true);
      const reqparams: any = {
        language: lang,
        limit: batchSize,
        unsolvedFirst: "true", // unsolved first, solved appended at end
      };
      if (difficulty && difficulty !== "all") {
        reqparams.difficulty = difficulty;
      }
      const data = await mcqApi.getMCQs(reqparams);
      setMcqs(data.mcqs || []);
      setUnsolvedCount(data.meta?.unsolvedCount ?? (data.mcqs || []).length);
      setCurrentIndex(0);
      setAnswers(new Map());
      setPhase("session");
    } catch {
      toast.error("Failed to load MCQs");
    } finally {
      setLoading(false);
    }
  };

  const currentMcq = mcqs[currentIndex] || null;

  const selectAnswer = (idx: number) => {
    if (!currentMcq || phase === "results") return;
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(currentMcq._id, idx);
      return next;
    });
  };

  const handleBatchSubmit = async () => {
    if (answers.size === 0) {
      toast.error("Answer at least one question before submitting");
      return;
    }
    try {
      setSubmitting(true);
      const answerArray: LocalAnswer[] = [];
      answers.forEach((answer, mcqId) => {
        answerArray.push({ mcqId, answer });
      });
      const response = await mcqApi.submitBatch({ answers: answerArray });
      setBatchResults(response.results);
      setBatchSummary(response.summary);
      setPhase("results");
      if (response.summary.newCorrect > 0) {
        toast.success(`${response.summary.correct} correct out of ${response.summary.total}!`);
      } else {
        toast.info(`Session completed. ${response.summary.correct} correct.`);
      }
    } catch {
      toast.error("Batch submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Setup Screen ──
  if (phase === "setup") {
    return (
      <SetupScreen
        lang={lang || ""}
        difficulty={difficulty}
        onStart={fetchMCQs}
      />
    );
  }

  // ── Loading ──
  if (loading)
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );

  // ── No MCQs ──
  if (mcqs.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="p-6 bg-zinc-900 rounded-full border border-zinc-800">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Questions Available</h2>
        <p className="text-zinc-400">No MCQs found for this category.</p>
        <Button onClick={() => router.push("/practice")} variant="outline">
          Back to Practice
        </Button>
      </div>
    );

  // ── Results Screen ──
  if (phase === "results" && batchSummary) {
    const getResultForMcq = (mcqId: string) => batchResults.find((r) => r.mcqId === mcqId);
    const reviewMcq = reviewIndex !== null ? mcqs[reviewIndex] : null;
    const reviewResult = reviewMcq ? getResultForMcq(reviewMcq._id) : null;

    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-zinc-900 rounded-full border border-zinc-800 mb-4">
            <BarChart3 className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Session Results</h2>
          <p className="text-zinc-400">Here's how you performed in this session</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 text-center">
            <p className="text-3xl font-black text-white">{batchSummary.total}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Attempted</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
            <p className="text-3xl font-black text-emerald-400">{batchSummary.correct}</p>
            <p className="text-xs text-emerald-500/70 uppercase tracking-wider mt-1">Correct</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center">
            <p className="text-3xl font-black text-red-400">{batchSummary.wrong}</p>
            <p className="text-xs text-red-500/70 uppercase tracking-wider mt-1">Wrong</p>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">Accuracy</span>
            <span className="text-white font-bold">
              {batchSummary.total > 0 ? Math.round((batchSummary.correct / batchSummary.total) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${batchSummary.total > 0 ? (batchSummary.correct / batchSummary.total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {reviewMcq && reviewResult ? (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-zinc-500 font-mono">Q.{reviewIndex! + 1}</span>
                <button onClick={() => setReviewIndex(null)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Close</button>
              </div>
              <h3 className="text-lg font-medium text-white mb-4">{reviewMcq.question}</h3>
              <div className="space-y-2">
                {reviewMcq.options.map((opt, idx) => {
                  const correctIdx = typeof reviewResult.correctAnswer === "string" ? parseInt(reviewResult.correctAnswer) : reviewResult.correctAnswer;
                  const userAnswer = answers.get(reviewMcq._id);
                  const isUserPick = userAnswer === idx;
                  const isCorrectOption = idx === correctIdx;
                  let cls = "border-zinc-800 bg-zinc-950/50 opacity-50";
                  if (isCorrectOption) cls = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
                  else if (isUserPick && !reviewResult.isCorrect) cls = "border-red-500 bg-red-500/10 text-red-400";
                  return (
                    <div key={idx} className={cn("flex items-center p-3 rounded-xl border-2 text-sm", cls)}>
                      <div className={cn("flex items-center justify-center w-7 h-7 rounded-lg border text-xs font-bold mr-3", isCorrectOption ? "border-emerald-500 bg-emerald-500 text-black" : "border-zinc-700 bg-zinc-900 text-zinc-500")}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span>{opt}</span>
                      {isCorrectOption && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />}
                      {isUserPick && !reviewResult.isCorrect && <XCircle className="ml-auto h-4 w-4 text-red-500" />}
                    </div>
                  );
                })}
              </div>
              {reviewResult.explanation && (
                <div className="mt-4 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1 text-emerald-400 font-bold uppercase text-[10px] tracking-wider">
                    <HelpCircle className="h-3 w-3" /> Explanation
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed">{reviewResult.explanation}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3">Question Breakdown</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {mcqs.map((q, idx) => {
              const result = getResultForMcq(q._id);
              const wasAnswered = answers.has(q._id);
              if (!wasAnswered) {
                return (
                  <div key={q._id} className="h-10 w-full rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-500 font-mono">
                    {idx + 1}
                  </div>
                );
              }
              return (
                <button
                  key={q._id}
                  onClick={() => setReviewIndex(reviewIndex === idx ? null : idx)}
                  className={cn("h-10 w-full rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all cursor-pointer hover:scale-110", result?.isCorrect ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-red-500/10 border-red-500 text-red-400", reviewIndex === idx && "ring-2 ring-white/30")}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button
            onClick={() => setPhase("setup")}
            variant="outline"
            className="border-zinc-700 h-12 px-8 rounded-xl"
          >
            New Session
          </Button>
          <Button
            onClick={() => router.push("/practice")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 rounded-xl font-bold"
          >
            Back to Practice
          </Button>
        </div>
      </div>
    );
  }

  // ── Session UI ──
  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold uppercase">{lang}</span>
          <span className={cn("px-3 py-1 rounded-full bg-zinc-800 text-xs font-bold uppercase", difficulty === "easy" ? "text-emerald-400" : difficulty === "medium" ? "text-yellow-400" : difficulty === "hard" ? "text-red-400" : "text-blue-400")}>
            {difficulty || "Mixed"}
          </span>
          {/* Show unsolved badge */}
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
            {unsolvedCount} new
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 text-sm font-mono">{currentIndex + 1}/{mcqs.length}</span>
          <span className="text-sm text-zinc-400">
            Answered: <span className="font-semibold text-emerald-400">{answers.size}</span>
          </span>
          <Button variant="outline" size="sm" onClick={() => router.back()} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <LogOut className="h-4 w-4 mr-1" /> Exit
          </Button>
        </div>
      </div>

      {/* Progress bar — answers colour */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-1 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300" style={{ width: `${(answers.size / mcqs.length) * 100}%` }} />
      </div>
      {/* Unsolved vs solved separator */}
      {unsolvedCount < mcqs.length && (
        <div className="relative mb-6">
          <div className="w-full h-0.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500/40 rounded-full" style={{ width: `${(unsolvedCount / mcqs.length) * 100}%` }} />
          </div>
          <span className="absolute right-0 -top-4 text-[9px] text-blue-400/60 font-mono">
            ← unsolved | solved →
          </span>
        </div>
      )}

      {/* Question Card */}
      {currentMcq && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 mb-6 shadow-xl backdrop-blur-sm">
          {/* Solved badge if this MCQ is in the solved section */}
          {currentIndex >= unsolvedCount && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-4">
              <CheckCircle2 className="h-3 w-3" /> Previously Solved
            </div>
          )}
          <h2 className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-8">
            {currentMcq.question}
          </h2>
          <div className="space-y-3">
            {currentMcq.options.map((option, idx) => {
              const isSelected = answers.get(currentMcq._id) === idx;
              return (
                <div
                  key={idx}
                  onClick={() => selectAnswer(idx)}
                  className={cn(
                    "relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    isSelected ? "border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500" : "border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 hover:border-zinc-600"
                  )}
                >
                  <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg border text-sm font-bold mr-4 transition-colors", isSelected ? "border-emerald-500 bg-emerald-500 text-black" : "border-zinc-700 bg-zinc-900 text-zinc-500")}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-base">{option}</span>
                  {isSelected && <CheckCircle2 className="absolute right-4 h-5 w-5 text-emerald-500" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Navigator */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {mcqs.map((q, idx) => (
          <button
            key={q._id}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "h-8 w-8 rounded-lg text-xs font-bold transition-all",
              idx === currentIndex
                ? "bg-emerald-500 text-white ring-2 ring-emerald-500/40"
                : answers.has(q._id)
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : idx >= unsolvedCount
                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20"
                    : "bg-zinc-800 text-zinc-500 border border-zinc-700 hover:bg-zinc-700"
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <Button onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30">
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>

        <div className="flex gap-3">
          {currentIndex < mcqs.length - 1 && (
            <Button onClick={() => setCurrentIndex((i) => Math.min(mcqs.length - 1, i + 1))} className="bg-zinc-100 hover:bg-white text-zinc-900 h-12 px-6 rounded-xl font-bold">
              Next <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleBatchSubmit}
            disabled={submitting || answers.size === 0}
            className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 text-base rounded-xl font-bold shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all hover:scale-105 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Submit All ({answers.size})
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MCQSessionPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
        <MCQSessionContent />
      </Suspense>
    </MainLayout>
  );
}