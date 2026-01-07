"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Terminal, Code2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/auth/auth.api";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RegisterPage() {
  const router = useRouter();
  const { setLoading, isLoading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");

  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      toast.error("Password must be 8+ chars and include a number");
      return;
    }

    setLoading(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      await sendEmailVerification(user);
      
      await authApi.register({
        firebaseUid: user.uid,
        email: user.email || "",
        displayName: name,
      });

      await signOut(auth);
      setVerifyEmail(user.email || email);
      setShowVerifyPopup(true);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        toast.error("Email already registered");
      } else {
        toast.error(err.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-zinc-950">
      
      {/* LEFT COLUMN: Visual Brand Side */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900/50 p-12 relative overflow-hidden border-r border-zinc-800 order-2">
         {/* Background gradient specifically for register */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/10 via-zinc-900/0 to-transparent" />

         <div className="relative z-10 text-right">
           <div className="flex items-center justify-end gap-2 text-white font-bold text-xl mb-12">
             <span>NeetCode</span>
             <div className="bg-emerald-500 rounded p-1"><Code2 className="h-5 w-5 text-zinc-950" /></div>
           </div>
           
           <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
             Start Your <br />
             <span className="text-blue-500">Coding Legacy.</span>
           </h1>
           <p className="text-zinc-400 text-lg max-w-md ml-auto">
             Create your account today and track your progress across hundreds of curated algorithm problems.
           </p>
        </div>

        {/* Mock Test Case Visual */}
        <div className="relative z-10 self-end mt-12 bg-zinc-950 rounded-xl border border-zinc-800 shadow-2xl p-5 max-w-md -rotate-1 hover:rotate-0 transition-transform duration-500 w-full">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
             <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Test Results</span>
             <span className="text-emerald-500 text-xs font-mono">Passed (3/3)</span>
          </div>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-zinc-300">Test Case 1: [2, 7, 11, 15], 9</span>
              <span className="text-zinc-500 ml-auto">0.04ms</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-zinc-300">Test Case 2: [3, 2, 4], 6</span>
              <span className="text-zinc-500 ml-auto">0.02ms</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-zinc-300">Test Case 3: [3, 3], 6</span>
              <span className="text-zinc-500 ml-auto">0.01ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Form Side (Order 1 on Desktop to flip it) */}
      <div className="flex items-center justify-center p-6 lg:p-12 order-1">
        <div className="w-full max-w-[400px] space-y-8">
          
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white">Create account</h2>
            <p className="text-zinc-400">Join the community and start solving</p>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Display Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-blue-500/50 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-zinc-900 border-zinc-800 text-white focus:border-blue-500/50 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Confirm</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>
            </div>
            
            <p className="text-xs text-zinc-500">
              Password must be 8+ characters and include a number.
            </p>

            <Button
              type="button"
              disabled={isLoading}
              onClick={handleRegister}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11 font-medium mt-2"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-500 hover:text-emerald-400 hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Verify Popup */}
      <AlertDialog open={showVerifyPopup}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-emerald-500">
              <Mail className="h-5 w-5" /> Verify your email
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              A verification link has been sent to <span className="text-white font-medium">{verifyEmail}</span>.
              Please verify your email before logging in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Link href="/login">
              <AlertDialogAction className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Okay, got it
              </AlertDialogAction>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}