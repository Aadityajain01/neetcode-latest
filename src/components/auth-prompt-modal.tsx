"use client";

import { useAuthPromptStore } from "@/store/auth-prompt-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthPromptModal() {
  const { isOpen, message, closeAuthPrompt, onConfirmRedirect } =
    useAuthPromptStore();
  const router = useRouter();

  const handleLogin = () => {
    closeAuthPrompt();
    if (onConfirmRedirect) {
      onConfirmRedirect();
    } else {
      router.push("/login");
    }
  };

  const handleRegister = () => {
    closeAuthPrompt();
    router.push("/register");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAuthPrompt()}>
      <DialogContent className="sm:max-w-[420px] bg-slate-900 border-slate-800 text-slate-100 shadow-2xl rounded-2xl overflow-hidden p-6">
        <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 animate-gradient" />
        
        <DialogHeader className="flex flex-col items-center justify-center space-y-4 pt-4 text-center">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/30 text-indigo-400 animate-pulse">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold tracking-tight text-white bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              Authentication Required
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm max-w-[320px] mx-auto leading-relaxed">
              {message}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="my-6 border-t border-slate-800/80" />

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 justify-center w-full">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:flex-1 border-slate-800 hover:bg-slate-800/50 hover:text-white transition-all duration-200"
            onClick={handleRegister}
          >
            <UserPlus className="w-4 h-4 mr-2 text-indigo-400" />
            Create Account
          </Button>
          <Button
            type="button"
            className="w-full sm:flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-95 transition-all duration-200"
            onClick={handleLogin}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Log In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
