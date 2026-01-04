'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/layouts/main-layout';
import { problemApi, submissionApi } from '@/lib/api-modules';
import { Problem, TestCase, Submission } from '@/lib/api-modules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Play, Send, Clock, Database } from 'lucide-react';
import Editor from '@monaco-editor/react';

const LANGUAGE_TEMPLATES: { [key: string]: string } = {
  javascript: `// JavaScript Solution\nfunction solve(input) {\n  // Your code here\n  return input;\n}`,
  python: `# Python Solution\ndef solve():\n    # Your code here\n    pass`,
  java: `// Java Solution\nimport java.util.*;\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
  cpp: `// C++ Solution\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
  c: `// C Solution\n#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}`,
};

const LANGUAGE_NAMES: { [key: string]: string } = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
};

export default function PracticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const problemId = params.id as string;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [sampleTestCases, setSampleTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState('');
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    if (problemId) {
      fetchProblem();
    }
  }, [problemId]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const data = await problemApi.getProblemById(problemId);
      setProblem(data.problem);
      setSampleTestCases(data.sampleTestCases || []);

      if (data.problem.languages && data.problem.languages.length > 0) {
        const firstLang = data.problem.languages[0];
        setLanguage(firstLang.toLowerCase());
        setCode(LANGUAGE_TEMPLATES[firstLang.toLowerCase()] || '');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load problem');
      router.push('/practice');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(LANGUAGE_TEMPLATES[newLanguage] || code);
  };

  const handleRunCode = async () => {
    if (!problem) return;

    setIsRunning(true);
    setOutput('Running code...');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/execute?XTransformPort=3001`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          source_code: code,
          language_id: language,
          stdin: sampleTestCases[0]?.input || '',
        }),
      });

      const result = await response.json();
      await pollExecutionStatus(result.token);
    } catch (error: any) {
      toast.error(error.message || 'Failed to run code');
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const pollExecutionStatus = async (token: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/execute/${token}/status?XTransformPort=3001`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        const result = await response.json();

        if ([1, 2].includes(result.status?.id)) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          const statusMap: { [key: number]: string } = {
            3: 'Accepted',
            4: 'Wrong Answer',
            5: 'Time Limit Exceeded',
            6: 'Compilation Error',
            7: 'Runtime Error',
            8: 'Memory Limit Exceeded',
          };

          const outputText = result.stdout || result.stderr || result.compile_output || '';
          setOutput(`${statusMap[result.status?.id] || 'Unknown'}\n\n${outputText}`);
          return;
        }
      } catch (error) {
        console.error('Poll error:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setOutput('Timeout: Execution took too long');
  };

  const handleSubmitCode = async () => {
    if (!problem) return;

    setIsSubmitting(true);

    try {
      const submission = await submissionApi.submitCode({
        problemId,
        code,
        language,
      });

      setCurrentSubmission(submission);
      toast.success('Code submitted successfully!');

      await pollSubmissionStatus(submission._id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollSubmissionStatus = async (submissionId: string) => {
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      try {
        const updatedSubmission = await submissionApi.getSubmissionById(submissionId);
        setCurrentSubmission(updatedSubmission);

        if (['accepted', 'wrong_answer', 'runtime_error', 'compile_error', 'time_limit_exceeded', 'memory_limit_exceeded'].includes(updatedSubmission.status)) {
          const statusMessages: { [key: string]: string } = {
            accepted: '✅ Accepted',
            wrong_answer: '❌ Wrong Answer',
            runtime_error: '⚠️ Runtime Error',
            compile_error: '⚠️ Compilation Error',
            time_limit_exceeded: '⏱️ Time Limit Exceeded',
            memory_limit_exceeded: '💾 Memory Limit Exceeded',
          };

          setOutput(`${statusMessages[updatedSubmission.status] || updatedSubmission.status}\n\nTest Cases Passed: ${updatedSubmission.testCasesPassed}/${updatedSubmission.totalTestCases}`);
          break;
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Poll submission error:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      </MainLayout>
    );
  }

  if (!problem) {
    return (
      <MainLayout>
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="py-12 text-center">
            <p className="text-[#9CA3AF]">Problem not found</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Problem Details */}
        <div className="space-y-6">
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl text-[#E5E7EB] mb-2">
                    {problem.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-[#38BDF8]/10 text-[#38BDF8] rounded-full text-sm font-medium">
                      Practice
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-[#E5E7EB] whitespace-pre-wrap">
                  {problem.description}
                </p>
              </div>

              <div className="mt-6 p-4 bg-[#0F172A] rounded-lg border border-[#334155]">
                <h3 className="font-semibold text-[#E5E7EB] mb-2">Constraints</h3>
                <div className="space-y-2 text-sm text-[#9CA3AF]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Time Limit: {problem.timeLimit}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>Memory Limit: {problem.memoryLimit}MB</span>
                  </div>
                </div>
              </div>

              {sampleTestCases.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-[#E5E7EB] mb-4">Sample Test Cases</h3>
                  <div className="space-y-4">
                    {sampleTestCases.map((testCase) => (
                      <div
                        key={testCase._id}
                        className="p-4 bg-[#0F172A] rounded-lg border border-[#334155]"
                      >
                        <div className="mb-2">
                          <p className="text-sm text-[#9CA3AF] mb-1">Input:</p>
                          <pre className="text-sm text-[#E5E7EB] bg-[#111827] p-3 rounded overflow-x-auto">
                            {testCase.input}
                          </pre>
                        </div>
                        <div>
                          <p className="text-sm text-[#9CA3AF] mb-1">Output:</p>
                          <pre className="text-sm text-[#E5E7EB] bg-[#111827] p-3 rounded overflow-x-auto">
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Code Editor */}
        <div className="space-y-6">
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader>
              <div className="flex items-center justify-between">
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
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              className="flex-1 bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-white"
            >
              {isRunning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Run Code
            </Button>
            <Button
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
              className="flex-1 bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit
            </Button>
          </div>

          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-[#E5E7EB]">Output</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={output}
                readOnly
                className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] min-h-[200px] font-mono text-sm"
                placeholder="Output will appear here..."
              />
            </CardContent>
          </Card>

          {currentSubmission && (
            <Card className="bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-[#E5E7EB]">Latest Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9CA3AF]">Status:</span>
                    <span className="font-semibold text-[#E5E7EB] uppercase">
                      {currentSubmission.status.replace('_', ' ')}
                    </span>
                  </div>
                  {currentSubmission.testCasesPassed !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#9CA3AF]">Test Cases:</span>
                      <span className="font-semibold text-[#E5E7EB]">
                        {currentSubmission.testCasesPassed}/{currentSubmission.totalTestCases}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
