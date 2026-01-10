'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layouts/main-layout';
import { mcqApi, MCQ } from '@/lib/api-modules';
import { Loader2, Swords, ShieldCheck, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';

type DifficultyMeta = { easy: number; medium: number; hard: number; };

function MCQDifficultyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = params.get('lang');
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<DifficultyMeta>({ easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    if (lang) {
      mcqApi.getMCQs({ language: lang, limit: 1000 }).then(data => {
        const counts: any = { easy: 0, medium: 0, hard: 0 };
        (data.mcqs || []).forEach((mcq: MCQ) => {
          if (mcq.difficulty in counts) counts[mcq.difficulty]++;
        });
        setMeta(counts);
        setLoading(false);
      });
    }
  }, [lang]);

  if (!lang) return null;
  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;

  const DifficultyCard = ({ level, label, count, icon: Icon, color, borderColor, bgGradient }: any) => (
    <div
      onClick={() => count > 0 && router.push(`/practice/mcq/session?lang=${lang}&difficulty=${level}`)}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-2xl border bg-zinc-900/50 p-8 transition-all duration-300 hover:-translate-y-2",
        count === 0 ? "opacity-50 grayscale cursor-not-allowed border-zinc-800" : `border-zinc-800 hover:border-${borderColor}`,
        "hover:shadow-2xl"
      )}
    >
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br", bgGradient)} />
      
      <div className="flex justify-between items-start mb-8">
        <div className={cn("p-4 rounded-2xl bg-zinc-950 border border-zinc-800 group-hover:scale-110 transition-transform duration-300", color)}>
          <Icon className="h-8 w-8" />
        </div>
        <div className="text-4xl font-black text-zinc-800 group-hover:text-white/10 transition-colors">
          {count}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-1">{label}</h3>
      <p className="text-zinc-500 group-hover:text-zinc-400">
        {count === 0 ? "No questions available" : `${count} Questions Available`}
      </p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Select Difficulty</h1>
        <p className="text-zinc-400">Choose wisely. The path to mastery begins here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DifficultyCard level="easy" label="Easy" count={meta.easy} icon={ShieldCheck} color="text-emerald-400" borderColor="emerald-500" bgGradient="from-emerald-500 to-green-900" />
        <DifficultyCard level="medium" label="Medium" count={meta.medium} icon={Swords} color="text-yellow-400" borderColor="yellow-500" bgGradient="from-yellow-500 to-amber-900" />
        <DifficultyCard level="hard" label="Hard" count={meta.hard} icon={Skull} color="text-red-500" borderColor="red-500" bgGradient="from-red-500 to-rose-900" />
      </div>
    </div>
  );
}

export default function MCQDifficultyPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
        <MCQDifficultyContent />
      </Suspense>
    </MainLayout>
  );
}