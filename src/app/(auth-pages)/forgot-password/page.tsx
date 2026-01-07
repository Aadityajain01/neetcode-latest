"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      // Firebase error codes are handy
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
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <Card className="w-full max-w-md bg-[#1E293B] border-[#334155]">
        <CardHeader>
          <CardTitle className="text-2xl text-[#E5E7EB]">Reset Password</CardTitle>
          <CardDescription className="text-[#9CA3AF]">
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSent ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-[#22C55E]/10 text-[#22C55E] rounded-lg text-sm">
                Check your email! We sent a password reset link to <strong>{email}</strong>.
              </div>
              <Button asChild variant="outline" className="w-full border-[#334155] text-[#E5E7EB]">
                <Link href="/login">Return to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#E5E7EB]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#0F172A] border-[#334155] text-[#E5E7EB]"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-black font-semibold"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
              <div className="text-center">
                <Link href="/login" className="text-sm text-[#9CA3AF] hover:text-[#E5E7EB] flex items-center justify-center gap-2">
                   <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}