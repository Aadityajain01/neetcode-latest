"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import { problemApi, Problem, TestCase } from "@/lib/api-modules";
import { toast } from "sonner";
import { Loader2, Clock, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/BackButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// ✅ Import the Reusable Component
import { CodeExecutor } from "@/components/code-execution";

function shuffleArray(arr: string[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const problemId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>([]);
  const [sessionProblems, setSessionProblems] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // --- 1. SESSION MANAGEMENT LOGIC ---
  const startNewSession = async (difficulty: string) => {
    try {
      const res = await problemApi.getProblems({
        type: "practice", // Stays "practice" here
        difficulty,
        limit: 500,
      });

      const ids = res.problems.map((p: Problem) => p._id);
      const shuffled = shuffleArray(ids);

      // Use a practice-specific session key
      sessionStorage.setItem(
        `practice-session-${difficulty}`,
        JSON.stringify({ list: shuffled, index: 0 })
      );

      setSessionProblems(shuffled);
      setCurrentIndex(0);

      router.replace(`/practice/${shuffled[0]}`);
    } catch {
      toast.error("Failed to start Practice session");
    }
  };

  useEffect(() => {
    if (!problem?.difficulty) return;

    const key = `practice-session-${problem.difficulty}`;
    const stored = sessionStorage.getItem(key);

    if (stored) {
      const parsed = JSON.parse(stored);
      setSessionProblems(parsed.list);
      
      const idx = parsed.list.indexOf(problemId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      } else {
        setCurrentIndex(parsed.index);
      }
    } else {
      startNewSession(problem.difficulty);
    }
  }, [problem?.difficulty, problemId]);


  // --- 2. FETCH PROBLEM DATA ---
  useEffect(() => {
    if (problemId) fetchProblem();
  }, [problemId]);

  const fetchProblem = async () => {
    if (!problemId) return;
    try {
      setLoading(true);
      const data = await problemApi.getProblemById(problemId);
      
      const prob = data?.problem;
      if (!prob) throw new Error("Problem data is missing");

      setProblem(prob);
      setSampleTestCases(data?.sampleTestCases || []);

    } catch (error) {
      toast.error("Failed to load problem");
      router.push("/practice");
    } finally {
      setLoading(false);
    }
  };


  // --- 3. HANDLER FOR NEXT BUTTON ---
  const goToNextProblem = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= sessionProblems.length) {
      toast.success("🎉 You have completed all questions in this session!");
      sessionStorage.removeItem(`practice-session-${problem?.difficulty}`);
      return;
    }

    const key = `practice-session-${problem?.difficulty}`;
    sessionStorage.setItem(key, JSON.stringify({ list: sessionProblems, index: nextIndex }));

    setCurrentIndex(nextIndex);
    router.push(`/practice/${sessionProblems[nextIndex]}`);
  };


  // --- RENDER ---
  if (loading) {
    return (
      <MainLayout>
        <div className="h-[calc(100vh-64px)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </MainLayout>
    );
  }

  if (!problem) return null;

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-80px)] gap-4 max-w-[1920px] mx-auto p-4">
        
        {/* --- LEFT PANEL: DESCRIPTION --- */}
        <div className="flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          
          {/* Header */}
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
              <BackButton href="/practice" label="Back to List" className="mb-2" />
              
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-bold text-white truncate pr-4">{problem.title}</h1>
                <div className="flex gap-2 shrink-0">
                  <span className={cn("px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide", 
                    problem.difficulty === 'easy' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : 
                    problem.difficulty === 'medium' ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : 
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

          {/* Description Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="prose prose-invert prose-sm max-w-none text-zinc-300">
              {/* Use ReactMarkdown for proper formatting */}
               <ReactMarkdown remarkPlugins={[remarkGfm]}>{problem.description}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: THE REUSABLE CODE EXECUTOR --- */}
        <div className="h-full">
          {/* ✅ THE MAGIC HAPPENS HERE */}
          <CodeExecutor 
            problem={problem}
            problemType="practice" // Pass "practice" so it calls the correct API endpoint
            sampleTestCases={sampleTestCases}
            onNextProblem={goToNextProblem}
          />
        </div>
      </div>
    </MainLayout>
  );
}