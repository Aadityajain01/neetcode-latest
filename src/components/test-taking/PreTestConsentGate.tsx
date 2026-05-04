"use client";

import { CommunityTest, TestQuestion } from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import {
  Clock,
  ListTodo,
  CheckCircle,
  ShieldAlert,
  Eye,
  Maximize,
  Shield,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { MAX_STRIKES } from "./constants";

interface Props {
  test: CommunityTest;
  questions: TestQuestion[];
  onStart: () => void;
}

export function PreTestConsentGate({ test, questions, onStart }: Props) {
  const rules = [
    {
      icon: Eye,
      label: "Video Monitoring",
      text: "Your camera must stay on. Face detection AI checks for missing faces or multiple people in the frame.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: CheckCircle,
      label: "Audio Proctoring",
      text: "The system monitors background noise levels. Sustained talking or loud noises will trigger a strike.",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      icon: Maximize,
      label: "Fullscreen Policy",
      text: "The exam runs in dedicated fullscreen mode. Exiting manually at any point results in an immediate strike.",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      icon: AlertTriangle,
      label: `${MAX_STRIKES}-Strike Policy`,
      text: `After ${MAX_STRIKES} automated violations, your session is permanently terminated and the test auto-submitted.`,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      icon: Shield,
      label: "Input Blacklist",
      text: "Shortcuts, right-click, and copy-paste are disabled and logged server-side for analysis.",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      icon: AlertCircle,
      label: "Violation Logging",
      text: "Every detected violation is timestamped and logged. The full report is visible to your community admin.",
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 overflow-hidden">
      <div className="shrink-0 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur px-6 py-3 flex items-center gap-3">
        <div className="p-1.5 bg-amber-500/15 rounded-lg border border-amber-500/25">
          <ShieldAlert className="h-4 w-4 text-amber-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Proctored Exam</p>
          <p className="text-sm font-semibold text-zinc-200 truncate">{test.title}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-bold text-zinc-300">{test.durationMinutes} min</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          <div className="text-center space-y-5">
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-3xl scale-[2]" />
              <div className="relative p-7 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-red-600/20 rounded-3xl border border-amber-500/30 shadow-2xl shadow-amber-900/20">
                <ShieldAlert className="h-14 w-14 text-amber-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white tracking-tight">{test.title}</h1>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
                This is a proctored exam. Your session is monitored for academic integrity via camera, audio and activity analysis.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Duration", value: `${test.durationMinutes} min`, icon: Clock, color: "text-emerald-400" },
              { label: "Questions", value: questions.length, icon: ListTodo, color: "text-blue-400" },
              { label: "Total Marks", value: test.totalMarks, icon: CheckCircle, color: "text-purple-400" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 py-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-lg font-black text-white">{s.value}</span>
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 bg-amber-500 rounded-full" />
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Exam Rules &amp; Restrictions</h2>
            </div>
            {rules.map((rule, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${rule.border} ${rule.bg} backdrop-blur-sm`}>
                <div className={`p-2 rounded-lg bg-zinc-900/60 border ${rule.border} shrink-0 mt-0.5`}>
                  <rule.icon className={`h-4 w-4 ${rule.color}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold uppercase tracking-wider ${rule.color} mb-1`}>{rule.label}</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{rule.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-3">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Strike System</p>
            <div className="flex items-center justify-center gap-3">
              {Array.from({ length: MAX_STRIKES }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm ${
                      i === 0
                        ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
                        : i === 1
                          ? "border-orange-500/60 bg-orange-500/10 text-orange-400"
                          : "border-red-500/60 bg-red-500/10 text-red-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      i === 0
                        ? "text-amber-500"
                        : i === 1
                          ? "text-orange-500"
                          : "text-red-500"
                    }`}
                  >
                    {i === 0 ? "Warning" : i === 1 ? "Final" : "Terminate"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl">
            <AlertCircle className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-500 leading-relaxed">
              By clicking <span className="text-white font-semibold">&quot;I Agree - Start Exam&quot;</span> you confirm that
              you have read and agree to giving camera and microphone access for proctoring.
            </p>
          </div>

          <div className="pb-4" />
        </div>
      </div>

      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={onStart}
            className="w-full h-14 text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl shadow-[0_0_30px_-8px_rgba(16,185,129,0.6)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Eye className="h-5 w-5 mr-2.5" />
            I Agree - Start Exam
          </Button>
        </div>
      </div>
    </div>
  );
}
