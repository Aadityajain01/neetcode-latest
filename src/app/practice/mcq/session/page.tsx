"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import { mcqApi, MCQ } from "@/lib/api-modules";
import { BackHeader } from "@/components/BacHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";

type ResultState = {
  correct: boolean;
  correctAnswer: number;
  explanation?: string;
};

// 1. INNER COMPONENT: Logic, State & Search Params
function MCQSessionContent() {
  const params = useSearchParams();
  const lang = params.get("lang");
  const difficulty = params.get("difficulty");

  const [loading, setLoading] = useState(true);
  const [mcq, setMCQ] = useState<MCQ | null>(null);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);

  useEffect(() => {
    if (lang && difficulty) {
      fetchNextMCQ();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- FETCH NEXT MCQ ---------------- */

  const fetchNextMCQ = async () => {
    try {
      setLoading(true);

      const data = await mcqApi.getMCQs({
        language: lang!,
        difficulty: difficulty!,
        limit: 20,
      });

      const available = (data.mcqs || []).filter(
        (q: MCQ) => !seenIds.includes(q._id)
      );

      if (available.length === 0) {
        setMCQ(null);
        return;
      }

      const next = available[Math.floor(Math.random() * available.length)];

      setMCQ(next);
      setSeenIds((prev) => [...prev, next._id]);
      setSelectedAnswer(null);
      setSubmitted(false);
      setResult(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load MCQ");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SUBMIT ANSWER ---------------- */

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || submitted || !mcq) return;

    setSubmitting(true);

    try {
      const response = await mcqApi.submitAnswer({
        mcqId: mcq._id,
        answer: selectedAnswer,
      });

      const submission = response;

      setSubmitted(true);
      const normalizedCorrectAnswer =
        typeof (response as any).correctAnswer === "string"
          ? parseInt((response as any).correctAnswer, 10)
          : (response as any).correctAnswer;

      setResult({
        correct: Boolean((response as any).isCorrect),
        correctAnswer: (response as any).correctAnswer,
        explanation: (response as any).explanation ?? "",
      });

      toast.success(
        (response as any).isCorrect ? "Correct answer!" : "Incorrect answer"
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BackHeader
        title={`${lang?.toUpperCase()} MCQ Practice`}
        subtitle={`Difficulty: ${difficulty}`}
      />

      {!mcq ? (
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold text-[#E5E7EB] mb-2">
              No more questions 🎉
            </h2>
            <p className="text-[#9CA3AF]">
              You’ve completed all available MCQs for this category.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Meta */}
          <div className="flex items-center gap-3">
            <Badge className="bg-[#38BDF8]/10 text-[#38BDF8]">{lang}</Badge>
            <Badge className="bg-[#22C55E]/10 text-[#22C55E]">
              {difficulty}
            </Badge>
          </div>

          {/* Question */}
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-[#E5E7EB]">Question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-[#E5E7EB] whitespace-pre-wrap">
                {mcq.question}
              </p>
            </CardContent>
          </Card>

          {/* Options */}
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-[#E5E7EB]">
                Select Your Answer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup className="space-y-3">
                {mcq.options.map((option, index) => {
                  let style =
                    "bg-[#0F172A] border-[#334155] hover:border-[#38BDF8]";

                  // Selected (before submit)
                  if (!submitted && selectedAnswer === index) {
                    style = "bg-[#38BDF8]/10 border-[#38BDF8]";
                  }

                  // After submit
                  if (submitted && result) {
                    if (index === (result as any).correctAnswer) {
                      style = "bg-green-500/10 border-green-500";
                    } else if (
                      index === selectedAnswer &&
                      index !== (result as any).correctAnswer
                    ) {
                      style = "bg-red-500/10 border-red-500";
                    }
                  }

                  return (
                    <div
                      key={index}
                      onClick={() => !submitted && setSelectedAnswer(index)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${style}`}
                    >
                      <span className="text-[#E5E7EB]">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Submit / Result */}
          {!submitted ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null || submitting}
              className="w-full bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
              size="lg"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              {submitting ? "Submitting..." : "Submit Answer"}
            </Button>
          ) : (
            <Card
              className={`border-2 ${
                (result as any).correct ? "border-green-500" : "border-red-500"
              } bg-[#1E293B]`}
            >
              <CardContent className="py-6 text-center space-y-4">
                <h2
                  className={`text-2xl font-bold ${
                    (result as any).correct ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {(result as any).correct
                    ? "Correct! 🎉"
                    : "Incorrect. Keep practicing!"}
                </h2>

                {(result as any).explanation && (
                  <div className="bg-[#0F172A] p-4 rounded border border-[#334155] text-left">
                    <h3 className="text-[#E5E7EB] font-semibold mb-2">
                      Explanation
                    </h3>
                    <p className="text-[#9CA3AF]">{(result as any).explanation}</p>
                  </div>
                )}

                <Button
                  onClick={fetchNextMCQ}
                  className="bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-white"
                >
                  Next Question
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// 2. OUTER COMPONENT: Suspense Wrapper
export default function MCQSessionPage() {
  return (
    <MainLayout>
      <Suspense
        // fallback={
        //   <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        //     <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        //   </div>
        // }
      >
        <MCQSessionContent />
      </Suspense>
    </MainLayout>
  );
}
