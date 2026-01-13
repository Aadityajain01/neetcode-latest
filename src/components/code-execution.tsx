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

// --- 1. USER-FRIENDLY TEMPLATES (Self-Documenting) ---
const LANGUAGE_TEMPLATES: Record<string, string> = {
  python: `class Solution:
    def solve(self, args):
        """
        :param args: list - Contains the input values
        :return: The result of your calculation
        
        Usage:
        - args[0] is the first input, args[1] is the second, etc.
        - Do NOT use input(). We handle reading for you.
        - Return your answer. Do NOT print() it.
        """
        
        # Example: For 'Sum of Two Numbers' (Input: 3 5)
        # val1 = int(args[0])
        # val2 = int(args[1])
        # return val1 + val2
        
        return None`,

  javascript: `class Solution {
    /**
     * @param {any[]} args - The input arguments from the test case
     * @returns {any} - The result
     */
    solve(args) {
        // Usage:
        // - args[0] is the first input line.
        // - Do NOT use process.stdin. We handle it.
        // - Return the result.
        
        // Example:
        // const num = parseInt(args[0]);
        // return num % 2 === 0 ? "Even" : "Odd";
        
        return null;
    }
}`,

  java: `// Java Solution
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // For Java, standard input is still the best way
        Scanner scanner = new Scanner(System.in);
        
        // 1. Read Input
        // int a = scanner.nextInt();
        
        // 2. Process logic...
        
        // 3. Print Output
        // System.out.println(a);
        
        scanner.close();
    }
}`,

  cpp: `// C++ Solution
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    // Optimize I/O operations
    ios::sync_with_stdio(0);
    cin.tie(0);

    // 1. Read Input
    // int a;
    // cin >> a;

    // 2. Process logic...

    // 3. Print Output
    // cout << a;

    return 0;
}`,

  c: `// C Solution
#include <stdio.h>
#include <stdlib.h>

int main() {
    // 1. Read Input
    // int a;
    // scanf("%d", &a);

    // 2. Process logic...

    // 3. Print Output
    // printf("%d", a);

    return 0;
}`,
};

