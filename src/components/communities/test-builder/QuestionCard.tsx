import { PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { questionPrimaryText } from "./helpers";
import type { DraftQuestion } from "./types";

export function QuestionCard({
  question,
  index,
  onEdit,
  onRemove,
}: {
  question: DraftQuestion;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_100px_100px_80px] gap-4 p-3 items-center hover:bg-zinc-900/30 transition-colors">
      <div className="flex items-center gap-2 pl-2 overflow-hidden">
        <span className="text-zinc-200 text-sm whitespace-nowrap">{index + 1}.</span>
        <div className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-zinc-300 text-sm">{questionPrimaryText(question) || "Untitled Question"}</span>
        </div>
      </div>
      
      <div className="text-center">
        <span className="text-xs uppercase tracking-wider font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
          {question.type === "programming" ? "CODING" : "MCQ"}
        </span>
      </div>
      
      <div className="text-center text-zinc-300 text-sm font-medium">
        {question.marks || 0}
      </div>
      
      <div className="flex items-center justify-end gap-1 pr-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
        >
          <PencilLine className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
