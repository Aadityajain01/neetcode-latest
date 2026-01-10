"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import { BookOpen, Code2, Loader2, BrainCircuit, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

function PracticeModuleContent() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = params.get("lang");

  if (!lang) return null;

  const OptionCard = ({ title, desc, icon: Icon, colorClass, borderClass, bgClass, onClick, subIcon: SubIcon }: any) => (
    <div 
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 lg:p-12 transition-all duration-500 hover:scale-[1.02]",
        borderClass,
        "hover:shadow-2xl"
      )}
    >
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500", bgClass)} />
      
      <div className="relative z-10 flex flex-col items-center text-center gap-6">
        <div className={cn(
          "h-24 w-24 rounded-3xl flex items-center justify-center mb-2 shadow-xl transition-transform duration-500 group-hover:rotate-6",
          "bg-zinc-950 border border-zinc-800"
        )}>
          <Icon className={cn("h-12 w-12", colorClass)} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <p className="text-zinc-400 max-w-sm mx-auto leading-relaxed">{desc}</p>
        </div>

        <div className={cn(
          "mt-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300",
          colorClass
        )}>
          <SubIcon className="h-4 w-4" /> Start Session
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto min-h-[80vh] flex flex-col justify-center space-y-12">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium uppercase tracking-wider mb-4">
          Selected: <span className="text-white font-bold">{lang}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">How do you want to practice?</h1>
        <p className="text-zinc-400">Choose a mode to sharpen your skills.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <OptionCard 
          title="MCQ Quiz"
          desc="Test your theoretical knowledge with rapid-fire questions categorized by difficulty."
          icon={BookOpen}
          subIcon={BrainCircuit}
          colorClass="text-emerald-500"
          borderClass="hover:border-emerald-500/50"
          bgClass="bg-emerald-500"
          onClick={() => router.push(`/practice/mcq/difficulty?lang=${lang}`)}
        />

        <OptionCard 
          title="Coding Problems"
          desc="Solve algorithmic challenges in a real IDE environment with test cases."
          icon={Code2}
          subIcon={Keyboard}
          colorClass="text-blue-400"
          borderClass="hover:border-blue-400/50"
          bgClass="bg-blue-400"
          onClick={() => router.push(`/practice/code/filter?lang=${lang}`)}
        />
      </div>
    </div>
  );
}

export default function PracticeModulePage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
        <PracticeModuleContent />
      </Suspense>
    </MainLayout>
  );
}