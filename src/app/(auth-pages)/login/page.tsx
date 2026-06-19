"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Code2,
  Terminal,
  ArrowRight,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authApi } from "@/lib/api-modules";
import Image from "next/image";
import logo from "../../../../public/logo.png"
export default function LoginPage() {
  const router = useRouter();
  const { setLoading, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      if (!user.emailVerified) {
        setVerificationEmail(user.email || email);
        setShowVerificationAlert(true);
        return;
      }

      const token = await user.getIdToken();
      const res = await authApi.login(token);
      
      useAuthStore.getState().setUser(res.user);
      useAuthStore.getState().setToken(token);

      toast.success("Login successful!");
      router.push("/");
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      const token = await user.getIdToken();

      const res = await authApi.login(token);
      useAuthStore.getState().setUser(res.user);
      useAuthStore.getState().setToken(token);
      toast.success("Login successful!");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
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

      {/* LEFT COLUMN: Visuals */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-950/20 p-[5dvh] relative overflow-hidden border-r border-zinc-900/80 z-10 h-full">
        
        {/* Subtle brand orange ambient light */}
        <div className="absolute top-0 left-0 w-[40dvw] h-[40dvw] bg-brand-500/10 blur-[12dvw] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-[2dvh]">
          <div className="flex items-center gap-3 text-zinc-100 font-sans text-xs uppercase tracking-widest mb-[4dvh]">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
              <Image src={logo} alt="Swadhyaayi Logo" width={28} height={28} className="object-contain" />
            </div>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-400 font-extrabold text-sm font-sans uppercase tracking-wider">
              Swadhyaayi
            </span>
          </div>

          <h1 className="text-[3.5dvw] font-black text-white tracking-tighter leading-[1.05] mb-6 uppercase">
            Welcome back <br />
            <span className="text-zinc-400">to the grind.</span>
          </h1>
          <p className="text-zinc-300 text-sm font-mono leading-relaxed uppercase tracking-normal max-w-[20rem]">
            Resume your streak. Your community leaderboard is waiting for you.
          </p>
        </div>

        {/* Visual Card: Git Commit */}
        <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-none border border-zinc-800/80 shadow-2xl p-[3dvh] max-w-[22rem] rotate-1 hover:rotate-0 transition-transform duration-500 group">
          <div className="absolute -inset-px border border-white/5 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-[2dvh]">
               <div className="flex gap-[0.5dvw]">
                <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700" />
               </div>
               <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">bash</div>
            </div>
            
            <div className="space-y-[1.5dvh] font-mono text-xs text-zinc-200">
              <div className="flex gap-[1dvw]">
                <span className="text-zinc-500">➜</span>
                <span className="text-zinc-400">~/swadhyaayi</span>
                <span className="text-white">git commit -m "Solved Hard DP"</span>
              </div>
              <div className="text-zinc-300 text-[11px] py-[1dvh] pl-4 border-l border-zinc-800">
                [main 9a1b2c] Solved Hard DP <br/>
                1 file changed, 45 insertions(+)
              </div>
              <div className="flex gap-[1dvw] pt-1">
                <span className="text-zinc-500">➜</span>
                <span className="text-zinc-400">~/swadhyaayi</span>
                <span className="text-zinc-400 animate-pulse">_</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Form */}
      <div className="flex items-center justify-center p-[4dvh] relative z-10 h-full">
        <div className="w-[90dvw] sm:w-[24rem] lg:w-[25dvw] space-y-[3dvh] bg-black/60 border border-zinc-900 p-[4dvh] shadow-2xl rounded-none">
          <div className="space-y-[1dvh] text-center lg:text-left">
            <h2 className="text-4xl font-extrabold tracking-tighter text-white uppercase font-swiss">
              Log in
            </h2>
            <p className="text-zinc-400 font-mono text-xs uppercase tracking-wider">
              Enter your email to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-[2dvh]">
            <div className="space-y-[1dvh]">
              <Label className="text-zinc-300 font-mono text-xs uppercase tracking-wider">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                <Input
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-black/50 border-zinc-800 text-white font-mono h-11 pl-10 focus:border-brand-500 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none transition-colors placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="space-y-[1dvh]">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300 font-mono text-xs uppercase tracking-wider">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-mono uppercase tracking-wider text-white hover:text-zinc-300 underline underline-offset-4 decoration-zinc-700 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-black/50 border-zinc-800 text-white font-mono h-11 rounded-none focus:border-brand-500 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors placeholder:text-zinc-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white h-11 rounded-none font-sans font-bold text-xs uppercase tracking-widest transition-all cursor-pointer mt-[1dvh] shadow-[0_0_15px_rgba(255,106,31,0.2)]"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />}
              Sign in
            </Button>
          </form>

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
            onClick={handleGoogleLogin}
            className="w-full bg-black border border-zinc-800 hover:border-brand-500/50 text-zinc-100 hover:text-brand-400 h-11 rounded-none font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
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
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-white hover:text-zinc-300 underline underline-offset-4 decoration-zinc-700 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Verification Popup */}
      <AlertDialog
        open={showVerificationAlert}
        onOpenChange={async (open) => {
          setShowVerificationAlert(open);
          if (!open) await signOut(auth);
        }}
      >
        <AlertDialogContent className="bg-black border border-zinc-800 text-zinc-100 rounded-none shadow-2xl font-swiss">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white font-mono text-sm uppercase tracking-wider">
              <Mail className="h-4 w-4" /> Verification Required
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-300 text-sm font-mono tracking-normal leading-relaxed">
              We've sent a verification link to <span className="text-white font-bold">{verificationEmail}</span>.
              <br/><br/>
              Please verify your email before logging in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-white hover:bg-zinc-200 text-black rounded-none font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
              onClick={() => setShowVerificationAlert(false)}
            >
              Okay, checked it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}