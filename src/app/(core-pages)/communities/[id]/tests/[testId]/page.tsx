"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import { useCommunity } from "@/components/communities/CommunityContext";
import { communityApi, CommunityTest, TestQuestion, TestResult } from "@/lib/api-modules";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { isPast, differenceInSeconds } from "date-fns";
import { CodeExecutor } from "@/components/code-execution";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import {
  useAntiCheat,
  PreTestConsentGate,
  ReturnCountdownOverlay,
  StrikeWarningModal,
  StrikeHud,
  SessionTerminatedView,
  TestHeader,
  EvaluatingView,
  ResultsView,
  SubmitDialog,
  QuestionsNav,
} from "@/components/test-taking";

type ParamsType = Promise<{ id: string; testId: string }>;

export default function TestTakingInterface(props: { params: ParamsType }) {
  const params = use(props.params);
  const communityId = params.id;
  const testId = params.testId;
  const { community } = useCommunity();

  // --- Test state ---
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

  // --- Anti-cheat state & shared ref ---
  const [initialStrikes, setInitialStrikes] = useState(0);
  const [initialLog, setInitialLog] = useState<string[]>([]);
  const isSubmittingRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // --- Data fetching ---
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
        setInitialStrikes(data.strikeCount || 0);
        setInitialLog(data.violationLog || []);

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
      } catch {
        toast.error("Failed to load test");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [communityId, testId]);

  // --- Submit logic ---
  const handleSubmitRef = useRef<() => Promise<void>>(async () => {});

  // --- Hook setup ---
  const antiCheat = useAntiCheat({
    communityId,
    testId,
    initialStrikes,
    initialViolationLog: initialLog,
    isSubmittingRef,
    videoRef,
    hasSubmitted,
    onForceSubmit: () => handleSubmitRef.current(),
  });

  const handleSubmit = useCallback(async () => {
    if (submitting || isSubmittingRef.current) return;

    setSubmitting(true);
    isSubmittingRef.current = true;

    try {
      const answersArr = Object.keys(answers).map((qId) => ({
        questionId: qId,
        selectedOption: answers[qId],
      }));
      const programmingQuestionIds = questions.filter((q) => q.type === "programming").map((q) => q._id);
      const codesArr = programmingQuestionIds
        .map((qId) => {
          const payload: any = { questionId: qId };
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
        .filter(Boolean);

      const res = await communityApi.submitTest(communityId, testId, {
        answers: answersArr,
        codeSubmissions: codesArr,
      });

      toast.success("Exam submitted successfully!");
      setHasSubmitted(true);

      antiCheat.cancelReturnCountdown();
      antiCheat.exitFullscreen();

      setResultHidden(res.resultHidden ?? false);
      setEvaluationComplete(res.evaluationComplete ?? false);
      if (res.result) {
        setResult(res.result);
      } else if (!res.evaluationComplete && !res.resultHidden) {
        // If not complete and not hidden, fetch fresh state
        try {
          const data = await communityApi.getTestById(communityId, testId);
          if (data.result) setResult(data.result);
          setResultHidden(data.resultHidden ?? false);
          setEvaluationComplete(data.evaluationComplete ?? false);
        } catch (fetchErr) {
          console.error("Error fetching updated test detail after submission:", fetchErr);
        }
      }
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast.error(error?.response?.data?.error || "Failed to submit test. Please check your internet.");
    } finally {
      setSubmitting(false);
      if (!antiCheat.sessionTerminated) {
        setTimeout(() => {
          isSubmittingRef.current = false;
        }, 2000);
      }
    }
  }, [answers, codes, questions, lockedProgramming, communityId, testId, antiCheat, submitting]);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  // --- Countdown timer ---
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !hasSubmitted && antiCheat.sessionStarted) {
      const t = setInterval(() => setTimeLeft((l) => (l && l > 0 ? l - 1 : 0)), 1000);
      return () => clearInterval(t);
    } else if (timeLeft === 0 && !hasSubmitted && antiCheat.sessionStarted) {
      handleSubmit();
    }
  }, [timeLeft, hasSubmitted, antiCheat.sessionStarted, handleSubmit]);

  // --- Result polling ---
  useEffect(() => {
    if (!communityId || !testId || !hasSubmitted || result || resultHidden || evaluationComplete) return;
    let isCancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    const maxAttempts = 40;

    const pollResult = async () => {
      if (isCancelled) return;
      try {
        const data = await communityApi.getTestById(communityId, testId);
        if (isCancelled) return;
        setHasSubmitted(data.hasSubmitted);
        setResultHidden(data.resultHidden ?? false);
        setEvaluationComplete(data.evaluationComplete ?? false);
        if (data.resultHidden || data.evaluationComplete) return;
        if (data.result) {
          setResult(data.result);
          toast.success("Results are ready");
          return;
        }
      } catch {
        // Keep polling silently.
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

  // --- Helpers ---
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

  const getQuestionState = (question: TestQuestion): "locked" | "attempted" | "unattempted" => {
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

  // --- Stats ---
  const mcqQuestions = questions.filter((q) => q.type === "mcq");
  const programmingQuestions = questions.filter((q) => q.type === "programming");
  const answeredMcqCount = mcqQuestions.filter((q) => answers[q._id] !== undefined).length;
  const answeredProgCount = programmingQuestions.filter(
    (q) => (codes[q._id]?.code || "").trim().length > 0 || lockedProgramming[q._id]
  ).length;
  const totalAnswered = answeredMcqCount + answeredProgCount;

  // --- Rendering ---
  if (loading) {
    return (
      <div className="flex justify-center p-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }
  if (!test) return <div className="p-12 text-center">Test not found</div>;

  const isStarted = isPast(new Date(test.startTime));
  const isEnded = isPast(new Date(test.endTime));

  if (!isStarted) return <div className="p-12 text-center text-zinc-500">This test has not started yet.</div>;

  if (!antiCheat.sessionStarted && !hasSubmitted && !isEnded) {
    return <PreTestConsentGate test={test} questions={questions} onStart={antiCheat.handleStartSession} />;
  }

  if (antiCheat.sessionTerminated && !hasSubmitted && !antiCheat.showWarningModal) {
    return (
      <SessionTerminatedView
        communityId={communityId}
        violationLog={antiCheat.violationLog}
        onExit={antiCheat.exitFullscreen}
      />
    );
  }

  if (hasSubmitted || isEnded) {
    if (resultHidden || !result) {
      return (
        <EvaluatingView
          communityId={communityId}
          resultHidden={resultHidden}
          pollFailed={pollFailed}
          pollAttempts={pollAttempts}
          onManualRefresh={handleManualRefresh}
        />
      );
    }
    return <ResultsView communityId={communityId} test={test} questions={questions} result={result} />;
  }

  const q = questions[activeIndex];
  const isLocked = q?.type === "mcq" ? !!lockedAnswers[q._id] : !!lockedProgramming[q?._id || ""];

  const lockCurrentProgrammingQuestion = () => {
    if (!q || q.type !== "programming") return;
    setLockedProgramming((prev) => ({ ...prev, [q._id]: true }));
    toast.success("Question locked. It will be scored as 0 if not accepted.");
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 w-full h-full min-h-0 relative overflow-hidden">
      {/* Invisible video for AI analysis - hidden from user */}
      <video
        width="640"
        height="360"
        ref={(el) => {
          if (el) {
            videoRef.current = el;
            if (antiCheat.mediaStream) el.srcObject = antiCheat.mediaStream;
          }
        }}
        className="fixed top-0 left-0 pointer-events-none -z-50 opacity-[0.01]"
        autoPlay
        muted
        playsInline
      />

      {/* --- Anti-cheat overlays --- */}
      {antiCheat.sessionStarted && !antiCheat.sessionTerminated && !hasSubmitted && (
        <motion.div
          drag
          dragConstraints={{ left: -1000, right: 0, top: -1000, bottom: 0 }}
          whileDrag={{ scale: 1.05 }}
          className="fixed bottom-6 right-6 w-56 h-36 rounded-xl border-2 border-brand-500/50 overflow-hidden bg-black shadow-2xl z-50 cursor-move"
        >
          <video
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            ref={(el) => {
              if (el && antiCheat.mediaStream) el.srcObject = antiCheat.mediaStream;
            }}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Live</span>
          </div>
        </motion.div>
      )}

      {antiCheat.returnCountdown !== null && !antiCheat.sessionTerminated && (
        <ReturnCountdownOverlay
          returnCountdown={antiCheat.returnCountdown}
          countdownReason={antiCheat.countdownReason}
          strikes={antiCheat.strikes}
          onCancelAndReturn={() => {
            antiCheat.cancelReturnCountdown();
            antiCheat.enterFullscreen();
          }}
        />
      )}

      {antiCheat.showWarningModal && antiCheat.returnCountdown === null && (
        <StrikeWarningModal
          strikes={antiCheat.strikes}
          currentWarning={antiCheat.currentWarning}
          onDismiss={() => {
            antiCheat.setShowWarningModal(false);
            antiCheat.enterFullscreen();
          }}
          onUnderstand={() => antiCheat.setShowWarningModal(false)}
        />
      )}

      <StrikeHud strikes={antiCheat.strikes} />

      {/* --- Active test header --- */}
      <TestHeader
        title={test.title}
        communityName={community?.name}
        totalQuestions={questions.length}
        totalMarks={test.totalMarks}
        totalAnswered={totalAnswered}
        timeLeft={timeLeft}
        submitting={submitting}
        onSubmitClick={() => setConfirmOpen(true)}
      />

      {/* --- Real-time proctoring warning banner --- */}
      {antiCheat.sessionStarted && !antiCheat.sessionTerminated && !hasSubmitted && antiCheat.proctoringWarning && (
        <div className="w-full bg-red-600/95 text-white text-xs sm:text-sm font-bold uppercase text-center py-2 animate-pulse shadow-md z-40 relative flex items-center justify-center gap-2">
          Warning: {antiCheat.proctoringWarning}
        </div>
      )}

      {/* --- Main question panel --- */}
      <div className="flex-1 min-h-0 p-2 md:p-4 max-w-480 mx-auto w-full">
        {!q ? (
          <div className="flex items-center justify-center h-full text-zinc-500">Select a question</div>
        ) : q.type === "mcq" ? (
          <div className="h-full flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <ScrollArea className="flex-1 min-h-0 p-6 lg:p-10 scrollbar-brand">
              <div className="max-w-4xl mx-auto w-full">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                      Question {activeIndex + 1}
                    </span>
                    <span className="text-zinc-500 text-sm font-medium">{q.marks} Marks</span>
                  </div>
                  <h2 className="text-xl md:text-2xl text-zinc-100 font-medium leading-relaxed">{q.question}</h2>
                </div>

                <div className="pr-1">
                  <RadioGroup
                    value={answers[q._id]?.toString()}
                    onValueChange={(val) => setAnswers((prev) => ({ ...prev, [q._id]: parseInt(val) }))}
                    className="space-y-3 mt-6"
                    disabled={isLocked}
                  >
                    {q.options?.map((opt, i) => (
                      <label
                        key={i}
                        className={cn(
                          "flex items-center p-4 rounded-xl border cursor-pointer transition-all",
                          answers[q._id] === i
                            ? "border-brand-500 bg-brand-500/5 shadow-[0_0_15px_rgba(255,106,31,0.1)]"
                            : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700",
                          isLocked && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        <RadioGroupItem value={i.toString()} id={`opt-${i}`} className="text-brand-500 border-zinc-600" />
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
                      isLocked ? "bg-zinc-800 text-zinc-400" : "bg-brand-500 hover:bg-brand-600 text-white"
                    )}
                  >
                    {isLocked ? "Answer Locked" : "Lock Answer"}
                  </Button>
                </div>
              </div>
            </ScrollArea>

            <QuestionsNav questions={questions} activeIndex={activeIndex} onSelect={setActiveIndex} getQuestionState={getQuestionState}>
              <Button onClick={() => setConfirmOpen(true)} disabled={submitting} className="bg-brand-500 hover:bg-brand-600 h-9">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit
              </Button>
            </QuestionsNav>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full rounded-xl gap-2">
            <ResizablePanel
              defaultSize={40}
              minSize={30}
              className="flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden shadow-sm"
            >
              <ScrollArea className="flex-1 min-h-0 p-6 space-y-6 scrollbar-brand">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                      Question {activeIndex + 1}
                    </span>
                    <span className="text-zinc-500 text-sm font-medium">{q.marks} Marks</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-6">{q.title}</h2>
                  <div
                    className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
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

              <QuestionsNav questions={questions} activeIndex={activeIndex} onSelect={setActiveIndex} getQuestionState={getQuestionState}>
                <Button
                  onClick={lockCurrentProgrammingQuestion}
                  disabled={!!lockedProgramming[q._id]}
                  className={cn(
                    "h-9",
                    lockedProgramming[q._id] ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-800" : "bg-brand-500 hover:bg-brand-600"
                  )}
                >
                  {lockedProgramming[q._id] ? "Question Locked" : "Lock Question"}
                </Button>
              </QuestionsNav>
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
                onCodeChange={(val) => setCodes((prev) => ({ ...prev, [q._id]: { ...prev[q._id], code: val } }))}
                initialLanguage={codes[q._id]?.language}
                onLanguageChange={(val) => setCodes((prev) => ({ ...prev, [q._id]: { ...prev[q._id], language: val } }))}
                isReadOnly={!!lockedProgramming[q._id]}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      <SubmitDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        totalAnswered={totalAnswered}
        totalQuestions={questions.length}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
