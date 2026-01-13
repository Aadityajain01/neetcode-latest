"use client";

import { useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification, 
  signOut,
  signInWithPopup 
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Code2, CheckCircle2, User, Terminal } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/lib/api-modules/auth.api";
import logo from "../../../../public/logo.png"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const { setLoading, isLoading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");

  // --- 1. HANDLE EMAIL REGISTER ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
    }

    try {
      await signOut(auth).catch(() => {});
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(user, { displayName: name });
      await sendEmailVerification(user);

      // Register in backend
      await authApi.register({
        firebaseUid: user.uid,
        email: user.email || "",
        displayName: name,
      });

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

  // --- 2. HANDLE GOOGLE REGISTER ---
  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      // 1. Trigger Google Popup
      const { user } = await signInWithPopup(auth, googleProvider);
      const token = await user.getIdToken();

      // 2. Sync with Backend (Auto-registers if new)
      const res = await authApi.login(token);
      
      // 3. Update Store & Redirect
      useAuthStore.getState().setUser(res.user);
      useAuthStore.getState().setToken(token);
      
      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Google registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-zinc-950 overflow-hidden relative">
      
      {/* MOBILE GRID BACKGROUND */}
      <div className="lg:hidden absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

      {/* LEFT COLUMN: Visual Brand Side */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900/30 p-12 relative overflow-hidden border-r border-zinc-800/50 order-2">
         
         {/* THE GRID BACKGROUND */}
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
         
         {/* Blue/Purple Glow for Register */}
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

         <div className="relative z-10 text-right">
           <div className="flex items-center justify-end gap-2 text-white font-bold text-xl mb-12">
             <span className="text-zinc-200">NeetCode</span>
              <div className="p-1.5 shadow-lg shadow-emerald-500/20">
              <Image src={logo} alt="NeetCode" width={40} height={40} />
            </div>
           </div>
           
           <h1 className="text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
             Start Your <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Coding Legacy.</span>
           </h1>
           <p className="text-zinc-400 text-lg max-w-md ml-auto leading-relaxed">
             Join 12,000+ students analyzing their performance and dominating college leaderboards.
           </p>
         </div>

        {/* Mock Test Case Visual */}
        <div className="relative z-10 self-end mt-12 bg-zinc-950/80 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl p-6 max-w-md -rotate-1 hover:rotate-0 transition-transform duration-500 w-full group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur" />
          <div className="relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-3 h-3" /> Test Results
              </span>
              <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-500/20">Passed (3/3)</span>
            </div>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-3 p-2 rounded hover:bg-zinc-900 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-zinc-300">Input: [2, 7, 11, 15], 9</span>
                <span className="text-zinc-500 ml-auto font-medium">0.04ms</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded hover:bg-zinc-900 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-zinc-300">Input: [3, 2, 4], 6</span>
                <span className="text-zinc-500 ml-auto font-medium">0.02ms</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded hover:bg-zinc-900 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-zinc-300">Input: [3, 3], 6</span>
                <span className="text-zinc-500 ml-auto font-medium">0.01ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Form Side */}
      <div className="flex items-center justify-center p-6 lg:p-12 order-1 relative z-10">
        <div className="w-full max-w-[400px] space-y-8 bg-zinc-950/50 backdrop-blur-sm p-8 rounded-3xl border border-zinc-800/50 lg:border-none lg:bg-transparent lg:p-0 shadow-2xl lg:shadow-none">
          
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white">Create account</h2>
            <p className="text-zinc-400">Join the community and start solving</p>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300 font-medium">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  disabled={isLoading}
                  className="bg-zinc-900/50 border-zinc-800 text-white h-11 pl-10 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300 font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@college.edu"
                  disabled={isLoading}
                  className="bg-zinc-900/50 border-zinc-800 text-white h-11 pl-10 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="bg-zinc-900/50 border-zinc-800 text-white h-11 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300 font-medium">Confirm</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="bg-zinc-900/50 border-zinc-800 text-white h-11 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
            
            <p className="text-xs text-zinc-500 px-1">
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>

            <Button
              type="button"
              disabled={isLoading}
              onClick={handleRegister}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11 rounded-xl font-bold shadow-lg shadow-blue-900/20 mt-2 transition-all hover:scale-[1.02]"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          {/* --- GOOGLE BUTTON SECTION --- */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleGoogleRegister}
            className="w-full bg-zinc-900/50 border-zinc-800 text-zinc-200 hover:bg-zinc-900 hover:text-white h-11 rounded-xl font-medium transition-all"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:text-blue-400 font-medium hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Verify Popup */}
      <AlertDialog open={showVerifyPopup}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-emerald-500">
              <Mail className="h-5 w-5" /> Verify your email
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-base">
              A verification link has been sent to <span className="text-white font-medium">{verifyEmail}</span>.
              <br/><br/>
              Please check your inbox and verify your email to activate your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Link href="/login" className="w-full sm:w-auto">
              <AlertDialogAction className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium">
                Return to Login
              </AlertDialogAction>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}