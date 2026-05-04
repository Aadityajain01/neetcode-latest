"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { XCircle, AlertTriangle } from "lucide-react";
import { MAX_STRIKES, StrikeMessage } from "./constants";

interface Props {
  strikes: number;
  currentWarning: StrikeMessage;
  onDismiss: () => void;
  onUnderstand: () => void;
}

export function StrikeWarningModal({ strikes, currentWarning, onDismiss, onUnderstand }: Props) {
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={cn(
          "max-w-md w-full mx-4 rounded-2xl border-2 p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300",
          currentWarning.level === "warning"
            ? "bg-zinc-900 border-amber-500/60"
            : currentWarning.level === "critical"
              ? "bg-zinc-900 border-red-500"
              : "bg-zinc-950 border-red-600"
        )}
      >
        <div
          className={cn(
            "mx-auto p-4 rounded-full w-fit",
            currentWarning.level === "warning" ? "bg-amber-500/10" : "bg-red-500/10"
          )}
        >
          {currentWarning.level === "terminated" ? (
            <XCircle className="h-12 w-12 text-red-500" />
          ) : (
            <AlertTriangle
              className={cn(
                "h-12 w-12",
                currentWarning.level === "warning" ? "text-amber-400" : "text-red-500"
              )}
            />
          )}
        </div>
        <div>
          <h2
            className={cn(
              "text-xl font-bold mb-2",
              currentWarning.level === "warning" ? "text-amber-400" : "text-red-400"
            )}
          >
            {currentWarning.title}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">{currentWarning.description}</p>
        </div>
        <div className="flex justify-center gap-2.5">
          {Array.from({ length: MAX_STRIKES }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                i < strikes ? "bg-red-500 scale-125" : "bg-zinc-700"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-zinc-600">
          {strikes}/{MAX_STRIKES} strikes used
        </p>
        {currentWarning.level === "terminated" ? (
          <Button onClick={onUnderstand} className="bg-red-600 hover:bg-red-700 text-white w-full h-12 text-base rounded-xl font-bold">
            I Understand
          </Button>
        ) : (
          <Button
            onClick={onDismiss}
            className={cn(
              "w-full h-12 text-base rounded-xl font-bold",
              currentWarning.level === "warning"
                ? "bg-amber-500 hover:bg-amber-400 text-black"
                : "bg-red-600 hover:bg-red-700 text-white"
            )}
          >
            Return to Exam
          </Button>
        )}
      </div>
    </div>
  );
}
