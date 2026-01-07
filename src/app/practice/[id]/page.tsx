"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import {
  problemApi,
  submissionApi,
  Problem,
  TestCase,
  Submission,
} from "@/lib/api-modules";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  Play,
  Send,
  Clock,
  Database,
  ChevronRight,
  Code2,
  Terminal,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  History,
  ChevronLeft
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/BackButton";

// --- CONSTANTS ---
const LANGUAGE_TEMPLATES: Record<string, string> = {
  javascript: `// JavaScript Solution\nfunction solve(input) {\n  // Your code here\n  return input;\n}`,
  python: `# Python Solution\ndef solve():\n    # Your code here\n    pass`,
  java: `// Java Solution\nimport java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
  cpp: `// C++ Solution\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
  c: `// C Solution\n#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}`,
};

const LANGUAGE_NAMES: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
};

const JUDGE0_LANGUAGE_MAP: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 11,
  typescript: 74,
};

function shuffleArray(arr: string[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ProblemDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  // Handle array or string param
  const problemId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>([]);
  const [sessionProblems, setSessionProblems] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // UI Tabs
  const [activeTab, setActiveTab] = useState<'custom_input' | 'output'>('custom_input');
  
  // Editor State
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [customInput, setCustomInput] = useState("");
  
  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState("");
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);

  // --- 1. SESSION MANAGEMENT LOGIC ---
  const startNewSession = async (difficulty: string) => {
    try {
      const res = await problemApi.getProblems({
        type: "practice",
        difficulty,
        limit: 500,
      });

      const ids = res.problems.map((p: Problem) => p._id);
      const shuffled = shuffleArray(ids);

      sessionStorage.setItem(
        `dsa-session-${difficulty}`,
        JSON.stringify({ list: shuffled, index: 0 })
      );

      setSessionProblems(shuffled);
      setCurrentIndex(0);

      // Redirect to the first problem in the new session
      router.replace(`/practice/${shuffled[0]}`);
    } catch {
      toast.error("Failed to start DSA session");
    }
  };

  useEffect(() => {
    if (!problem?.difficulty) return;

    const key = `dsa-session-${problem.difficulty}`;
    const stored = sessionStorage.getItem(key);

    if (stored) {
      const parsed = JSON.parse(stored);
      setSessionProblems(parsed.list);
      
      // Find current index based on URL ID to sync state
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

  // --- 2. POLLING SUBMISSION STATUS LOGIC ---
  useEffect(() => {
    if (!currentSubmission?._id) return;

    const interval = setInterval(async () => {
      try {
        const updated = await submissionApi.getSubmissionById(currentSubmission._id);
        setCurrentSubmission(updated);

        if (updated.status !== "pending" && updated.status !== "running") {
          clearInterval(interval);
          // Auto-switch to output tab when done
          setActiveTab('output');
          if (updated.status === 'accepted') {
             toast.success("Solution Accepted!");
          }
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [currentSubmission?._id]);

  // --- 3. FETCH PROBLEM DATA ---
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

      // Set initial language and code
      if (prob.languages && prob.languages.length > 0) {
        const firstLang = prob.languages[0].toLowerCase();
        setLanguage(firstLang);
        setCode(LANGUAGE_TEMPLATES[firstLang] || "");
      }
      
      // Pre-fill custom input with sample case
      if (data?.sampleTestCases?.[0]?.input) {
        setCustomInput(data.sampleTestCases[0].input);
      }

    } catch (error) {
      toast.error("Failed to load problem");
      router.push("/practice");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. HANDLERS ---

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(LANGUAGE_TEMPLATES[newLanguage] || code);
  };

  const goToNextProblem = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= sessionProblems.length) {
      toast.success("🎉 You have completed all questions in this session!");
      sessionStorage.removeItem(`dsa-session-${problem?.difficulty}`);
      return;
    }

    const key = `dsa-session-${problem?.difficulty}`;
    sessionStorage.setItem(key, JSON.stringify({ list: sessionProblems, index: nextIndex }));

    setCurrentIndex(nextIndex);
    router.push(`/practice/${sessionProblems[nextIndex]}`);
  };

  const handleRunCode = async () => {
    if (!problem) return;
    
    setIsRunning(true);
    setOutput("Running...");
    setActiveTab('output'); // Switch to output view

    try {
      const user = auth.currentUser;
      const idToken = await user?.getIdToken();

      const languageId = JUDGE0_LANGUAGE_MAP[language];
      if (!languageId) {
        toast.error(`Language not supported: ${language}`);
        setIsRunning(false);
        return;
      }

      const submitRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          stdin: customInput || sampleTestCases[0]?.input || "",
        }),
      });

      const { token } = await submitRes.json();

      // Poll execution result
      let result: any = null;
      for (let i = 0; i < 20; i++) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/execute/${token}/status`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );

        result = await res.json();
        // 1=In Queue, 2=Processing. Anything else is done.
        if (result.status?.id !== 1 && result.status?.id !== 2) break;
        await new Promise((r) => setTimeout(r, 1000));
      }

      setOutput(
        result.stdout || result.stderr || result.compile_output || "No output"
      );
    } catch {
      setOutput("Execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!problem || !problemId) return;
    
    setIsSubmitting(true);
    setActiveTab('output'); // Show results panel

    try {
      const submission = await submissionApi.submitCode({
        problemId,
        code,
        language,
      });
      setCurrentSubmission(submission);
      toast.success("Code submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit code");
    } finally {
      setIsSubmitting(false);
    }
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
             <BackButton href="/practice" label="Back" className="mb-2" />
             
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
               <div className="whitespace-pre-wrap font-sans leading-relaxed">{problem.description}</div>
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: EDITOR + TERMINAL --- */}
        <div className="flex flex-col gap-3 h-full">
          
          {/* Editor Container */}
          <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm relative">
             
             {/* Toolbar */}
             <div className="h-12 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                   <Code2 className="h-4 w-4 text-emerald-500" /> Code Editor
                </div>
                
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-36 h-7 bg-zinc-900 border-zinc-700 text-zinc-300 text-xs focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-300">
                    {problem.languages.map((l) => (
                      <SelectItem key={l} value={l.toLowerCase()} className="text-xs">
                        {LANGUAGE_NAMES[l.toLowerCase()] || l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>

             {/* Monaco Editor */}
             <div className="flex-1 relative bg-[#1e1e1e]">
               <Editor
                 height="100%"
                 language={language}
                 value={code}
                 onChange={(v) => setCode(v || "")}
                 theme="vs-dark"
                 options={{ 
                   minimap: { enabled: false }, 
                   fontSize: 14, 
                   fontFamily: "'JetBrains Mono', monospace",
                   padding: { top: 16 } 
                 }}
               />
               
               {/* Floating Actions (Run/Submit/Next) */}
               <div className="absolute bottom-4 right-6 flex gap-2 z-10">
                 <Button 
                    onClick={handleRunCode} 
                    disabled={isRunning || isSubmitting} 
                    size="sm" 
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 shadow-lg backdrop-blur-md"
                 >
                    {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1.5 text-emerald-400 fill-emerald-400/20" />} 
                    Run
                 </Button>
                 
                 <Button 
                    onClick={handleSubmitCode} 
                    disabled={isRunning || isSubmitting} 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 border border-emerald-500/50"
                 >
                    {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />} 
                    Submit
                 </Button>

                 {/* Show Next button only if accepted */}
                 {currentSubmission?.status === 'accepted' && (
                    <Button 
                       onClick={goToNextProblem} 
                       size="sm" 
                       className="bg-purple-600 hover:bg-purple-500 text-white animate-in fade-in zoom-in duration-300 shadow-lg border border-purple-500/50"
                    >
                       Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                 )}
               </div>
             </div>
          </div>

          {/* Terminal / Output Pane */}
          <div className="h-[35%] flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-inner">
             
             {/* Tabs */}
             <div className="flex border-b border-zinc-800 bg-zinc-900/50">
               <button 
                 onClick={() => setActiveTab('custom_input')} 
                 className={cn("px-4 py-2 text-xs font-bold uppercase tracking-wider border-r border-zinc-800 transition-colors", 
                   activeTab === 'custom_input' ? "bg-zinc-950 text-emerald-500" : "text-zinc-500 hover:text-zinc-300"
                 )}
               >
                 Input
               </button>
               <button 
                 onClick={() => setActiveTab('output')} 
                 className={cn("px-4 py-2 text-xs font-bold uppercase tracking-wider border-r border-zinc-800 transition-colors", 
                   activeTab === 'output' ? "bg-zinc-950 text-emerald-500" : "text-zinc-500 hover:text-zinc-300"
                 )}
               >
                 Output
               </button>
             </div>

             {/* Content Area */}
             <div className="flex-1 p-0 overflow-hidden relative">
                {activeTab === 'custom_input' ? (
                  <div className="flex flex-col h-full">
                    <div className="px-4 py-2 text-xs text-zinc-500 bg-zinc-900/30">Stdin (Input for your code):</div>
                    <Textarea 
                       value={customInput}
                       onChange={(e) => setCustomInput(e.target.value)}
                       placeholder="Enter custom input here..."
                       className="flex-1 bg-transparent border-none resize-none rounded-none focus-visible:ring-0 font-mono text-sm text-zinc-300 p-4"
                    />
                  </div>
                ) : (
                  // Output Tab
                  <div className="absolute inset-0 flex flex-col">
                    <div className="flex-1 p-4 font-mono text-sm overflow-auto custom-scrollbar">
                       
                       {/* CASE 1: Submission Result */}
                       {currentSubmission && !output ? (
                          <div className="space-y-4 animate-in slide-in-from-bottom-2">
                             <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", 
                                   currentSubmission.status === 'accepted' ? "bg-emerald-500/10" : 
                                   (currentSubmission.status === 'pending' || currentSubmission.status === 'running') ? "bg-blue-500/10" :
                                   "bg-red-500/10"
                                )}>
                                   {currentSubmission.status === 'accepted' ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> :
                                    (currentSubmission.status === 'pending' || currentSubmission.status === 'running') ? <Loader2 className="h-6 w-6 text-blue-500 animate-spin" /> :
                                    <XCircle className="h-6 w-6 text-red-500" />
                                   }
                                </div>
                                <div>
                                   <h3 className={cn("text-lg font-bold capitalize", 
                                      currentSubmission.status === 'accepted' ? "text-emerald-500" : 
                                      (currentSubmission.status === 'pending' || currentSubmission.status === 'running') ? "text-blue-400" :
                                      "text-red-500"
                                   )}>
                                      {currentSubmission.status === 'pending' || currentSubmission.status === 'running' ? 'Judging...' : currentSubmission.status}
                                   </h3>
                                   
                                   {/* Stats */}
                                   <div className="flex gap-4 mt-1 text-xs text-zinc-500">
                                      {currentSubmission.testCasesPassed !== undefined && (
                                        <span>Cases: <span className="text-zinc-300">{currentSubmission.testCasesPassed}/{currentSubmission.totalTestCases}</span></span>
                                      )}
                                      {currentSubmission.score !== undefined && (
                                        <span>Score: <span className="text-zinc-300">{currentSubmission.score}</span></span>
                                      )}
                                   </div>
                                </div>
                             </div>

                             {/* Failed Case Details */}
                             {(currentSubmission as any)?.failureDetails && (
                                <div className="bg-zinc-900 rounded-lg p-3 border border-red-900/30 text-xs space-y-2">
                                   <div className="text-red-400 font-bold flex items-center gap-2"><AlertTriangle className="h-3 w-3" /> Failed Case</div>
                                   <div className="grid grid-cols-1 gap-2">
                                      <div><span className="text-zinc-500 block mb-1">Input:</span> <pre className="text-zinc-300 bg-black/30 p-2 rounded">{currentSubmission.failureDetails.input}</pre></div>
                                      <div><span className="text-zinc-500 block mb-1">Expected:</span> <pre className="text-emerald-400/80 bg-black/30 p-2 rounded">{currentSubmission.failureDetails.expected}</pre></div>
                                      <div><span className="text-zinc-500 block mb-1">Your Output:</span> <pre className="text-red-400/80 bg-black/30 p-2 rounded">{currentSubmission.failureDetails.output}</pre></div>
                                   </div>
                                </div>
                             )}
                          </div>
                       ) : (
                          // CASE 2: Run Code Output or Empty
                          <div className="text-zinc-300 whitespace-pre-wrap">
                             {output || <span className="text-zinc-600 italic">// Run code to see output...</span>}
                          </div>
                       )}
                    </div>

                    {/* Clear Output Button */}
                    {(output || currentSubmission) && (
                      <div className="absolute top-2 right-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-600 hover:text-white" onClick={() => { setOutput(""); setCurrentSubmission(null); }}>
                           <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}