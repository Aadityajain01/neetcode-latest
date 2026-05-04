"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_STRIKES, RETURN_COUNTDOWN_SEC } from "./constants";

interface Props {
  returnCountdown: number;
  countdownReason: string;
  strikes: number;
  onCancelAndReturn: () => void;
}

export function ReturnCountdownOverlay({
  returnCountdown,
  countdownReason,
  strikes,
  onCancelAndReturn,
}: Props) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/92 backdrop-blur-lg animate-in fade-in duration-150">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-red-600/10 animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-sm w-full mx-4 text-center">
        <div className="relative w-36 h-36">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="63" fill="none" stroke="#27272a" strokeWidth="8" />
            <circle
              cx="72"
              cy="72"
              r="63"
              fill="none"
              stroke={returnCountdown <= 3 ? "#ef4444" : returnCountdown <= 6 ? "#f97316" : "#eab308"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 63}
              strokeDashoffset={2 * Math.PI * 63 * (1 - returnCountdown / RETURN_COUNTDOWN_SEC)}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={cn(
                "text-5xl font-black tabular-nums leading-none transition-colors duration-300",
                returnCountdown <= 3
                  ? "text-red-400"
                  : returnCountdown <= 6
                    ? "text-orange-400"
                    : "text-yellow-400"
              )}
            >
              {returnCountdown}
            </span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
              seconds
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Return to Exam!</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            <span className="text-red-400 font-semibold">{countdownReason}</span> was detected. Return within{" "}
            <span className="text-white font-bold">{returnCountdown}</span> seconds or your test will be{" "}
            <span className="text-red-400 font-bold">auto-submitted</span>.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {Array.from({ length: MAX_STRIKES }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  i < strikes ? "bg-red-500 scale-110" : "bg-zinc-700"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-zinc-600">
            {strikes}/{MAX_STRIKES} strikes used
          </span>
        </div>

        <Button
          onClick={onCancelAndReturn}
          className={cn(
            "w-full h-14 text-base font-black rounded-xl transition-all hover:scale-[1.02]",
            returnCountdown <= 3
              ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_-5px_rgba(239,68,68,0.6)]"
              : "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_30px_-5px_rgba(234,179,8,0.4)]"
          )}
        >
          Return to Exam Now
        </Button>
      </div>
    </div>
  );
}
