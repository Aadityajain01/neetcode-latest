"use client";

import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  communityId: string;
  resultHidden: boolean;
  pollFailed: boolean;
  pollAttempts: number;
  onManualRefresh: () => void;
}

export function EvaluatingView({
  communityId,
  resultHidden,
  pollFailed,
  pollAttempts,
  onManualRefresh,
}: Props) {
  if (resultHidden) {
    return (
      <div className="max-w-3xl mx-auto pt-12 text-center px-4">
        <BackButton href={`/communities/${communityId}/tests`} className="mb-6 justify-center" />
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 shadow-lg">
          <div className="relative mx-auto mb-6 w-20 h-20 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Test Submitted Successfully</h2>
          <div className="mt-6 text-amber-500 bg-amber-500/10 p-4 rounded-xl text-sm border border-amber-500/20">
            Results are hidden by the instructor. You will be able to see your score when results are published.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pt-12 text-center px-4">
      <BackButton href={`/communities/${communityId}/tests`} className="mb-6 justify-center" />
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 shadow-lg">
        <div className="relative mx-auto mb-6 w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-emerald-500/30 border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {pollFailed ? "Evaluation is taking longer" : "Evaluating Your Answers"}
        </h2>
        <p className="text-zinc-400 mb-1">
          {pollFailed
            ? "The server is still processing your submission."
            : "Your submission has been received and is being evaluated."}
        </p>
        {!pollFailed && (
          <div className="mt-6 max-w-xs mx-auto">
            <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(95, (pollAttempts / 40) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">This usually takes a few seconds...</p>
          </div>
        )}
        {pollFailed && (
          <div className="mt-6 space-y-3">
            <div className="text-amber-500 bg-amber-500/10 p-3 rounded-xl text-sm border border-amber-500/20 flex items-center gap-2 justify-center">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Evaluation is taking longer than expected.
            </div>
            <Button onClick={onManualRefresh} variant="outline" className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Check for Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
