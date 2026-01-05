// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import MainLayout from '@/components/layouts/main-layout';
// import { problemApi, submissionApi } from '@/lib/api-modules';
// import { Problem, TestCase, Submission } from '@/lib/api-modules';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { toast } from 'sonner';
// import { Loader2, Play, Send, Clock, Database } from 'lucide-react';
// import Editor from '@monaco-editor/react';
// import { auth } from '@/lib/firebase';
// import { BackHeader } from '@/components/BacHeader';

// const LANGUAGE_TEMPLATES: Record<string, string> = {
//   javascript: `function solve(input) {\n  return input;\n}`,
//   python: `def solve():\n    pass`,
//   java: `public class Solution {\n    public static void main(String[] args) {\n    }\n}`,
//   cpp: `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    return 0;\n}`,
//   c: `#include <stdio.h>\nint main() {\n    return 0;\n}`,
// };

// const LANGUAGE_NAMES: Record<string, string> = {
//   javascript: 'JavaScript',
//   python: 'Python',
//   java: 'Java',
//   cpp: 'C++',
//   c: 'C',
// };

// const JUDGE0_LANGUAGE_MAP: Record<string, number> = {
//   javascript: 63,
//   python: 71,
//   java: 62,
//   cpp: 54,
//   c: 11,
// };

// export default function PracticeDetailPage() {
//   const router = useRouter();
//   const { id } = useParams<{ id: string }>();

//   const [problem, setProblem] = useState<Problem | null>(null);
//   const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [code, setCode] = useState('');
//   const [language, setLanguage] = useState('javascript');
//   const [isRunning, setIsRunning] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [output, setOutput] = useState('');
//   const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);

//   useEffect(() => {
//     if (id) fetchProblem();
//   }, [id]);

//   const fetchProblem = async () => {
//     try {
//       setLoading(true);
//       const data = await problemApi.getProblemById(id);
//       setProblem(data.problem);
//       setSampleTestCases(data.sampleTestCases || []);

//       const firstLang = data.problem.languages?.[0]?.toLowerCase();
//       if (firstLang) {
//         setLanguage(firstLang);
//         setCode(LANGUAGE_TEMPLATES[firstLang] || '');
//       }
//     } catch {
//       toast.error('Failed to load problem');
//       router.push('/practice');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- RUN CODE (FIXED) ---------------- */

//   const handleRunCode = async () => {
//     if (!problem) return;

//     setIsRunning(true);
//     setOutput('Running...');

//     try {
//       const user = auth.currentUser;
//       const idToken = await user?.getIdToken();

//       const languageId = JUDGE0_LANGUAGE_MAP[language];
//       if (!languageId) {
//         toast.error('Language not supported');
//         return;
//       }

//       const submitRes = await fetch(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/execute`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${idToken}`,
//           },
//           body: JSON.stringify({
//             source_code: code,
//             language_id: languageId,
//             stdin: sampleTestCases[0]?.input || '',
//           }),
//         }
//       );

//       const { token } = await submitRes.json();

//       let result: any;
//       for (let i = 0; i < 20; i++) {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/execute/${token}/status`,
//           {
//             headers: { Authorization: `Bearer ${idToken}` },
//           }
//         );

//         result = await res.json();
//         if (![1, 2].includes(result.status?.id)) break;
//         await new Promise(r => setTimeout(r, 1000));
//       }

//       setOutput(
//         result.stdout ||
//           result.stderr ||
//           result.compile_output ||
//           'No output'
//       );
//     } catch {
//       setOutput('Execution failed');
//     } finally {
//       setIsRunning(false);
//     }
//   };

//   /* ---------------- SUBMIT CODE ---------------- */

//   const handleSubmitCode = async () => {
//     if (!problem) return;

//     setIsSubmitting(true);
//     try {
//       const submission = await submissionApi.submitCode({
//         problemId: id,
//         code,
//         language,
//       });

//       setCurrentSubmission(submission);
//       toast.success('Code submitted successfully!');
//     } catch (e: any) {
//       toast.error(e.message || 'Submission failed');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="flex justify-center py-12">
//           <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
//         </div>
//       </MainLayout>
//     );
//   }

//   if (!problem) return null;

//   return (
//     <MainLayout>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* LEFT */}
//         <Card className="bg-[#1E293B] border-[#334155]">
//           <CardHeader>
//             <CardTitle className="text-[#E5E7EB] text-2xl">
//               <BackHeader title={problem.title} ></BackHeader>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-[#E5E7EB] whitespace-pre-wrap">
//               {problem.description}
//             </p>

