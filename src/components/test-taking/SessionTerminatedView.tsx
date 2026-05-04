"use client";

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface Props {
  communityId: string;
  violationLog: string[];
  onExit: () => void;
}

export function SessionTerminatedView({ communityId, violationLog, onExit }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6 max-w-md mx-auto px-4">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-red-600/20 blur-2xl scale-[2]" />
        <div className="relative p-6 bg-red-500/10 rounded-full border border-red-500/30">
          <XCircle className="h-14 w-14 text-red-500" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-red-400">Session Terminated</h2>
        <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
          Your test was automatically submitted due to exam integrity violations. Your answers have been saved.
        </p>
      </div>

      {violationLog.length > 0 && (
        <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-left">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
            Violation Log
          </h4>
          <div className="space-y-1.5">
            {violationLog.map((log, i) => (
              <p key={i} className="text-xs text-red-400 font-mono flex items-start gap-2">
                <span className="text-zinc-600 shrink-0">&gt;</span>
                {log}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full pt-2">
        <Button
          onClick={() => {
            onExit();
            window.location.href = `/communities/${communityId}/tests`;
          }}
          className="w-full h-12 font-bold bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl transition-all hover:scale-[1.01]"
        >
          Return to Community Tests
        </Button>
        <Button
          onClick={() => {
            onExit();
            window.location.href = `/communities/${communityId}`;
          }}
          className="w-full h-10 font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-sm"
        >
          Go to Community
        </Button>
      </div>
    </div>
  );
}
