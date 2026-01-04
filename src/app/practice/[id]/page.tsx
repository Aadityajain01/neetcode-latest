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
import { auth } from '@/lib/firebase';

const LANGUAGE_TEMPLATES: Record<string, string> = {
  javascript: `function solve(input) {\n  return input;\n}`,
  python: `def solve():\n    pass`,
  java: `public class Solution {\n    public static void main(String[] args) {\n    }\n}`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    return 0;\n}`,
  c: `#include <stdio.h>\nint main() {\n    return 0;\n}`,
};

const LANGUAGE_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
};

const JUDGE0_LANGUAGE_MAP: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 11,
};

export default function PracticeDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

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
    if (id) fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const data = await problemApi.getProblemById(id);
      setProblem(data.problem);
      setSampleTestCases(data.sampleTestCases || []);

      const firstLang = data.problem.languages?.[0]?.toLowerCase();
      if (firstLang) {
        setLanguage(firstLang);
        setCode(LANGUAGE_TEMPLATES[firstLang] || '');
      }
    } catch {
      toast.error('Failed to load problem');
      router.push('/practice');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- RUN CODE (FIXED) ---------------- */

  const handleRunCode = async () => {
    if (!problem) return;

    setIsRunning(true);
    setOutput('Running...');

    try {
      const user = auth.currentUser;
      const idToken = await user?.getIdToken();

      const languageId = JUDGE0_LANGUAGE_MAP[language];
      if (!languageId) {
        toast.error('Language not supported');
        return;
      }

      const submitRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            source_code: code,
            language_id: languageId,
            stdin: sampleTestCases[0]?.input || '',
          }),
        }
      );

      const { token } = await submitRes.json();

      let result: any;
      for (let i = 0; i < 20; i++) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/execute/${token}/status`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );

        result = await res.json();
        if (![1, 2].includes(result.status?.id)) break;
        await new Promise(r => setTimeout(r, 1000));
      }

      setOutput(
        result.stdout ||
          result.stderr ||
          result.compile_output ||
          'No output'
      );
    } catch {
      setOutput('Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  /* ---------------- SUBMIT CODE ---------------- */

  const handleSubmitCode = async () => {
    if (!problem) return;

    setIsSubmitting(true);
    try {
      const submission = await submissionApi.submitCode({
        problemId: id,
        code,
        language,
      });

      setCurrentSubmission(submission);
      toast.success('Code submitted successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      </MainLayout>
    );
  }

  if (!problem) return null;

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader>
            <CardTitle className="text-[#E5E7EB] text-2xl">
              {problem.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#E5E7EB] whitespace-pre-wrap">
              {problem.description}
            </p>

            <div className="mt-4 text-sm text-[#9CA3AF] space-y-1">
              <div className="flex gap-2 items-center">
                <Clock className="h-4 w-4" /> {problem.timeLimit}s
              </div>
              <div className="flex gap-2 items-center">
                <Database className="h-4 w-4" /> {problem.memoryLimit}MB
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT */}
        <div className="space-y-4">
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-[#E5E7EB]">Code Editor</CardTitle>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40 bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#334155]">
                  {problem.languages.map(lang => (
                    <SelectItem key={lang} value={lang.toLowerCase()}>
                      {LANGUAGE_NAMES[lang.toLowerCase()]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>

            <CardContent className="p-0">
              <Editor
                height="350px"
                language={language}
                value={code}
                onChange={v => setCode(v || '')}
                theme="vs-dark"
              />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              className="flex-1 bg-[#38BDF8]"
            >
              {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Run
            </Button>

            <Button
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
              className="flex-1 bg-[#22C55E]"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit
            </Button>
          </div>

          <Textarea
            value={output}
            readOnly
            className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] min-h-[160px]"
            placeholder="Output will appear here..."
          />
        </div>
      </div>
    </MainLayout>
  );
}
