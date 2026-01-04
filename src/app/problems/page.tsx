'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { problemApi, Problem } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function ProblemsPage() {
  const router = useRouter();
  const { initialized, isAuthenticated } = useAuthStore();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'dsa',
    difficulty: '',
    search: '',
  });
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchProblems();
  }, [initialized, isAuthenticated, router]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const data = await problemApi.getProblems({
        type: filters.type,
        difficulty: filters.difficulty || undefined,
        search: filters.search || undefined,
        limit: 50,
        offset: 0,
      });

      // SAFETY FIX: Fallback to empty array
      setProblems(data?.problems || []);

      // Mock solved status (replace with real data later)
      if (data?.problems) {
        const solvedIds = data.problems.slice(0, 3).map((p) => p._id);
        setSolvedProblems(new Set(solvedIds));
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load problems');
      setProblems([]); 
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20';
      case 'medium': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
      case 'hard': return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20';
      default: return 'bg-[#9CA3AF]/10 text-[#9CA3AF] border-[#9CA3AF]/20';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : 'Unknown';
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#E5E7EB] mb-2">DSA Problems</h1>
        <p className="text-[#9CA3AF]">Master algorithms and data structures with curated problems</p>
      </div>

      <Card className="bg-[#1E293B] border-[#334155] mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#9CA3AF]" />
              <Input
                placeholder="Search problems..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchProblems()}
                className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] pl-10"
              />
            </div>

            <div className="w-full lg:w-48">
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger className="bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#334155]">
                  <SelectItem value="dsa">DSA Problems</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.type === 'dsa' && (
              <div className="w-full lg:w-48">
                <Select value={filters.difficulty} onValueChange={(value) => setFilters({ ...filters, difficulty: value })}>
                  <SelectTrigger className="bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-[#334155]">
                    <SelectItem value="Easy">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={fetchProblems} disabled={loading} className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white whitespace-nowrap">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Filter className="mr-2 h-4 w-4" /> Apply</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && problems.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      ) : problems.length === 0 ? (
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#E5E7EB] mb-2">No problems found</h3>
            <p className="text-[#9CA3AF]">Try adjusting your filters or search terms</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem) => (
            <Link key={problem._id} href={`/problems/${problem._id}`}>
              <Card className={`bg-[#1E293B] border-[#334155] hover:border-[#22C55E] transition-colors cursor-pointer ${solvedProblems.has(problem._id) ? 'border-[#22C55E]/30' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-[#E5E7EB] text-lg mb-1">{problem.title}</CardTitle>
                      <CardDescription className="text-[#9CA3AF] line-clamp-2">{problem.description}</CardDescription>
                    </div>
                    {solvedProblems.has(problem._id) && <CheckCircle2 className="h-6 w-6 text-[#22C55E] flex-shrink-0 ml-2" />}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {problem.difficulty && (
                      <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                        {getDifficultyLabel(problem.difficulty)}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
}