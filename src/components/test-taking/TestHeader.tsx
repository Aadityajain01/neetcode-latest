"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  communityName?: string;
  totalQuestions: number;
  totalMarks: number;
  totalAnswered: number;
  timeLeft: number | null;
  submitting: boolean;
  onSubmitClick: () => void;
}

const formatTime = (secs: number) => {
  const min = Math.floor(secs / 60);
  const sec = secs % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

export function TestHeader({
  title,
  communityName,
  totalQuestions,
  totalMarks,
  totalAnswered,
  timeLeft,
  submitting,
  onSubmitClick,
}: Props) {
  return (
    <div className="h-16 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-bold text-white text-base sm:text-lg truncate">{title}</h1>
          {communityName && (
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10 hidden sm:inline-flex"
            >
              {communityName}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>{totalQuestions} Questions</span>
          <span>&bull;</span>
          <span>{totalMarks} Marks</span>
          <span>&bull;</span>
          <span className={cn("font-semibold", totalAnswered === totalQuestions ? "text-emerald-400" : "text-zinc-400")}>
            {totalAnswered}/{totalQuestions} answered
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div
          className={cn(
            "flex items-center gap-2 font-mono font-bold text-base sm:text-xl px-3 sm:px-4 py-1.5 rounded-lg bg-zinc-950 border",
            timeLeft !== null && timeLeft <= 300
              ? "border-red-500/50 text-red-400"
              : "border-zinc-800 text-emerald-400"
          )}
        >
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
          {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
        </div>
        <Button onClick={onSubmitClick} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Submit Test
        </Button>
      </div>
    </div>
  );
}