//             <div className="mt-4 text-sm text-[#9CA3AF] space-y-1">
//               <div className="flex gap-2 items-center">
//                 <Clock className="h-4 w-4" /> {problem.timeLimit}s
//               </div>
//               <div className="flex gap-2 items-center">
//                 <Database className="h-4 w-4" /> {problem.memoryLimit}MB
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* RIGHT */}
//         <div className="space-y-4">
//           <Card className="bg-[#1E293B] border-[#334155]">
//             <CardHeader className="flex justify-between items-center">
//               <CardTitle className="text-[#E5E7EB]">Code Editor</CardTitle>
//               <Select value={language} onValueChange={setLanguage}>
//                 <SelectTrigger className="w-40 bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent className="bg-[#1E293B] border-[#334155]">
//                   {problem.languages.map(lang => (
//                     <SelectItem key={lang} value={lang.toLowerCase()}>
//                       {LANGUAGE_NAMES[lang.toLowerCase()]}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </CardHeader>

//             <CardContent className="p-0">
//               <Editor
//                 height="350px"
//                 language={language}
//                 value={code}
//                 onChange={v => setCode(v || '')}
//                 theme="vs-dark"
//               />
//             </CardContent>
//           </Card>

//           <div className="flex gap-3">
//             <Button
//               onClick={handleRunCode}
//               disabled={isRunning || isSubmitting}
//               className="flex-1 bg-[#38BDF8]"
//             >
//               {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
//               Run
//             </Button>

//             <Button
//               onClick={handleSubmitCode}
//               disabled={isRunning || isSubmitting}
//               className="flex-1 bg-[#22C55E]"
//             >
//               {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
//               Submit
//             </Button>
//           </div>

//           <Textarea
//             value={output}
//             readOnly
//             className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] min-h-[160px]"
//             placeholder="Output will appear here..."
//           />
//         </div>
//       </div>
//     </MainLayout>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import {
  problemApi,
  submissionApi,
  Problem,
  TestCase,
  Submission,
} from "@/lib/api-modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Play, Send, Clock, Database } from "lucide-react";
import Editor from "@monaco-editor/react";
import { auth } from "@/lib/firebase";
import { BackHeader } from "@/components/BacHeader";

