"use client";

import { useEffect, useState, use } from "react";
import { useCommunity } from "@/components/communities/CommunityContext";
import { communityApi, CommunityTest, TestQuestion, TestResult } from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, CheckCircle, ListTodo, ChevronLeft, ChevronRight, Clock, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { isPast, differenceInSeconds } from "date-fns";
import { BackButton } from "@/components/BackButton";
import { CodeExecutor } from "@/components/code-execution";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [codes, setCodes] = useState<Record<string, { language: string; code: string }>>({});
  const [lockedAnswers, setLockedAnswers] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

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
        setTimeLeft(Math.min(durationSec, remainingUntilEnd));
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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersArr = Object.keys(answers).map((qId) => ({
        questionId: qId,
        selectedOption: answers[qId],
      }));
      const codesArr = Object.keys(codes)
        .filter((qId) => codes[qId].code)
        .map((qId) => ({
          questionId: qId,
          code: codes[qId].code,
          language: codes[qId].language,
        }));

      await communityApi.submitTest(communityId, testId, {
        answers: answersArr,
        codeSubmissions: codesArr,
      });
      toast.success("Test submitted successfully!");
      setHasSubmitted(true);
      const data = await communityApi.getTestById(communityId, testId);
      setResult(data.result);
    } catch {
      toast.error("Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

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

  const allQuestionsCompleted =
    questions.length > 0 &&
    questions.every((question) => {
      if (question.type === "mcq") {
        return answers[question._id] !== undefined;
      }
      const code = codes[question._id]?.code || "";
      return code.trim().length > 0;
    });

  if (hasSubmitted || isEnded) {
    if (!result) {
      return (
        <div className="max-w-3xl mx-auto pt-12 text-center">
          <BackButton href={`/communities/${communityId}/tests`} className="mb-6 justify-center" />
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 shadow-lg">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white mb-2">Test Submitted</h2>
            <p className="text-zinc-400">Your submission has been received.</p>
            {test.isResultVisible === false && (
              <div className="mt-6 text-amber-500 bg-amber-500/10 p-4 rounded-xl text-sm border border-amber-500/20">
                Results are hidden by the instructor. You will be able to see your score when results are published.
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto h-full min-h-0 py-3 animate-in fade-in flex flex-col">
        <BackButton href={`/communities/${communityId}/tests`} className="mb-3" />

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center shrink-0">
          <h2 className="text-2xl font-bold text-white">{test.title} - Results</h2>
          <div className="text-4xl font-black text-emerald-500 mt-2">
            {result.totalScore} <span className="text-xl text-zinc-500">/ {test.totalMarks}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 max-w-[280px] mx-auto text-sm font-semibold">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
              <span className="text-zinc-500 uppercase tracking-wide text-[10px] block">MCQ</span>
              <span className="text-white text-base">{result.mcqScore}</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
              <span className="text-zinc-500 uppercase tracking-wide text-[10px] block">Code</span>
              <span className="text-white text-base">{result.programmingScore}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex-1 min-h-0 rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden">
          <ScrollArea className="h-full p-3 md:p-4 scrollbar-emerald">
            {result.mcqResults && result.mcqResults.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">MCQ Review</h3>
                <div className="space-y-2.5">
                  {result.mcqResults.map((item, index) => {
                        const fallbackQuestion = questions.find((question) => question._id === item.questionId);
                        const options = Array.isArray(item.options) && item.options.length > 0
                          ? item.options
                          : Array.isArray(fallbackQuestion?.options)
                            ? fallbackQuestion.options
                            : [];
                    const selectedIndex = typeof item.selectedOption === "number" ? item.selectedOption : null;
                    const correctIndex = typeof item.correctOption === "number" ? item.correctOption : null;
                    const selectedText =
                      selectedIndex !== null && options[selectedIndex] !== undefined
                        ? options[selectedIndex]
                        : ((item as any).selectedOptionText || "Not answered");
                    const correctText =
                      (correctIndex !== null && options[correctIndex] !== undefined
                        ? options[correctIndex]
                        : ((item as any).correctOptionText || "N/A"));

                    return (
                      <div key={item.questionId} className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Question {index + 1}</p>
                            <p className="text-sm text-zinc-100 leading-relaxed">{item.question || fallbackQuestion?.question || "N/A"}</p>
                          </div>
                          <Badge
                            className={cn(
                              "border text-xs px-2 py-0.5",
                              item.isCorrect
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                            )}
                          >
                            {item.isCorrect ? "Correct" : "Incorrect"}
                          </Badge>
                        </div>

                        <div className="mt-2 grid gap-1.5 text-sm">
                          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-zinc-300">
                            <span className="text-zinc-500">Your answer:</span> {selectedText}
                          </div>
                          <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 text-emerald-300">
                            <span className="text-emerald-500/80">Correct answer:</span> {correctText}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {result.programmingResults && result.programmingResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Programming Review</h3>
                <div className="space-y-2.5">
                  {result.programmingResults.map((item, index) => (
                    <div key={item.questionId} className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <p className="text-sm font-semibold text-zinc-200">Problem {index + 1}</p>
                        <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-xs px-2 py-0.5">
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400">
                        Passed {item.passedCases}/{item.totalCases} test cases
                      </p>
                      <p className="text-sm text-emerald-400 font-semibold mt-0.5">Marks: {item.marksAwarded}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    );
  }

  const isLocked = q?.type === "mcq" ? !!lockedAnswers[q._id] : false;

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 w-full h-full min-h-0 relative overflow-hidden">
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
          <p className="text-xs text-zinc-400">
            {questions.length} Questions | {test.totalMarks} Marks
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 font-mono font-bold text-base sm:text-xl px-3 sm:px-4 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !allQuestionsCompleted}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit Test
          </Button>
        </div>
      </div>

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

            <div className="h-16 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur flex items-center justify-between px-4 md:px-6 shrink-0 gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-800 font-bold uppercase tracking-wide">
                    <ListTodo className="w-4 h-4 mr-2" /> List Questions
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-[320px] bg-zinc-900 border-zinc-800 p-2 shadow-2xl rounded-xl">
                  <ScrollArea className="h-[280px] w-full pr-2 scrollbar-emerald">
                    <div className="space-y-1">
                      {questions.map((question, idx) => (
                        <button
                          key={question._id}
                          onClick={() => setActiveIndex(idx)}
                          className={cn(
                            "w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors",
                            activeIndex === idx
                              ? "bg-zinc-800 border-zinc-700 text-white shadow-sm"
                              : "bg-zinc-950/50 border-zinc-900 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300 hover:border-zinc-800"
                          )}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span
                              className={cn(
                                "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                                activeIndex === idx ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-500"
                              )}
                            >
                              {idx + 1}
                            </span>
                            <span className="truncate text-xs font-medium">
                              {question.type === "mcq" ? "Multiple Choice" : question.title}
                            </span>
                          </div>
                          {(question.type === "mcq" ? lockedAnswers[question._id] : !!codes[question._id]?.code) && (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
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

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !allQuestionsCompleted}
                  className="bg-emerald-600 hover:bg-emerald-700 h-9"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Submit
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full rounded-xl gap-2">
            <ResizablePanel defaultSize={40} minSize={30} className="flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
              <ScrollArea className="flex-1 min-h-0 p-6 space-y-6 scrollbar-emerald">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-purple-500/10 text-purple-500 border border-purple-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
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

              <div className="h-16 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur flex items-center justify-between px-4 md:px-6 shrink-0 z-20 gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-800 font-bold uppercase tracking-wide">
                      <ListTodo className="w-4 h-4 mr-2" /> List Questions
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="start" className="w-[320px] bg-zinc-900 border-zinc-800 p-2 shadow-2xl rounded-xl">
                    <ScrollArea className="h-[280px] w-full pr-2 scrollbar-emerald">
                      <div className="space-y-1">
                        {questions.map((question, idx) => (
                          <button
                            key={question._id}
                            onClick={() => setActiveIndex(idx)}
                            className={cn(
                              "w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-colors",
                              activeIndex === idx
                                ? "bg-zinc-800 border-zinc-700 text-white shadow-sm"
                                : "bg-zinc-950/50 border-zinc-900 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300 hover:border-zinc-800"
                            )}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <span
                                className={cn(
                                  "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                                  activeIndex === idx ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-500"
                                )}
                              >
                                {idx + 1}
                              </span>
                              <span className="truncate text-xs font-medium">
                                {question.type === "mcq" ? "Multiple Choice" : question.title}
                              </span>
                            </div>
                            {(question.type === "mcq" ? lockedAnswers[question._id] : !!codes[question._id]?.code) && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
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

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !allQuestionsCompleted}
                    className="bg-emerald-600 hover:bg-emerald-700 h-9"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit
                  </Button>
                </div>
              </div>
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
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
