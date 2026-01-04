'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layouts/main-layout';
import { mcqApi, MCQ } from '@/lib/api-modules';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BackHeader } from '@/components/BacHeader';

type DifficultyMeta = {
  easy: number;
  medium: number;
  hard: number;
};

export default function MCQDifficultyPage() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = params.get('lang');

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<DifficultyMeta>({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  useEffect(() => {
    if (lang) fetchDifficultyMeta();
  }, [lang]);

  const fetchDifficultyMeta = async () => {
    try {
      setLoading(true);
      const data = await mcqApi.getMCQs({
        language: lang!,
        limit: 1000,
      });

      const counts: DifficultyMeta = {
        easy: 0,
        medium: 0,
        hard: 0,
      };

      (data.mcqs || []).forEach((mcq: MCQ) => {
        if (mcq.difficulty in counts) {
          counts[mcq.difficulty as keyof DifficultyMeta]++;
        }
      });

      setMeta(counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!lang) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  const renderCard = (
    level: keyof DifficultyMeta,
    color: string,
    label: string
  ) => {
    const count = meta[level];
    const disabled = count === 0;

    return (
      <Card
        onClick={() =>
          !disabled &&
          router.push(
            `/practice/mcq/session?lang=${lang}&difficulty=${level}`
          )
        }
        className={`
          bg-[#1E293B] border-[#334155] transition
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : `cursor-pointer hover:border-${color}-500`}
        `}
      >
        <CardHeader className="space-y-3">
          <CardTitle className={`text-${color}-400 text-2xl`}>
            {label}
          </CardTitle>
          <CardDescription className="text-[#9CA3AF]">
            {count} questions available
          </CardDescription>
        </CardHeader>
      </Card>
    );
  };

  return (
    <MainLayout>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <BackHeader
  title={`${lang.toUpperCase()} MCQ Practice`}
  subtitle="Choose a difficulty level"
/>

        </div>

        {/* Difficulty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderCard('easy', 'green', 'Easy')}
          {renderCard('medium', 'yellow', 'Medium')}
          {renderCard('hard', 'red', 'Hard')}
        </div>
      </div>
    </MainLayout>
  );
}