const LANGUAGE_TEMPLATES: Record<string, string> = {
  javascript: `// JavaScript Solution
function solve(input) {
  // Your code here
  return input;
}`,
  python: `# Python Solution
def solve():
    # Your code here
    pass`,
  java: `// Java Solution
import java.util.*;
public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`,
  cpp: `// C++ Solution
#include <bits/stdc++.h>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
  c: `// C Solution
#include <stdio.h>

int main() {
    // Your code here
    return 0;
}`,
};

const LANGUAGE_NAMES: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
};

/** 🔹 Judge0 language mapping */
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

  const problemId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const [sessionProblems, setSessionProblems] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [problem, setProblem] = useState<Problem | null>(null);
  const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState("");
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(
    null
  );
  const [customInput, setCustomInput] = useState("");
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

      router.replace(`/problems/${shuffled[0]}`);
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
      setCurrentIndex(parsed.index);
    } else {
      startNewSession(problem.difficulty);
    }
  }, [problem?.difficulty]);

  useEffect(() => {
    if (problemId) fetchProblem();
  }, [problemId]);
  // 🔹 Poll submission status after submit
  useEffect(() => {
    if (!currentSubmission?._id) return;

    const interval = setInterval(async () => {
      try {
        const updated = await submissionApi.getSubmissionById(
          currentSubmission._id
        );

        setCurrentSubmission(updated);

        if (updated.status !== "pending" && updated.status !== "running") {
          clearInterval(interval);
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [currentSubmission?._id]);

  const fetchProblem = async () => {
    if (!problemId) return;
    try {
      setLoading(true);
      const data = await problemApi.getProblemById(problemId);

      const prob = data?.problem;
      if (!prob) throw new Error("Problem data is missing");

      setProblem(prob);
      setSampleTestCases(data?.sampleTestCases || []);

      if (prob.languages && prob.languages.length > 0) {
        const firstLang = prob.languages[0].toLowerCase();
        setLanguage(firstLang);
        setCode(LANGUAGE_TEMPLATES[firstLang] || "");
      }
    } catch (error) {
      toast.error("Failed to load problem");
      router.push("/problems");
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(LANGUAGE_TEMPLATES[newLanguage] || code);
  };
  const goToNextProblem = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= sessionProblems.length) {
      toast.success("🎉 You have completed all questions!");
      sessionStorage.removeItem(`dsa-session-${problem?.difficulty}`);
      return;
    }

    const key = `dsa-session-${problem?.difficulty}`;

    sessionStorage.setItem(
      key,
      JSON.stringify({
        list: sessionProblems,
        index: nextIndex,
      })
    );

    setCurrentIndex(nextIndex);
    router.push(`/problems/${sessionProblems[nextIndex]}`);
  };

  const handleRunCode = async () => {
    if (!problem) return;
    setIsRunning(true);
    setOutput("Running...");

    try {
      const user = auth.currentUser;
      const idToken = await user?.getIdToken();

      const languageId = JUDGE0_LANGUAGE_MAP[language];
      if (!languageId) {
        toast.error(`Language not supported: ${language}`);
        setIsRunning(false);
        return;
      }

      const submitRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/execute`,
        {
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
        }
      );

      const { token } = await submitRes.json();

      // Poll execution result
      let result: any = null;
      for (let i = 0; i < 20; i++) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/execute/${token}/status`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );

        result = await res.json();
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

  /** 🔹 Submit Code */
  const handleSubmitCode = async () => {
    if (!problem || !problemId) return;
    setIsSubmitting(true);
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12 min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      </MainLayout>
    );
  }

  if (!problem) return null;

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Section */}
        <div className="space-y-6">
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader>
              <BackHeader title={problem.title}></BackHeader>
              <div className="flex flex-wrap gap-2">
                {problem.difficulty && (
                  <span className="px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] rounded-full text-sm font-medium">
                    {problem.difficulty}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert whitespace-pre-wrap text-[#E5E7EB]">
                {problem.description}
              </div>

              <div className="mt-6 p-4 bg-[#0F172A] rounded-lg border border-[#334155] text-sm text-[#9CA3AF] space-y-2">
                <div className="flex gap-2 items-center">
                  <Clock className="h-4 w-4" />
                  Time Limit: {problem.timeLimit}s
                </div>
                <div className="flex gap-2 items-center">
                  <Database className="h-4 w-4" />
                  Memory Limit: {problem.memoryLimit}MB
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor Section */}
        <div className="space-y-6">
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#E5E7EB]">Code Editor</CardTitle>

                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-40 bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-[#334155]">
                    {problem.languages.map((lang) => (
                      <SelectItem key={lang} value={lang.toLowerCase()}>
                        {LANGUAGE_NAMES[lang.toLowerCase()] || lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="h-96">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(v) => setCode(v || "")}
                  theme="vs-dark"
                  options={{ minimap: { enabled: false }, fontSize: 14 }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              className="flex-1 bg-[#38BDF8]"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run Code
            </Button>

            <Button
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
              className="flex-1 bg-[#22C55E]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit
            </Button>
            <Button
              onClick={() => goToNextProblem()}
              disabled={
                !currentSubmission || currentSubmission.status !== "accepted"
              }
              className="flex-1 bg-[#9333EA]"
            >
              Next Question →
            </Button>
          </div>

          {isRunning || isSubmitting || output ? (
            <Card className="bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-[#E5E7EB]">
                  {currentSubmission ? "Submission Result" : "Output"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 text-sm text-[#E5E7EB]">
                {!currentSubmission ? (
                  <Textarea
                    value={output}
                    readOnly
                    className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] min-h-[150px] font-mono"
                    placeholder="Output will appear here..."
                  />
                ) : currentSubmission.status === "pending" ||
                  currentSubmission.status === "running" ? (
                  <p className="text-[#9CA3AF]">Judging submission...</p>
                ) : (
                  <>
                    <p>
                      <strong>Verdict:</strong>{" "}
                      <span className="capitalize">
                        {currentSubmission.status}
                      </span>
                    </p>

                    {typeof currentSubmission.testCasesPassed === "number" && (
                      <p>
                        <strong>Test Cases:</strong>{" "}
                        {currentSubmission.testCasesPassed} /{" "}
                        {currentSubmission.totalTestCases}
                      </p>
                    )}

                    {currentSubmission.score! > 0 && (
                      <p>
                        <strong>Score:</strong> {currentSubmission.score}
                      </p>
                    )}

                    {(currentSubmission as any)?.failureDetails && (
                      <div className="mt-2">
                        <p className="font-semibold">Failed Test Case</p>
                        <pre className="bg-[#0F172A] p-2 rounded text-xs whitespace-pre-wrap">
                          {`Input:
                                ${(currentSubmission as any)?.failureDetails?.input}

                                Expected:
                                ${(currentSubmission as any)?.failureDetails?.expected}

                                Your Output:
                                ${(currentSubmission as any)?.failureDetails?.output}`}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-[#E5E7EB]">
                  Custom Input (stdin)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={
                    sampleTestCases[0]?.input
                      ? `Example:\n${sampleTestCases[0].input}`
                      : "Enter input here"
                  }
                  className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] min-h-[120px] font-mono"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
