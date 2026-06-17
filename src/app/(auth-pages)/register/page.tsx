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
      router.push("/");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Google registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-[100dvw] grid lg:grid-cols-2 bg-black overflow-hidden relative font-swiss selection:bg-white selection:text-black">
      
      {/* Background overlay noise and blueprint grids */}
      <div className="absolute inset-0 blueprint-grid opacity-60 pointer-events-none z-0" />
      <div className="absolute inset-0 blueprint-grid-fine opacity-40 pointer-events-none z-0" />
      <div className="noise-overlay" />

      {/* LEFT COLUMN: Visual Brand Side */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-950/20 p-[5dvh] relative overflow-hidden border-r border-zinc-900/80 order-2 z-10 h-full">
         
         {/* Subtle monochrome ambient light with dynamic size */}
         <div className="absolute bottom-0 right-0 w-[40dvw] h-[40dvw] bg-zinc-800/5 blur-[12dvw] rounded-full pointer-events-none" />

         <div className="relative z-10 text-right space-y-[2dvh]">
           <div className="flex items-center justify-end gap-3 text-zinc-100 font-mono text-xs uppercase tracking-widest mb-[4dvh]">
             <span className="text-zinc-200">Neetcode</span>
             <div className="p-1 border border-zinc-800 bg-black">
               <Image src={logo} alt="Neetcode" width={32} height={32} className="img-monochrome filter invert brightness-200" />
             </div>
           </div>
           
           <h1 className="text-[3.5dvw] font-black text-white tracking-tighter leading-[1.05] mb-6 uppercase">
             Start Your <br />
             <span className="text-zinc-400">Coding Legacy.</span>
           </h1>
           <p className="text-zinc-300 text-xs font-mono leading-relaxed uppercase tracking-normal max-w-[20rem] ml-auto">
             Join 12,000+ students analyzing their performance and dominating leaderboards.
           </p>
         </div>

        {/* Mock Test Case Visual */}
        <div className="relative z-10 self-end mt-[4dvh] bg-black/60 backdrop-blur-md rounded-none border border-zinc-800/80 shadow-2xl p-[3dvh] max-w-[22rem] -rotate-1 hover:rotate-0 transition-transform duration-500 w-full group">
          <div className="absolute -inset-px border border-white/5 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-[1.5dvh] mb-[1.5dvh]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-3 h-3 text-zinc-400" /> Test Results
              </span>
              <span className="bg-white/10 text-white px-2 py-0.5 rounded-none text-[9px] font-mono border border-white/20 uppercase tracking-wider">Passed (3/3)</span>
            </div>
            <div className="space-y-[1.5dvh] font-mono text-xs">
              <div className="flex items-center gap-3 p-[1dvh] hover:bg-zinc-950 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
                <span className="text-zinc-300">INPUT: [2, 7, 11, 15], 9</span>
                <span className="text-zinc-500 ml-auto font-medium">0.04ms</span>
              </div>
              <div className="flex items-center gap-3 p-[1dvh] hover:bg-zinc-950 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
                <span className="text-zinc-300">INPUT: [3, 2, 4], 6</span>
                <span className="text-zinc-500 ml-auto font-medium">0.02ms</span>
              </div>
              <div className="flex items-center gap-3 p-[1dvh] hover:bg-zinc-950 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
                <span className="text-zinc-300">INPUT: [3, 3], 6</span>
                <span className="text-zinc-500 ml-auto font-medium">0.01ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Form Side */}
      <div className="flex items-center justify-center p-[4dvh] order-1 relative z-10 h-full">
        <div className="w-[90dvw] sm:w-[24rem] lg:w-[25dvw] space-y-[2.5dvh] bg-black/60 border border-zinc-900 p-[4dvh] shadow-2xl rounded-none">
          
          <div className="space-y-[0.5dvh] text-center lg:text-left">
            <h2 className="text-4xl font-extrabold tracking-tighter text-white uppercase font-swiss">Create account</h2>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider">Join the community and start solving</p>
          </div>

          <form className="space-y-[1.8dvh]">
            <div className="space-y-[0.5dvh]">
              <Label className="text-zinc-300 font-mono text-xs uppercase tracking-wider">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  disabled={isLoading}
                  className="bg-black/50 border-zinc-800 text-white font-mono h-11 pl-10 focus:border-white focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none transition-colors placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="space-y-[0.5dvh]">
              <Label className="text-zinc-300 font-mono text-xs uppercase tracking-wider">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@college.edu"
                  disabled={isLoading}
                  className="bg-black/50 border-zinc-800 text-white font-mono h-11 pl-10 focus:border-white focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none transition-colors placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[2dvw]">
              <div className="space-y-[0.5dvh]">
                <Label className="text-zinc-300 font-mono text-xs uppercase tracking-wider">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="bg-black/50 border-zinc-800 text-white font-mono h-11 focus:border-white focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none transition-colors placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-[0.5dvh]">
                <Label className="text-zinc-300 font-mono text-xs uppercase tracking-wider">Confirm</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="bg-black/50 border-zinc-800 text-white font-mono h-11 focus:border-white focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none transition-colors placeholder:text-zinc-500"
                />
              </div>
            </div>
            
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-normal pt-1">
              By registering, you agree to our Terms and Privacy.
            </p>

            <Button
              type="button"
              disabled={isLoading}
              onClick={handleRegister}
              className="w-full bg-white hover:bg-zinc-200 text-black h-11 rounded-none font-mono text-xs uppercase tracking-widest transition-all cursor-pointer mt-2"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />}
              Create Account
            </Button>
          </form>

          {/* --- GOOGLE BUTTON SECTION --- */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-900" />
            </div>
            <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest">
              <span className="bg-black px-3 text-zinc-400">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleGoogleRegister}
            className="w-full bg-black border border-zinc-800 text-zinc-100 hover:bg-zinc-900 hover:text-white h-11 rounded-none font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
          >
            <svg className="mr-2 h-4 w-4 filter grayscale brightness-200" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="currentColor"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="currentColor"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="currentColor"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="currentColor"
              />
            </svg>
            Google
          </Button>

          <p className="text-center text-xs font-mono text-zinc-400 uppercase tracking-wide">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-zinc-300 underline underline-offset-4 decoration-zinc-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Verify Popup */}
      <AlertDialog open={showVerifyPopup}>
        <AlertDialogContent className="bg-black border border-zinc-800 text-zinc-100 rounded-none shadow-2xl font-swiss">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white font-mono text-sm uppercase tracking-wider">
              <Mail className="h-4 w-4" /> Verify your email
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-sm font-mono tracking-normal leading-relaxed">
              A verification link has been sent to <span className="text-white font-bold">{verifyEmail}</span>.
              <br/><br/>
              Please check your inbox and verify your email to activate your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Link href="/login" className="w-full sm:w-auto">
              <AlertDialogAction className="w-full bg-white hover:bg-zinc-200 text-black rounded-none font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer">
                Return to Login
              </AlertDialogAction>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}