// --- 2. HIDDEN DRIVER CODE (Handles the "Magic") ---
// This code is appended to the user's code before execution.
// It reads stdin, parses it, calls the user's class, and prints the result.
const DRIVER_CODE: Record<string, string> = {
  python: `
# --- DRIVER CODE (HIDDEN) ---
import sys, json

if __name__ == "__main__":
    try:
        # 1. Read all input from standard input
        input_str = sys.stdin.read().strip()
        
        # 2. Parse Input: Try JSON first (for arrays/objects), else split by spaces
        try:
            args = [json.loads(x) for x in input_str.splitlines() if x]
        except:
            args = input_str.split()

        # 3. Call the User's Solution
        sol = Solution()
        if hasattr(sol, 'solve'):
            result = sol.solve(args)
            
            # 4. Print Result (JSON formatted if possible)
            if result is not None:
                try:
                    print(json.dumps(result))
                except:
                    print(result)
    except Exception as e:
        print(f"Runtime Error: {e}")
`,

  javascript: `
// --- DRIVER CODE (HIDDEN) ---
const fs = require('fs');

try {
    // 1. Read Input
    const input = fs.readFileSync(0, 'utf-8').trim();
    
    // 2. Parse Input (Try JSON line by line)
    const lines = input ? input.split('\\n') : [];
    const args = lines.map(line => {
        try { return JSON.parse(line); } catch(e) { return line; }
    });

    // 3. Call User's Solution
    const sol = new Solution();
    if (typeof sol.solve === 'function') {
        const result = sol.solve(args);
        
        // 4. Print Result
        if (result !== undefined && result !== null) {
            console.log(JSON.stringify(result));
        }
    }
} catch (e) {
    console.error("Runtime Error:", e);
}
`
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

interface CodeExecutorProps {
  problem: Problem;
  problemType: 'dsa' | 'practice';
  sampleTestCases: TestCase[];
  onNextProblem?: () => void;
}

export function CodeExecutor({ problem, problemType, sampleTestCases, onNextProblem }: CodeExecutorProps) {
  // --- STATE ---
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
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
      const firstLang = problem.languages[0].toLowerCase();
      setLanguage(firstLang);
      // Set the helpful template
      setCode(LANGUAGE_TEMPLATES[firstLang] || "");
    }
    
    // Set default custom input from sample
    if (sampleTestCases?.[0]?.input) {
        setCustomInput(sampleTestCases[0].input);
    }
  }, [problem, sampleTestCases, triggerTutorial]);

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
    setLanguage(newLanguage);
    setCode(LANGUAGE_TEMPLATES[newLanguage] || code);
  };

  // Helper: Combines User Code + Hidden Driver
  const getExecutableCode = () => {
    if (DRIVER_CODE[language]) {
        return code + "\n" + DRIVER_CODE[language];
    }
    return code;
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
      const languageId = JUDGE0_LANGUAGE_MAP[language];
      
      if (!languageId) {
        toast.error(`Language not supported: ${language}`);
        setIsRunning(false);
        return;
      }

      // Inject driver code before sending
      const sourceCode = getExecutableCode();

      const submitRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/execute/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ 
            source_code: sourceCode, 
            language_id: languageId, 
            stdin: customInput || sampleTestCases[0]?.input || "" 
        }),
      });

      const { token } = await submitRes.json();
      
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
      const sourceCode = getExecutableCode();

      const submission = await submissionApi.submitCode({ 
          problemId: problem._id, 
          code: sourceCode, // Send code + driver
          language 
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
    <div className="flex flex-col gap-3 h-full">
      {/* EDITOR */}
      <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden relative shadow-sm">
          <div className="h-12 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950">
            
            {/* Title with Help Tooltip */}
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <Code2 className="h-4 w-4 text-emerald-500" /> Code Editor
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-zinc-600 hover:text-zinc-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-zinc-700 text-zinc-300 max-w-xs p-3">
                      <p className="font-semibold text-emerald-400 mb-1">How inputs work:</p>
                      <p className="text-xs">
                        For Python/JS, we use a hidden wrapper.<br/>
                        Use the <code>args</code> variable to access inputs.<br/>
                        Do NOT read standard input manually.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            </div>

            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-36 h-7 bg-zinc-900 border-zinc-700 text-zinc-300 text-xs focus:ring-0"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-300">
                {problem.languages.map(l => (
                  <SelectItem key={l} value={l.toLowerCase()} className="text-xs">{LANGUAGE_NAMES[l.toLowerCase()] || l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 relative bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(v) => setCode(v || "")}
              theme="vs-dark"
              options={{ minimap: { enabled: false }, fontSize: 14, fontFamily: "'JetBrains Mono', monospace", padding: { top: 16 } }}
            />
            
            {/* Action Buttons */}
            <div className="absolute bottom-4 right-6 flex gap-2 z-10">
              <Button onClick={handleRunCode} disabled={isRunning || isSubmitting} size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shadow-lg backdrop-blur-md">
                {isRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />} Run
              </Button>
              <Button onClick={handleSubmitCode} disabled={isRunning || isSubmitting} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg border border-emerald-500/50">
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />} Submit
              </Button>
              {currentSubmission?.status === 'accepted' && outputMode === 'submit' && onNextProblem && (
                <Button onClick={onNextProblem} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white animate-in fade-in zoom-in duration-300 shadow-lg border border-purple-500/50">
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
          </div>
      </div>

      {/* TERMINAL / OUTPUT */}
      <div className="h-[35%] flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-inner">
          <div className="flex border-b border-zinc-800 bg-zinc-900/50">
            <button onClick={() => setActiveTab('custom_input')} className={cn("px-4 py-2 text-xs font-bold uppercase tracking-wider border-r border-zinc-800 transition-colors", activeTab === 'custom_input' ? "bg-zinc-950 text-emerald-500" : "text-zinc-500 hover:text-zinc-300")}>Input (Stdin)</button>
            <button onClick={() => setActiveTab('output')} className={cn("px-4 py-2 text-xs font-bold uppercase tracking-wider border-r border-zinc-800 transition-colors", activeTab === 'output' ? "bg-zinc-950 text-emerald-500" : "text-zinc-500 hover:text-zinc-300")}>Output / Verdict</button>
          </div>

          <div className="flex-1 p-0 overflow-hidden relative">
            {activeTab === 'custom_input' ? (
              <Textarea 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter custom input here..."
                  className="w-full h-full bg-transparent border-none resize-none p-4 font-mono text-sm text-zinc-300 focus-visible:ring-0"
              />
            ) : (
              <div className="w-full h-full p-4 font-mono text-sm overflow-auto text-zinc-300 custom-scrollbar relative">
                  
                  {outputMode === 'submit' && currentSubmission ? (
                    // SUBMISSION RESULTS
                    <div className="space-y-4 animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", currentSubmission.status === 'accepted' ? "bg-emerald-500/10" : (currentSubmission.status === 'pending' || currentSubmission.status === 'running') ? "bg-blue-500/10" : "bg-red-500/10")}>
                              {currentSubmission.status === 'accepted' ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> :
                              (currentSubmission.status === 'pending' || currentSubmission.status === 'running') ? <Loader2 className="h-6 w-6 text-blue-500 animate-spin" /> :
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
                                <div><span className="text-zinc-500 block mb-1">Input:</span> <pre className="text-zinc-300 bg-black/30 p-2 rounded whitespace-pre-wrap">{(currentSubmission as any ).failureDetails.input}</pre></div>
                                <div><span className="text-zinc-500 block mb-1">Expected:</span> <pre className="text-emerald-400/80 bg-black/30 p-2 rounded whitespace-pre-wrap">{(currentSubmission as any ).failureDetails.expected}</pre></div>
                                <div><span className="text-zinc-500 block mb-1">Your Output:</span> <pre className="text-red-400/80 bg-black/30 p-2 rounded whitespace-pre-wrap">{(currentSubmission as any ).failureDetails.output}</pre></div>
                              </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    // RUN OUTPUT
                    <pre className="text-zinc-300 whitespace-pre-wrap">{output || <span className="text-zinc-600 italic">Run code to see output...</span>}</pre>
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
      </div>
    </div>
  );
}