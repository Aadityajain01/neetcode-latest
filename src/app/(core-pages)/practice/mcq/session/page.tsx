"use client";

import { useEffect, useState, Suspense, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { mcqApi, MCQ } from "@/lib/api-modules";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { PracticePageSkeleton } from "@/components/skeletons/site-skeletons";
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
  RefreshCw,
  AlertTriangle,
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



function MCQSessionContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const isAuthReady = initialized && !authLoading;
  const rawLang = params.get("lang");
  const lang = rawLang && rawLang.includes(" ") ? rawLang.replace(/\s+/g, "+") : rawLang;
  const difficulty = params.get("difficulty");
  const limitParam = params.get("limit");
  const unsolvedOnlyParam = params.get("unsolvedOnly") || "true";

  // Phase: "session" | "results"
  const [phase, setPhase] = useState<"session" | "results">("session");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [unsolvedCount, setUnsolvedCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number>>(new Map());
  const [submitting, setSubmitting] = useState(false);

  // Results
  const [batchResults, setBatchResults] = useState<BatchResultItem[]>([]);
  const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null);

  const fetchMCQs = async (batchSize: number) => {
    if (!lang) return;
    try {
      setLoading(true);
      setError(null);
      const reqparams: any = {
        language: lang,
        limit: batchSize,
        unsolvedFirst: "true", // unsolved first
        unsolvedOnly: unsolvedOnlyParam, // only unsolved questions if requested
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
    } catch (err: any) {
      const message = err?.response?.status === 401
        ? "Please log in to start a practice session."
        : "Failed to load MCQs. Please check your connection and try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Auth guard: redirect to login if not authenticated
  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthReady, isAuthenticated, router]);

  // Trigger load on mount
  useEffect(() => {
    if (!isAuthReady || !isAuthenticated) return;
    if (lang) {
      const size = limitParam ? (parseInt(limitParam) || 20) : 20;
      fetchMCQs(size);
    }
  }, [lang, limitParam, difficulty, unsolvedOnlyParam, isAuthReady, isAuthenticated]);

  useEffect(() => {
    if (!isAuthReady || !isAuthenticated) return;
    if (!lang) {
      mcqApi.getMeta().then((res) => {
        const defaultLang = res?.data?.languages?.[0] || 'javascript';
        router.replace(`/practice/mcq/session?lang=${defaultLang}&difficulty=${difficulty || 'all'}`);
      }).catch(() => {
        router.replace(`/practice/mcq/session?lang=javascript&difficulty=${difficulty || 'all'}`);
      });
    }
  }, [lang, difficulty, router, isAuthReady, isAuthenticated]);

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



  // ── Auth loading ──
  if (!isAuthReady) {
    return <PracticePageSkeleton />;
  }

  // ── Loading ──
  if (loading) {
    return <PracticePageSkeleton />;
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="p-6 bg-red-500/10 rounded-full border border-red-500/20">
          <AlertTriangle className="h-12 w-12 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Something Went Wrong</h2>
        <p className="text-zinc-400 max-w-md">{error}</p>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              const size = limitParam ? (parseInt(limitParam) || 20) : 20;
              fetchMCQs(size);
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </Button>
          <Button onClick={() => router.push("/practice")} variant="outline">
            Back to Practice
          </Button>
        </div>
      </div>
    );
  }

  // ── No MCQs ──
  if (mcqs.length === 0) {
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
  }

  const getResultForMcq = (mcqId: string) => batchResults.find((r) => r.mcqId === mcqId);

  return (
    <div className="h-full flex flex-col p-4 md:p-6 min-h-0 overflow-hidden text-zinc-100 font-sans">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 border-b border-zinc-900/60 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push("/practice")} 
            className="h-8 w-8 p-0 rounded-lg bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">
              {phase === "results" ? "Session Review" : "Practice Session"}
            </h1>
            <div className="flex gap-2 items-center mt-2">
              <span className="text-[10px] bg-zinc-900 text-zinc-450 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                {lang}
              </span>
              <span className={cn(
                'text-[10px] font-black uppercase tracking-wider',
                difficulty === 'easy' ? 'text-emerald-555' :
                difficulty === 'medium' ? 'text-amber-555' : 
                difficulty === 'hard' ? 'text-red-555' : 'text-blue-500'
              )}>
                {difficulty || "Mixed"}
              </span>
              <span className="text-zinc-800 font-bold">•</span>
              <span className="text-[10px] text-zinc-400 font-medium">
                {unsolvedCount} unsolved
              </span>
              {unsolvedOnlyParam === "true" && (
                <>
                  <span className="text-zinc-850 font-bold">•</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Unsolved Only
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Top summary stats */}
        <div className="flex items-center gap-4">
          {phase === "session" ? (
            <div className="flex items-center gap-4 text-right">
              <div className="text-xs">
                <span className="text-zinc-500 font-semibold">Progress:</span>{" "}
                <span className="text-white font-bold">{currentIndex + 1} / {mcqs.length}</span>
              </div>
              <div className="text-xs">
                <span className="text-zinc-500 font-semibold">Answered:</span>{" "}
                <span className="text-emerald-400 font-bold">{answers.size} / {mcqs.length}</span>
              </div>
            </div>
          ) : (
            batchSummary && (
              <div className="flex items-center gap-3">
                <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl px-3 py-1 text-center flex gap-4">
                  <div className="text-left">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Score</p>
                    <p className="text-xs font-black text-white">
                      {batchSummary.correct} / {batchSummary.total}
                    </p>
                  </div>
                  <div className="text-left border-l border-zinc-850 pl-4">
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Accuracy</p>
                    <p className="text-xs font-black text-emerald-400">
                      {batchSummary.total > 0 ? Math.round((batchSummary.correct / batchSummary.total) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            )
          )}

          <div className="flex items-center gap-2">
            {phase === "results" && (
              <Button 
                onClick={() => {
                  setAnswers(new Map());
                  setBatchResults([]);
                  setBatchSummary(null);
                  setCurrentIndex(0);
                  const size = limitParam ? (parseInt(limitParam) || 20) : 20;
                  fetchMCQs(size);
                }} 
                size="sm"
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs h-8 px-3 rounded-lg border border-zinc-800"
              >
                Restart Session
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push("/practice")} 
              className="border-zinc-800 text-zinc-400 hover:text-white bg-zinc-900/30 h-8 rounded-lg text-xs"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" /> Exit
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar (Full Width) */}
      {phase === "session" && (
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mb-4 shrink-0">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300" 
            style={{ width: `${(answers.size / mcqs.length) * 100}%` }} 
          />
        </div>
      )}

      {/* ── SPLIT PANE MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: Question List */}
        <div className="w-full md:w-[280px] lg:w-[320px] shrink-0 flex flex-col bg-zinc-900/10 border border-zinc-800/80 rounded-2xl overflow-hidden min-h-0">
          <div className="p-3 border-b border-zinc-900/60 bg-zinc-900/30 shrink-0">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center justify-between">
              <span>Question List</span>
              <span className="text-[10px] text-zinc-500 font-mono font-normal">
                {mcqs.length} Qs
              </span>
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1.5">
            {mcqs.map((q, idx) => {
              const isSelected = idx === currentIndex;
              const hasAnsweredLocally = answers.has(q._id);
              const result = getResultForMcq(q._id);
              
              // Determine status icon and color
              let statusIcon: ReactNode = null;
              if (phase === "results") {
                if (result?.isCorrect) {
                  statusIcon = <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
                } else if (hasAnsweredLocally) {
                  statusIcon = <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
                } else {
                  statusIcon = <div className="h-4 w-4 rounded-full border-2 border-zinc-700 shrink-0" />; // skipped
                }
              } else {
                if (hasAnsweredLocally) {
                  statusIcon = <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-black text-emerald-950 shrink-0">✓</div>;
                } else {
                  statusIcon = <div className="h-4 w-4 rounded-full border-2 border-zinc-800 shrink-0" />;
                }
              }

              return (
                <div
                  key={q._id}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "group flex items-start p-3 gap-3 rounded-xl cursor-pointer transition-all border",
                    isSelected
                      ? "bg-zinc-900/60 border-zinc-850/80 text-white shadow-md shadow-black/10"
                      : "bg-transparent border-transparent hover:bg-zinc-900/30 hover:border-zinc-850 text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    {statusIcon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold font-mono">
                        Q. {idx + 1}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider",
                        q.difficulty === 'easy' ? 'text-emerald-500/80' :
                        q.difficulty === 'medium' ? 'text-amber-500/80' : 'text-red-500/80'
                      )}>
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-xs font-medium line-clamp-2 mt-1 leading-relaxed">
                      {q.question}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Question Detail */}
        <div className="flex-1 flex flex-col bg-zinc-900/10 border border-zinc-800/80 rounded-2xl overflow-hidden min-h-0">
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Question Title & Content */}
            {currentMcq && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-mono">Question {currentIndex + 1} of {mcqs.length}</span>
                  {phase === "results" && !answers.has(currentMcq._id) && (
                    <span className="text-[9px] bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                      Skipped
                    </span>
                  )}
                </div>
                <h2 className="text-base md:text-lg font-bold text-white leading-relaxed">
                  {currentMcq.question}
                </h2>
              </div>
            )}

            {/* Options List */}
            {currentMcq && (
              <div className="space-y-2.5">
                {currentMcq.options.map((option, idx) => {
                  const isSelected = answers.get(currentMcq._id) === idx;
                  const result = getResultForMcq(currentMcq._id);
                  
                  const correctIdx = result 
                    ? (typeof result.correctAnswer === "string" ? parseInt(result.correctAnswer) : result.correctAnswer)
                    : null;
                  
                  const isCorrectOption = phase === "results" && idx === correctIdx;
                  const isWrongOption = phase === "results" && isSelected && !result?.isCorrect;

                  let optionStyle = "bg-zinc-900/30 border-zinc-850 hover:bg-zinc-900/60 hover:border-zinc-700 text-zinc-300";
                  if (isSelected && phase !== "results") {
                    optionStyle = "bg-emerald-500/10 border-emerald-500/60 text-white ring-1 ring-emerald-500/20";
                  } else if (phase === "results") {
                    if (isCorrectOption) {
                      optionStyle = "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold";
                    } else if (isWrongOption) {
                      optionStyle = "bg-red-500/15 border-red-500 text-red-400 font-semibold";
                    } else {
                      optionStyle = "bg-zinc-950/20 border-zinc-900/50 opacity-40 text-zinc-650 pointer-events-none";
                    }
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => selectAnswer(idx)}
                      className={cn(
                        'relative flex items-center p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none',
                        optionStyle
                      )}
                    >
                      <div className={cn(
                        'flex items-center justify-center w-7 h-7 rounded-lg border text-xs font-black mr-3.5 transition-colors shrink-0',
                        isSelected && phase !== "results"
                          ? 'border-emerald-500 bg-emerald-500 text-black' 
                          : isCorrectOption 
                          ? 'border-emerald-500 bg-emerald-500 text-black'
                          : isWrongOption
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-550'
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm font-medium">{option}</span>
                      {isCorrectOption && <CheckCircle2 className="absolute right-4 h-4.5 w-4.5 text-emerald-500 shrink-0" />}
                      {isWrongOption && <XCircle className="absolute right-4 h-4.5 w-4.5 text-red-500 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Answer Explanation */}
            {phase === "results" && currentMcq && (
              (() => {
                const result = getResultForMcq(currentMcq._id);
                if (result?.explanation) {
                  return (
                    <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 text-left animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                        <HelpCircle className="h-3.5 w-3.5 text-emerald-555" /> Solution Explanation
                      </div>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>
                  );
                } else if (!answers.has(currentMcq._id)) {
                  return (
                    <div className="bg-zinc-900/10 border border-zinc-850/80 rounded-2xl p-5 text-left text-zinc-500 text-xs leading-relaxed italic">
                      This question was skipped. Submit an answer in the next session to view the solution.
                    </div>
                  );
                }
                return null;
              })()
            )}

          </div>

          {/* ACTION NAVIGATOR BOTTOM BAR */}
          <div className="bg-zinc-900/30 border-t border-zinc-900/60 p-4 flex items-center justify-between gap-4 shrink-0">
            <Button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              variant="outline"
              className="border-zinc-800 text-zinc-400 hover:text-white bg-zinc-900/30 disabled:opacity-30 text-xs h-9 px-3 rounded-lg"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </Button>

            <div className="flex gap-3 items-center">
              {currentIndex < mcqs.length - 1 ? (
                <Button
                  onClick={() => setCurrentIndex((i) => Math.min(mcqs.length - 1, i + 1))}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs h-9 px-4 rounded-xl border border-zinc-800"
                >
                  Next <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              ) : null}

              {phase === "session" ? (
                <Button
                  onClick={handleBatchSubmit}
                  disabled={submitting || answers.size === 0}
                  className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold tracking-widest uppercase rounded-xl px-5 h-9 shadow-md shadow-emerald-500/10 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                  ) : (
                    <Send className="h-3.5 w-3.5 mr-2" />
                  )}
                  Submit Session ({answers.size})
                </Button>
              ) : (
                <Button
                  onClick={() => router.push("/practice")}
                  className="bg-emerald-555 hover:bg-emerald-500 text-emerald-950 text-xs font-bold tracking-widest uppercase rounded-xl px-5 h-9 shadow-md"
                >
                  Finish Review
                </Button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function MCQSessionPage() {
  return (
    <Suspense fallback={<PracticePageSkeleton />}>
      <MCQSessionContent />
    </Suspense>
  );
}