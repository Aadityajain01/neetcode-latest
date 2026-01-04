'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/layouts/main-layout';
import { mcqApi, MCQ } from '@/lib/api-modules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';

export default function MCQPracticePage() {
  const router = useRouter();
  const params = useParams();
  // Safe access to ID
  const mcqId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [mcq, setMCQ] = useState<MCQ | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);

  useEffect(() => {
    if (mcqId) {
      fetchMCQ();
    }
  }, [mcqId]);

  const fetchMCQ = async () => {
    if (!mcqId) return;
    try {
      setLoading(true);
      const data = await mcqApi.getMCQById(mcqId);
      setMCQ(data);
      // Reset states
      setSelectedAnswer(null);
      setSubmitted(false);
      setResult(null);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load MCQ');
      router.push('/mcqs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || submitted || !mcqId) return;

    setSubmitting(true);

    try {
      const submission = await mcqApi.submitAnswer({
        mcqId,
        answer: selectedAnswer,
      });

      setSubmitted(true);
      setResult({
        correct: submission.isCorrect,
        message: submission.isCorrect ? 'Correct! 🎉' : 'Incorrect. Keep practicing!',
      });

      toast.success(submission.isCorrect ? 'Correct answer!' : 'Incorrect answer');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
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

  if (!mcq) {
    return (
      <MainLayout>
        <Card className="bg-[#1E293B] border-[#334155] mt-8">
          <CardContent className="py-12 text-center">
            <p className="text-[#9CA3AF]">MCQ not found</p>
            <Link href="/mcqs">
              <Button variant="link" className="text-[#22C55E]">Return to list</Button>
            </Link>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link href="/mcqs">
          <Button variant="ghost" className="text-[#9CA3AF] hover:text-[#E5E7EB]">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to MCQs
          </Button>
        </Link>

        {/* MCQ Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#E5E7EB] mb-2">MCQ Practice</h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20">
                {mcq.language}
              </Badge>
              <Badge variant="outline" className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20">
                {mcq.difficulty.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Question */}
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader>
            <CardTitle className="text-[#E5E7EB]">Question</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-[#E5E7EB] leading-relaxed whitespace-pre-wrap">
              {mcq.question}
            </p>
          </CardContent>
        </Card>

        {/* Options */}
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader>
            <CardTitle className="text-[#E5E7EB]">Select Your Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswer?.toString()}
              onValueChange={(value) => {
                if (!submitted) setSelectedAnswer(parseInt(value));
              }}
              className="space-y-3"
            >
              {mcq.options.map((option, index) => {
                let cardStyle = "bg-[#0F172A] border-[#334155] hover:border-[#38BDF8]";
                
                // Styling logic for result state
                if (submitted) {
                  if (result?.correct && index === selectedAnswer) {
                     // User was correct and this is the selected one
                     cardStyle = "bg-[#22C55E]/10 border-[#22C55E]";
                  } else if (!result?.correct && index === selectedAnswer) {
                     // User was wrong and this is the selected one
                     cardStyle = "bg-[#EF4444]/10 border-[#EF4444]";
                  }
                } else if (selectedAnswer === index) {
                   // Just selected, not submitted
                   cardStyle = "bg-[#38BDF8]/10 border-[#38BDF8]";
                }

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${cardStyle}`}
                    onClick={() => !submitted && setSelectedAnswer(index)}
                  >
                    <RadioGroupItem value={index.toString()} className="sr-only" />
                    <div className="flex-1">
                      <span className="font-medium text-[#E5E7EB]">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                    </div>
                    {submitted && result?.correct && index === selectedAnswer && (
                       <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                    )}
                    {submitted && !result?.correct && index === selectedAnswer && (
                       <XCircle className="h-5 w-5 text-[#EF4444]" />
                    )}
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Actions / Result */}
        {!submitted ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null || submitting}
            size="lg"
            className="w-full bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" /> Submit Answer
              </>
            )}
          </Button>
        ) : (
          <Card className={`bg-[#1E293B] border-2 ${result?.correct ? 'border-[#22C55E]' : 'border-[#EF4444]'}`}>
            <CardContent className="py-6 text-center">
              <h2 className={`text-2xl font-bold mb-2 ${result?.correct ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {result?.message}
              </h2>
              {result?.correct && mcq.explanation && (
                <div className="mt-4 p-4 bg-[#0F172A] rounded-lg border border-[#334155] text-left">
                  <h3 className="font-semibold text-[#E5E7EB] mb-2">Explanation:</h3>
                  <p className="text-[#9CA3AF]">{mcq.explanation}</p>
                </div>
              )}
              <Link href="/mcqs">
                <Button variant="outline" className="mt-6 bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
                  Try Another MCQ <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}