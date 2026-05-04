"use client";

import { TestQuestion } from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ListTodo, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  questions: TestQuestion[];
  activeIndex: number;
  onSelect: (idx: number) => void;
  getQuestionState: (q: TestQuestion) => "locked" | "attempted" | "unattempted";
  children?: React.ReactNode;
}

export function QuestionsNav({ questions, activeIndex, onSelect, getQuestionState, children }: Props) {
  return (
    <div className="h-16 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur flex items-center justify-between px-4 md:px-6 shrink-0 gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-800 font-bold uppercase tracking-wide"
          >
            <ListTodo className="w-4 h-4 mr-2" /> Questions
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-auto min-w-[220px] bg-zinc-900 border-zinc-800 p-3 shadow-2xl rounded-xl">
          <p className="text-xs text-zinc-500 mb-2 font-semibold uppercase tracking-wider">Question Map</p>
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, idx) => {
              const state = getQuestionState(q);
              return (
                <button
                  key={q._id}
                  onClick={() => onSelect(idx)}
                  className={cn(
                    "w-9 h-9 rounded-lg text-xs font-bold transition-all border",
                    activeIndex === idx && "ring-2 ring-emerald-500 ring-offset-1 ring-offset-zinc-950",
                    state === "locked" && "bg-amber-500/15 border-amber-500/30 text-amber-400",
                    state === "attempted" && "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
                    state === "unattempted" && "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-400"
                  )}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center gap-3 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-emerald-500/40" /> Answered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-amber-500/40" /> Locked
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-zinc-700" /> Pending
            </span>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        <Button
          variant="outline"
          className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
          disabled={activeIndex === 0}
          onClick={() => onSelect(activeIndex - 1)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium text-zinc-500 px-2">
          {activeIndex + 1} of {questions.length}
        </span>
        <Button
          variant="outline"
          className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
          disabled={activeIndex === questions.length - 1}
          onClick={() => onSelect(activeIndex + 1)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        {children}
      </div>
    </div>
  );
}
