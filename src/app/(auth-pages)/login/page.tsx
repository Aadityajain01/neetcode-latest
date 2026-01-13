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
      router.push("/dashboard");
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
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-zinc-950 overflow-hidden relative">
      
      {/* MOBILE BACKGROUND GRID (Visible only on small screens behind form) */}
      <div className="lg:hidden absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

      {/* LEFT COLUMN: Visuals */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900/30 p-12 relative overflow-hidden border-r border-zinc-800/50">
        
        {/* THE GRID BACKGROUND */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white font-bold text-xl mb-12">
            <div className="p-1.5 shadow-lg shadow-emerald-500/20">
              <Image src={logo} alt="NeetCode" width={40} height={40} />
            </div>
            NeetCode
          </div>

          <h1 className="text-5xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Welcome back to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">The Grind.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
            Resume your streak. Your community leaderboard is waiting for you.
          </p>
        </div>

        {/* Visual Card: Git Commit */}
        <div className="relative z-10 bg-zinc-950/80 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl p-6 max-w-md rotate-2 hover:rotate-0 transition-transform duration-500 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
               <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
               </div>
               <div className="text-[10px] font-mono text-zinc-500">bash</div>
            </div>
            
            <div className="space-y-2 font-mono text-sm">
              <div className="flex gap-2">
                <span className="text-emerald-500">➜</span>
                <span className="text-blue-400">~/neetcode</span>
                <span className="text-zinc-100">git commit -m "Solved Hard DP"</span>
              </div>
              <div className="text-zinc-500 text-xs py-1 pl-4 border-l-2 border-zinc-800">
                [main 9a1b2c] Solved Hard DP <br/>
                1 file changed, 45 insertions(+)
              </div>
              <div className="flex gap-2 pt-1">
                <span className="text-emerald-500">➜</span>
                <span className="text-blue-400">~/neetcode</span>
                <span className="text-zinc-100 animate-pulse">_</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-[400px] space-y-8 bg-zinc-950/50 backdrop-blur-sm p-8 rounded-3xl border border-zinc-800/50 lg:border-none lg:bg-transparent lg:p-0 shadow-2xl lg:shadow-none">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Log in
            </h2>
            <p className="text-zinc-400">
              Enter your email to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-zinc-300 font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                <Input
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-zinc-900/50 border-zinc-800 text-white h-11 pl-10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300 font-medium">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-500 hover:text-emerald-400 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-zinc-900/50 border-zinc-800 text-white h-11 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-11 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>

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
            onClick={handleGoogleLogin}
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
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-emerald-500 hover:text-emerald-400 font-medium hover:underline underline-offset-4"
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
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-500">
              <Mail className="h-5 w-5" /> Verification Required
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-base">
              We've sent a verification link to <span className="text-white font-medium">{verificationEmail}</span>.
              <br/><br/>
              Please verify your email before logging in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
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