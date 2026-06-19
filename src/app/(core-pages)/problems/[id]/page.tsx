"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

import { problemApi, Problem, TestCase } from "@/lib/api-modules";
import { toast } from "sonner";
import { Clock, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/BackButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeExecutor } from "@/components/code-execution";
import { SplitViewSkeleton } from "@/components/skeletons/site-skeletons";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function ProblemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const problemId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const selectedDifficulty = searchParams.get("difficulty") || "";
  const selectedPage = searchParams.get("page") || "";
  const returnParams = new URLSearchParams({
    ...(selectedDifficulty ? { difficulty: selectedDifficulty } : {}),
    ...(selectedPage ? { page: selectedPage } : {}),
  });
  const returnQuery = returnParams.toString();
  const backHref = returnQuery ? `/problems?${returnQuery}` : "/problems";

  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>([]);
  const [sessionProblems, setSessionProblems] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!problemId) return;

      try {
        setLoading(true);
        const data = await problemApi.getProblemById(problemId);
        const prob = data?.problem;
        if (!prob) throw new Error("Problem data is missing");

        setProblem(prob);
        setSampleTestCases(data?.sampleTestCases || []);
      } catch {
        toast.error("Failed to load problem");
        router.push("/problems");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId, router]);

  useEffect(() => {
    const loadSiblingProblems = async () => {
      if (!problem?.difficulty || !problemId) return;

      try {
        const res = await problemApi.getProblems({
          type: "dsa",
          difficulty: problem.difficulty,
          limit: 500,
        });
        const ids = (res?.problems || []).map((p: Problem) => p._id);
        setSessionProblems(ids);
        const idx = ids.indexOf(problemId);
        setCurrentIndex(idx >= 0 ? idx : 0);
      } catch {
        setSessionProblems([]);
        setCurrentIndex(0);
      }
    };

    loadSiblingProblems();
  }, [problem?.difficulty, problemId]);

  const goToNextProblem = async () => {
    if (!problem?.difficulty) return;

    let problemIds = sessionProblems;
    let index = currentIndex;

    if (!problemIds.length) {
      try {
        const res = await problemApi.getProblems({
          type: "dsa",
          difficulty: problem.difficulty,
          limit: 500,
        });
        problemIds = (res?.problems || []).map((p: Problem) => p._id);
        setSessionProblems(problemIds);
        index = problemIds.indexOf(problem._id);
        setCurrentIndex(index >= 0 ? index : 0);
      } catch {
        toast.error("Failed to load the next problem");
        return;
      }
    }

    const nextIndex = index + 1;
    if (nextIndex >= problemIds.length) {
      toast.success("You have completed all questions!");
      return;
    }

    setCurrentIndex(nextIndex);
    const nextProblemId = problemIds[nextIndex];
    router.push(returnQuery ? `/problems/${nextProblemId}?${returnQuery}` : `/problems/${nextProblemId}`);
  };

  if (loading) return <SplitViewSkeleton />;
  if (!problem) return null;

  return (
    <>
      <div className="h-[calc(100vh-80px)] max-w-[1920px] mx-auto p-4">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-xl gap-2">
          <ResizablePanel defaultSize={40} minSize={30} className="flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
             <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
               <BackButton href={backHref} label="Back to List" className="mb-2" />
               <div className="flex items-center justify-between mb-2">
                  <h1 className="text-xl font-bold text-white truncate pr-4">{problem.title}</h1>
                  <div className="flex gap-2 shrink-0">
                    <span className={cn("px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide",
                      problem.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                      problem.difficulty === "medium" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                      "bg-red-500/10 text-red-500 border border-red-500/20"
                    )}>
                      {problem.difficulty}
                    </span>
                  </div>
               </div>
               <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {problem.timeLimit}s</span>
                  <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5" /> {problem.memoryLimit}MB</span>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 scrollbar-brand">
              <div className="prose prose-invert prose-sm max-w-none text-zinc-300 prose-headings:text-white prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="w-3 bg-transparent before:absolute before:left-1/2 before:top-0 before:h-full before:w-px before:-translate-x-1/2 before:bg-zinc-800 after:hidden [&>div]:h-10 [&>div]:w-[0.2px] [&>div]:rounded-xs [&>div]:bg-zinc-700 [&>div]:opacity-50 [&>div>svg]:size-1 [&>div>svg]:text-zinc-500"
          />

          <ResizablePanel defaultSize={60} minSize={40} className="h-full">
            <CodeExecutor
              problem={problem}
              problemType="dsa"
              sampleTestCases={sampleTestCases}
              onNextProblem={goToNextProblem}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
