"use client";

import { CommunityTest, TestQuestion, TestResult } from "@/lib/api-modules";
import { BackButton } from "@/components/BackButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  communityId: string;
  test: CommunityTest;
  questions: TestQuestion[];
  result: TestResult;
}

export function ResultsView({ communityId, test, questions, result }: Props) {
  const correctCount = result.mcqResults?.filter((r) => r.isCorrect).length ?? 0;
  const totalMcq = result.mcqResults?.length ?? 0;

  return (
    <div className="w-full h-full min-h-0 animate-in fade-in flex flex-col pt-8 sm:pt-0">
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
            <div className="flex flex-col items-center justify-center px-4 py-2 bg-zinc-900 border border-emerald-500/20 rounded-xl">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">Score</span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-black text-emerald-400 leading-none">{result.totalScore}</span>
                <span className="text-xs text-zinc-600 font-semibold">/{test.totalMarks}</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">MCQ</span>
              <span className="text-sm font-bold text-zinc-200 leading-none">{result.mcqScore}</span>
            </div>
            <div className="flex flex-col items-center justify-center px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">Code</span>
              <span className="text-sm font-bold text-zinc-200 leading-none">{result.programmingScore}</span>
            </div>
            {totalMcq > 0 && (
              <div className="flex flex-col items-center justify-center px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">Accuracy</span>
                <span
                  className={cn(
                    "text-sm font-bold leading-none",
                    correctCount === totalMcq ? "text-emerald-400" : "text-amber-400"
                  )}
                >
                  {Math.round((correctCount / totalMcq) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 scrollbar-emerald">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-10">
          {result.mcqResults && result.mcqResults.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 bg-emerald-500 rounded-full shrink-0" />
                <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wide">MCQ Review</h2>
                <span className="text-xs text-zinc-500 font-medium ml-1">
                  {correctCount}/{totalMcq} correct
                </span>
                <div className="flex-1 h-px bg-zinc-800 ml-2" />
              </div>
              <div className="space-y-3">
                {result.mcqResults.map((item, index) => {
                  const fallbackQuestion = questions.find((q) => q._id === item.questionId);
                  const options = Array.isArray(item.options) && item.options.length > 0
                    ? item.options
                    : Array.isArray(fallbackQuestion?.options)
                      ? fallbackQuestion!.options
                      : [];
                  const selectedIndex = typeof item.selectedOption === "number" ? item.selectedOption : null;
                  const correctIndex = typeof item.correctOption === "number" ? item.correctOption : null;
                  const selectedText = selectedIndex !== null && options[selectedIndex] != null
                    ? options[selectedIndex]
                    : (item as any).selectedOptionText || "Not answered";
                  const correctText = correctIndex !== null && options[correctIndex] != null
                    ? options[correctIndex]
                    : (item as any).correctOptionText || "N/A";

                  return (
                    <div
                      key={item.questionId}
                      className={cn("rounded-xl border overflow-hidden", item.isCorrect ? "border-emerald-500/25" : "border-zinc-800")}
                    >
                      <div className={cn("flex items-start gap-3 px-4 py-3", item.isCorrect ? "bg-emerald-500/8" : "bg-zinc-900/60")}>
                        <div
                          className={cn(
                            "shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                            item.isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                          )}
                        >
                          {item.isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Q{index + 1}</p>
                            <p className="text-sm text-zinc-100 leading-relaxed">
                              {item.question || fallbackQuestion?.question || "N/A"}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border mt-0.5",
                              item.isCorrect
                                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                                : "text-rose-400 bg-rose-500/10 border-rose-500/25"
                            )}
                          >
                            {item.isCorrect ? `+${item.marksAwarded ?? 0}` : "0"} pts
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-zinc-800 border-t border-zinc-800">
                        <div className={cn("px-4 py-3 flex flex-col gap-1", !item.isCorrect ? "bg-rose-950/30" : "bg-zinc-950/40")}>
                          <div className="flex items-center gap-1.5 mb-1">
                            {!item.isCorrect ? (
                              <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                            ) : (
                              <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                            )}
                            <span
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-widest",
                                !item.isCorrect ? "text-rose-400" : "text-emerald-400"
                              )}
                            >
                              Your Answer
                            </span>
                          </div>
                          <p
                            className={cn(
                              "text-xs font-medium leading-snug",
                              !item.isCorrect ? "text-rose-200" : "text-emerald-100"
                            )}
                          >
                            {selectedText}
                          </p>
                        </div>
                        <div className={cn("px-4 py-3 flex flex-col gap-1", item.isCorrect ? "bg-zinc-950/40" : "bg-emerald-950/30")}>
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
                  const qTitle = questions.find((q) => q._id === item.questionId)?.title;
                  return (
                    <div
                      key={item.questionId}
                      className={cn("rounded-xl border overflow-hidden flex flex-col", isAccepted ? "border-emerald-500/25" : "border-zinc-800")}
                    >
                      <div
                        className={cn(
                          "px-4 py-3 flex items-start justify-between gap-2",
                          isAccepted ? "bg-emerald-500/8" : "bg-zinc-900/60"
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">P{index + 1}</p>
                          <h3 className="text-xs font-semibold text-zinc-200 truncate" title={qTitle}>
                            {qTitle || "Programming Question"}
                          </h3>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border",
                            isAccepted
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                              : item.status === "Wrong Answer"
                                ? "text-rose-400 bg-rose-500/10 border-rose-500/25"
                                : "text-amber-400 bg-amber-500/10 border-amber-500/25"
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="px-4 py-3 bg-zinc-950/60 border-t border-zinc-800 flex-1 flex flex-col gap-2.5">
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 mb-1.5">
                            <span>Test Cases</span>
                            <span className={cn(isAccepted ? "text-emerald-400" : "text-zinc-300")}>
                              {item.passedCases}/{item.totalCases}
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-zinc-900 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-700",
                                isAccepted ? "bg-emerald-500" : "bg-amber-500"
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-zinc-800/60">
                          <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Marks</span>
                          <span className={cn("text-sm font-black", isAccepted ? "text-emerald-400" : "text-zinc-500")}>
                            {item.marksAwarded}
                          </span>
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
