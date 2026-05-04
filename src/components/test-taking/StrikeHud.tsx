"use client";

import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_STRIKES } from "./constants";

interface Props {
  strikes: number;
}

export function StrikeHud({ strikes }: Props) {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-full px-3.5 py-1.5 backdrop-blur-md shadow-lg select-none">
      <ShieldAlert className={cn("h-3.5 w-3.5", strikes > 0 ? "text-red-400" : "text-emerald-400")} />
      <div className="flex gap-1">
        {Array.from({ length: MAX_STRIKES }).map((_, i) => (
          <div key={i} className={cn("w-2 h-2 rounded-full transition-all", i < strikes ? "bg-red-500" : "bg-zinc-700")} />
        ))}
      </div>
      <span className={cn("text-xs font-bold", strikes > 0 ? "text-red-400" : "text-zinc-500")}>
        {strikes > 0 ? `${strikes}/${MAX_STRIKES}` : "Secure"}
      </span>
    </div>
  );
}
