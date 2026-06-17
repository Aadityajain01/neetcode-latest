"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email");
      } else {
        toast.error("Failed to send reset email");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-[100dvw] flex items-center justify-center bg-black px-4 relative font-swiss overflow-hidden selection:bg-white selection:text-black">
      
      {/* Background overlay noise and blueprint grids */}
      <div className="absolute inset-0 blueprint-grid opacity-60 pointer-events-none z-0" />
      <div className="absolute inset-0 blueprint-grid-fine opacity-40 pointer-events-none z-0" />
      <div className="noise-overlay" />

      <div className="w-[90dvw] sm:w-[24rem] lg:w-[25dvw] space-y-[3dvh] bg-black/60 border border-zinc-900 p-[4dvh] lg:p-[5dvh] shadow-2xl rounded-none relative z-10">
        
        <div className="space-y-[1dvh] text-center lg:text-left">
          <h2 className="text-4xl font-extrabold tracking-tighter text-white uppercase font-swiss">Reset Password</h2>
          <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">
            Enter your email to receive a reset link
          </p>
        </div>

        <div>
          {isSent ? (
            <div className="text-center space-y-[2dvh] font-mono">
              <div className="p-4 border border-zinc-800 bg-zinc-950/50 text-white text-xs uppercase tracking-normal leading-relaxed">
                Check your email! We sent a password reset link to <strong className="text-white font-bold">{email}</strong>.
              </div>
              <Button asChild variant="outline" className="w-full bg-black border border-zinc-800 text-zinc-100 hover:bg-zinc-900 hover:text-white h-11 rounded-none font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer">
                <Link href="/login">Return to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-[2.5dvh]">
              <div className="space-y-[1dvh]">
                <Label htmlFor="email" className="text-zinc-300 font-mono text-xs uppercase tracking-wider">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/50 border-zinc-800 text-white font-mono h-11 focus:border-white focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none transition-colors placeholder:text-zinc-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-white hover:bg-zinc-200 text-black h-11 rounded-none font-mono text-xs uppercase tracking-widest transition-all cursor-pointer"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />}
                Send Reset Link
              </Button>
              <div className="text-center pt-2">
                <Link href="/login" className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-colors">
                   <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}