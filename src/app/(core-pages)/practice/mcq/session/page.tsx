"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import { mcqApi, MCQ } from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, ArrowRight, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function MCQSessionContent() {
  const params = useSearchParams();
  const lang = params.get("lang");
  const difficulty = params.get("difficulty");

  const [loading, setLoading] = useState(true);
  const [mcq, setMCQ] = useState<MCQ | null>(null);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (lang && difficulty) fetchNextMCQ();
  }, []);

  const fetchNextMCQ = async () => {
    try {
      setLoading(true);
      const data = await mcqApi.getMCQs({ language: lang!, difficulty: difficulty!, limit: 20 });
      const available = (data.mcqs || []).filter((q: MCQ) => !seenIds.includes(q._id));

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
      toast.error("Failed to load MCQ");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null || !mcq) return;
    try {
      const res = await mcqApi.submitAnswer({ mcqId: mcq._id, answer: selectedAnswer });
      setSubmitted(true);
      setResult(res);
      if(res.isCorrect) toast.success("Correct Answer!");
      else toast.error("Incorrect Answer");
    } catch (e) { toast.error("Submission failed"); }
  };

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;

  if (!mcq) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
      <div className="p-6 bg-zinc-900 rounded-full border border-zinc-800"><CheckCircle2 className="h-12 w-12 text-emerald-500" /></div>
      <h2 className="text-2xl font-bold text-white">Session Complete!</h2>
      <p className="text-zinc-400">You've answered all available questions.</p>
      <Button onClick={() => window.location.href = '/practice'} variant="outline">Back to Practice</Button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold uppercase">{lang}</span>
          <span className={cn("px-3 py-1 rounded-full bg-zinc-800 text-xs font-bold uppercase", 
            difficulty === 'easy' ? 'text-emerald-400' : difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
          )}>{difficulty}</span>
        </div>
        <span className="text-zinc-500 text-sm font-mono">Q.{seenIds.length}</span>
      </div>

      {/* Question Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 mb-6 shadow-xl backdrop-blur-sm">
        <h2 className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-8">{mcq.question}</h2>

        <div className="space-y-3">
          {mcq.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            let stateClass = "border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 hover:border-zinc-600";
            
            if (submitted && result) {
              const correctIdx = typeof result.correctAnswer === 'string' ? parseInt(result.correctAnswer) : result.correctAnswer;
              if (idx === correctIdx) stateClass = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
              else if (isSelected && !result.isCorrect) stateClass = "border-red-500 bg-red-500/10 text-red-400";
              else stateClass = "border-zinc-800 opacity-50";
            } else if (isSelected) {
              stateClass = "border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500";
            }

            return (
              <div
                key={idx}
                onClick={() => !submitted && setSelectedAnswer(idx)}
                className={cn(
                  "relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                  stateClass
                )}
              >
                <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg border text-sm font-bold mr-4 transition-colors",
                   isSelected ? "border-emerald-500 bg-emerald-500 text-black" : "border-zinc-700 bg-zinc-900 text-zinc-500"
                )}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-base">{option}</span>
                
                {submitted && result && idx === (typeof result.correctAnswer === 'string' ? parseInt(result.correctAnswer) : result.correctAnswer) && (
                  <CheckCircle2 className="absolute right-4 h-5 w-5 text-emerald-500" />
                )}
                 {submitted && result && isSelected && !result.isCorrect && (
                  <XCircle className="absolute right-4 h-5 w-5 text-red-500" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-4">
        {!submitted ? (
          <Button 
            onClick={handleSubmit} 
            disabled={selectedAnswer === null}
            className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 text-base rounded-xl font-bold shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
          >
            Check Answer
          </Button>
        ) : (
          <Button 
            onClick={fetchNextMCQ}
            className="bg-zinc-100 hover:bg-white text-zinc-900 h-12 px-8 text-base rounded-xl font-bold transition-all hover:scale-105"
          >
            Next Question <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Explanation */}
      {submitted && result?.explanation && (
        <div className="mt-8 animate-in fade-in slide-in-from-top-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold uppercase text-xs tracking-wider">
              <HelpCircle className="h-4 w-4" /> Explanation
            </div>
            <p className="text-zinc-300 leading-relaxed">{result.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MCQSessionPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
        <MCQSessionContent />
      </Suspense>
    </MainLayout>
  );
}