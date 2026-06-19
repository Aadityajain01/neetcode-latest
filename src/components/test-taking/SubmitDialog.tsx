"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAnswered: number;
  totalQuestions: number;
  onSubmit: () => void;
}

export function SubmitDialog({ open, onOpenChange, totalAnswered, totalQuestions, onSubmit }: Props) {
  const unanswered = totalQuestions - totalAnswered;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Submit Test?</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            You have answered <span className="text-white font-semibold">{totalAnswered}</span> of{" "}
            <span className="text-white font-semibold">{totalQuestions}</span> questions.
            {unanswered > 0 && (
              <span className="block mt-1 text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                {unanswered} question(s) are unanswered.
              </span>
            )}
            <span className="block mt-2">This action cannot be undone.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white">
            Go Back
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onOpenChange(false);
              onSubmit();
            }}
            className="bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold"
          >
            Confirm Submit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
