'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layouts/main-layout';
import { problemApi, Problem } from '@/lib/api-modules';
import { BackHeader } from '@/components/BacHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function PracticeProblemSelectPage() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = params.get('lang');

  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string>('all');

  useEffect(() => {
    if (lang) fetchProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const fetchProblems = async () => {
    try {
      setLoading(true);

      const data = await problemApi.getProblems({
        type: 'practice',
        search: search || undefined,
        difficulty: difficulty !== 'all' ? difficulty : undefined,
        limit: 100,
        offset: 0,
      });

      // Language filter (frontend-safe)
      const filtered = (data.problems || []).filter((p: Problem) =>
        p.languages?.some(l => l.toLowerCase() === lang?.toLowerCase())
      );

      setProblems(filtered);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load practice problems');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <BackHeader
          title={`${lang?.toUpperCase()} Programming Practice`}
          subtitle="Select a problem to solve"
        />

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProblems()}
              placeholder="Search problems..."
              className="pl-10 bg-[#0F172A] border-[#334155] text-[#E5E7EB]"
            />
          </div>

          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-48 bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-[#1E293B] border-[#334155]">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={fetchProblems}
            className="bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-white"
          >
            Apply
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
          </div>
        ) : problems.length === 0 ? (
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardContent className="py-12 text-center">
              <p className="text-[#9CA3AF]">
                No problems found for this language
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map((problem) => (
              <Card
                key={problem._id}
                onClick={() => router.push(`/practice/${problem._id}`)}
                className="bg-[#1E293B] border-[#334155] hover:border-[#38BDF8] cursor-pointer transition"
              >
                <CardHeader>
                  <CardTitle className="text-[#E5E7EB]">
                    {problem.title}
                  </CardTitle>
                  <CardDescription className="text-[#9CA3AF] line-clamp-2">
                    {problem.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-wrap gap-2">
                  {problem.difficulty && (
                    <Badge className="bg-[#22C55E]/10 text-[#22C55E]">
                      {problem.difficulty}
                    </Badge>
                  )}
                  <Badge className="bg-[#38BDF8]/10 text-[#38BDF8]">
                    {problem.languages.length} Languages
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
