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
  Terminal,
  Code2,
  ArrowRight,
  CheckCircle2,
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

export default function LoginPage() {
  const router = useRouter();
  const { setLoading, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Popup state
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 🚫 Unverified → Show popup (do NOT sign out yet)
      if (!user.emailVerified) {
        setVerificationEmail(user.email || email);
        setShowVerificationAlert(true);
        return;
      }

      // ✅ Verified → sync backend
      const token = await user.getIdToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ idToken: token }),
        }
      );

      if (!res.ok) throw new Error("Backend sync failed");

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

      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ idToken: token }),
      });

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-zinc-950">
      {/* LEFT COLUMN (unchanged UI) */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900/50 p-12 relative overflow-hidden border-r border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-zinc-900/0 to-transparent" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white font-bold text-xl mb-12">
            <div className="bg-emerald-500 rounded p-1">
              <Code2 className="h-5 w-5 text-zinc-950" />
            </div>
            NeetCode
          </div>

          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Master Data Structures <br />
            <span className="text-emerald-500">& Algorithms.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md">
            Join thousands of developers solving problems, building streaks, and
            landing their dream jobs.
          </p>
        </div>

        <div className="relative z-10 bg-zinc-950 rounded-xl border border-zinc-800 shadow-2xl p-4 max-w-md rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="flex items-center gap-1.5 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex gap-2">
              <span className="text-emerald-500">➜</span>
              <span className="text-zinc-400">~/neetcode</span>
              <span className="text-white">git commit -m "Solved Two Sum"</span>
            </div>
            <div className="text-zinc-500 text-xs py-1">
              [master 8f2a3d1] Solved Two Sum
            </div>
            <div className="flex gap-2 pt-2">
              <span className="text-emerald-500">➜</span>
              <span className="text-zinc-400">~/neetcode</span>
              <span className="text-white animate-pulse">_</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (form – unchanged UI) */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="text-zinc-400">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-zinc-300">Email</Label>
              <Input
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-zinc-900 border-zinc-800 text-white h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-500 hover:text-emerald-400"
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
                className="bg-zinc-900 border-zinc-800 text-white h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11 font-medium"
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
            className="w-full bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 h-11"
          >
            Google
          </Button>

          <p className="text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-emerald-500 hover:text-emerald-400 underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* 🔔 Verification Popup */}
      <AlertDialog
        open={showVerificationAlert}
        onOpenChange={async (open) => {
          setShowVerificationAlert(open);

          // Sign out only AFTER closing popup
        
        }}
      >
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-500">
              <Mail className="h-5 w-5" /> Verification Required
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              A verification link was sent to{" "}
              <span className="text-white font-medium">
                {verificationEmail}
              </span>
              . Please verify your email before logging in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-emerald-500 hover:bg-emerald-600 text-white"  onClick={() => setShowVerificationAlert(false)}  >
              Okay, checked it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
