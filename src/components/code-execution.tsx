"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Loader2, Play, Send, ChevronRight, Code2, RotateCcw, 
  CheckCircle2, XCircle, AlertTriangle, HelpCircle 
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { submissionApi, Submission, Problem, TestCase } from "@/lib/api-modules";
import { useUIStore } from "@/store/ui-store";
import {
  getEditorSnippet,
  isFunctionBasedProblem,
  JUDGE0_LANGUAGE_MAP,
  LANGUAGE_NAMES,
  normalizeExecutionLanguage,
} from "@/lib/execution/snippets";

interface CodeExecutorProps {
  problem: Problem;
  problemType: 'dsa' | 'practice';
  sampleTestCases: TestCase[];
  onNextProblem?: () => void;
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  initialLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  isReadOnly?: boolean;
}

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function CodeExecutor({ problem, problemType, sampleTestCases, onNextProblem, initialCode, onCodeChange, initialLanguage, onLanguageChange, isReadOnly = false }: CodeExecutorProps) {
  // --- STATE ---
  const [code, setCode] = useState(initialCode || "");
  const [language, setLanguage] = useState(initialLanguage || "javascript");
  const [customInput, setCustomInput] = useState("");
  const [activeTab, setActiveTab] = useState<'custom_input' | 'output'>('custom_input');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outputMode, setOutputMode] = useState<'run' | 'submit' | null>(null);
  const [output, setOutput] = useState("");
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);

  const triggerTutorial = useUIStore((state) => state.triggerTutorialIfFirstTime);

  // --- INITIALIZATION ---
  useEffect(() => {
    triggerTutorial();

    if (problem.languages && problem.languages.length > 0) {
      const firstLang = normalizeExecutionLanguage(initialLanguage || problem.languages[0]);
      setLanguage(firstLang);
      
      const defaultCode = initialCode || getEditorSnippet(problem, firstLang);
      setCode(defaultCode);
      
      // Update parent immediately on mount
      if (!initialCode) onCodeChange?.(defaultCode);
      if (!initialLanguage) onLanguageChange?.(firstLang);
    }
    
    // Set default custom input from sample
    if (sampleTestCases?.[0]?.input) {
        setCustomInput(sampleTestCases[0].input);
    }
  }, [
    initialCode,
    initialLanguage,
    onCodeChange,
    onLanguageChange,
    problem.codeSnippets,
    problem.functionName,
    problem.languages,
    sampleTestCases,
    triggerTutorial,
  ]);

  // Sync from props if they change externally
  useEffect(() => {
    if (initialCode !== undefined && initialCode !== code) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    if (initialLanguage !== undefined) {
      const normalizedLanguage = normalizeExecutionLanguage(initialLanguage);
      if (normalizedLanguage !== language) {
        setLanguage(normalizedLanguage);
      }
    }
  }, [initialLanguage]);


  // --- POLLING SUBMISSION ---
  useEffect(() => {
    if (!currentSubmission?._id || outputMode === 'run') return;

    const interval = setInterval(async () => {
      try {
        const updated = await submissionApi.getSubmissionById(currentSubmission._id);
        setCurrentSubmission(updated);
        setActiveTab('output');
        
        if (updated.status !== "pending" && updated.status !== "running") {
          clearInterval(interval);
          if (updated.status === 'accepted') toast.success("Solution Accepted!");
        }
      } catch { clearInterval(interval); }
    }, 1500);
    return () => clearInterval(interval);
  }, [currentSubmission?._id, outputMode]);

  // --- HANDLERS ---
  const handleLanguageChange = (newLanguage: string) => {
    const normalizedLanguage = normalizeExecutionLanguage(newLanguage);
    setLanguage(normalizedLanguage);
    onLanguageChange?.(normalizedLanguage);
    const newCode = getEditorSnippet(problem, normalizedLanguage) || code;
    setCode(newCode);
    onCodeChange?.(newCode);
  };
  
  const handleCodeChange = (v: string | undefined) => {
    const newVal = v || "";
    setCode(newVal);
    onCodeChange?.(newVal);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running...");
    setCurrentSubmission(null);
    setOutputMode('run');
    setActiveTab('output');

    try {
      const user = auth.currentUser;
      const idToken = await user?.getIdToken();
      const normalizedLanguage = normalizeExecutionLanguage(language);
      const languageId = JUDGE0_LANGUAGE_MAP[normalizedLanguage];
      
      if (!languageId) {
        toast.error(`Language not supported: ${language}`);
        setIsRunning(false);
        return;
      }

      const submitRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/execute/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ 
            source_code: code,
            language_id: languageId, 
            stdin: customInput || sampleTestCases[0]?.input || "",
            problemId: problem._id,
            language: normalizedLanguage,
        }),
      });

      const responseData = await submitRes.json();
      if (!submitRes.ok) {
        setOutput(responseData.error || "Execution failed");
        setIsRunning(false);
        return;
      }

      const { token } = responseData;
      
      // Poll for Run status
      let result: any = null;
      for (let i = 0; i < 20; i++) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/execute/execute/${token}/status`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        result = await res.json();
        if (result.status?.id !== 1 && result.status?.id !== 2) break;
        await new Promise((r) => setTimeout(r, 1000));
      }
      setOutput(result.stdout || result.stderr || result.compile_output || "No output");
    } catch { 
        setOutput("Execution failed"); 
    } finally { 
        setIsRunning(false); 
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setOutput("");
    setOutputMode('submit');
    setActiveTab('output');

    try {
      const submission = await submissionApi.submitCode({ 
          problemId: problem._id, 
          code,
          language: normalizeExecutionLanguage(language),
      });

      setCurrentSubmission(submission);
      toast.success("Code submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit code");
      setOutputMode(null);
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // --- RENDER ---
  return (
    <div className="h-full w-full">
      <ResizablePanelGroup direction="vertical" className="h-full w-full gap-2">
        {/* EDITOR */}
        <ResizablePanel defaultSize={65} minSize={35} className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="h-12 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950 flex-none">
              
              {/* Title with Help Tooltip */}
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <Code2 className="h-4 w-4 text-brand-500" /> Code Editor
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-zinc-600 hover:text-zinc-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-900 border-zinc-700 text-zinc-300 max-w-xs p-3">
                        <p className="font-semibold text-brand-500 mb-1">How execution works:</p>
                        <p className="text-xs">
                          {isFunctionBasedProblem(problem)
                            ? "Use the provided function signature and return the answer. Hidden driver code handles stdin/stdout for execution."
                            : "This is a classic stdin/stdout problem. Read input manually and print output from your program."}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
              </div>

              <Select value={language} onValueChange={handleLanguageChange} disabled={isReadOnly}>
                <SelectTrigger className="w-36 h-7 bg-zinc-900 border-zinc-700 text-zinc-300 text-xs focus:ring-0"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-300">
                  {problem.languages.map(l => (
                    <SelectItem key={l} value={normalizeExecutionLanguage(l)} className="text-xs">{LANGUAGE_NAMES[normalizeExecutionLanguage(l)] || l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 relative bg-[#1e1e1e] min-h-0">
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: "'JetBrains Mono', monospace", padding: { top: 16 }, readOnly: isReadOnly }}
              />
              
              {/* Action Buttons */}
              <div className="absolute bottom-4 right-6 flex gap-2 z-10">
                <Button onClick={handleRunCode} disabled={isReadOnly || isRunning || isSubmitting} size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shadow-lg backdrop-blur-md">
                  {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1.5 text-brand-500" />} Run
                </Button>
                <Button onClick={handleSubmitCode} disabled={isReadOnly || isRunning || isSubmitting} size="sm" className="bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold shadow-lg border border-brand-500/50">
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />} Submit
                </Button>
                {currentSubmission?.status === 'accepted' && outputMode === 'submit' && onNextProblem && (
                  <Button onClick={onNextProblem} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white animate-in fade-in zoom-in duration-300 shadow-lg border border-purple-500/50">
                    Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
            </div>
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className="h-3 w-full bg-transparent before:absolute before:left-0 before:top-1/2 before:h-px before:w-full before:-translate-y-1/2 before:bg-zinc-800 after:hidden [&>div]:h-10 [&>div]:w-[0.2px] [&>div]:rounded-xs [&>div]:bg-zinc-700 [&>div]:opacity-50 [&>div>svg]:size-1 [&>div>svg]:rotate-90 [&>div>svg]:text-zinc-500"
        />

        {/* TERMINAL / OUTPUT */}
        <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-inner">
            <div className="flex border-b border-zinc-800 bg-zinc-900/50 flex-none">
              <button onClick={() => setActiveTab('custom_input')} className={cn("px-4 py-2 text-xs font-bold uppercase tracking-wider border-r border-zinc-800 transition-colors", activeTab === 'custom_input' ? "bg-zinc-950 text-brand-500" : "text-zinc-500 hover:text-zinc-300")}>Input (Stdin)</button>
              <button onClick={() => setActiveTab('output')} className={cn("px-4 py-2 text-xs font-bold uppercase tracking-wider border-r border-zinc-800 transition-colors", activeTab === 'output' ? "bg-zinc-950 text-brand-500" : "text-zinc-500 hover:text-zinc-300")}>Output / Verdict</button>
            </div>

            <div className="flex-1 p-0 overflow-hidden relative min-h-0">
              {activeTab === 'custom_input' ? (
                <Textarea 
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom input here..."
                  disabled={isReadOnly}
                    className="w-full h-full bg-transparent border-none resize-none p-4 font-mono text-sm text-zinc-300 focus-visible:ring-0"
                />
              ) : (
                <div className="w-full h-full p-4 font-mono text-sm overflow-auto text-zinc-300 custom-scrollbar relative min-w-0 max-w-[calc(100dvw-2rem)] md:max-w-[calc(60dvw-2rem)]">
                    
                    {outputMode === 'submit' && currentSubmission ? (
                      // SUBMISSION RESULTS
                      <div className="space-y-4 animate-in slide-in-from-bottom-2">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", currentSubmission.status === 'accepted' ? "bg-emerald-500/10" : (currentSubmission.status === 'running' || currentSubmission.status === 'pending') ? "bg-blue-500/10" : "bg-red-500/10")}>
                                {currentSubmission.status === 'accepted' ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> :
                                (currentSubmission.status === 'running' || currentSubmission.status === 'pending') ? <Loader2 className="h-6 w-6 text-blue-500 animate-spin" /> :
                                <XCircle className="h-6 w-6 text-red-500" />
                                }
                            </div>
                            <div>
                                <h3 className={cn("text-lg font-bold capitalize", currentSubmission.status === 'accepted' ? "text-emerald-500" : "text-red-500")}>
                                  {currentSubmission.status === 'pending' || currentSubmission.status === 'running' ? 'Judging...' : currentSubmission.status}
                                </h3>
                                <div className="flex gap-4 mt-1 text-xs text-zinc-500">
                                  {currentSubmission.testCasesPassed !== undefined && <span>Cases: {currentSubmission.testCasesPassed}/{currentSubmission.totalTestCases}</span>}
                                  {currentSubmission.score !== undefined && <span>Score: {currentSubmission.score}</span>}
                                </div>
                            </div>
                          </div>
                          
                          {(currentSubmission as any)?.failureDetails && (
                            <div className="bg-zinc-900 rounded-lg p-3 border border-red-900/30 text-xs space-y-2">
                                <div className="text-red-400 font-bold flex items-center gap-2"><AlertTriangle className="h-3 w-3" /> Failed Case</div>
                                <div className="grid grid-cols-1 gap-2">
                                  <div><span className="text-zinc-500 block mb-1">Input:</span> <pre className="text-zinc-300 bg-black/30 p-2 rounded whitespace-pre-wrap break-all max-w-[calc(100dvw-5rem)] md:max-w-[calc(60dvw-5rem)] overflow-x-auto">{(currentSubmission as any ).failureDetails.input}</pre></div>
                                  <div><span className="text-zinc-500 block mb-1">Expected:</span> <pre className="text-emerald-400/80 bg-black/30 p-2 rounded whitespace-pre-wrap break-all max-w-[calc(100dvw-5rem)] md:max-w-[calc(60dvw-5rem)] overflow-x-auto">{(currentSubmission as any ).failureDetails.expected}</pre></div>
                                  <div><span className="text-zinc-500 block mb-1">Your Output:</span> <pre className="text-red-400/80 bg-black/30 p-2 rounded whitespace-pre-wrap break-all max-w-[calc(100dvw-5rem)] md:max-w-[calc(60dvw-5rem)] overflow-x-auto">{(currentSubmission as any ).failureDetails.output}</pre></div>
                                </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      // RUN OUTPUT
                      <pre className="text-zinc-300 whitespace-pre-wrap break-all max-w-[calc(100dvw-4rem)] md:max-w-[calc(60dvw-4rem)] overflow-x-auto">{output || <span className="text-zinc-600 italic">Run code to see output...</span>}</pre>
                    )}
                    
                    {/* Clear Button */}
                    {(output || (currentSubmission && outputMode === 'submit')) && (
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-zinc-600 hover:text-white" onClick={() => { setOutput(""); setCurrentSubmission(null); setOutputMode(null); }}>
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                </div>
              )}
            </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
