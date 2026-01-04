'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Props = {
  language: string;
  difficulties: Set<string>;
  onClick: () => void;
};

export function LanguageCard({ language, difficulties, onClick }: Props) {
  const has = (d: string) => difficulties.has(d);

  return (
    <Card
      onClick={onClick}
      className="bg-[#1E293B] border-[#334155] hover:border-[#22C55E] cursor-pointer transition"
    >
      <CardHeader className="space-y-3">
        <CardTitle className="text-[#E5E7EB] uppercase">
          {language}
        </CardTitle>

        <div className="flex gap-2 flex-wrap">
          {has('easy') && <Badge className="bg-green-500/10 text-green-400">Easy</Badge>}
          {has('medium') && <Badge className="bg-yellow-500/10 text-yellow-400">Medium</Badge>}
          {has('hard') && <Badge className="bg-red-500/10 text-red-400">Hard</Badge>}
        </div>
      </CardHeader>
    </Card>
  );
}
