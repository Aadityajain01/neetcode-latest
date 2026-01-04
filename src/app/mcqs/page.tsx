'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { mcqApi, MCQ } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout'; // Adjust path if needed
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
  BookOpen,
} from 'lucide-react';

export default function MCQsPage() {
  const router = useRouter();
  const { initialized, isAuthenticated } = useAuthStore();

  const [mcqs, setMCQs] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    language: '',
    difficulty: '',
    search: '',
  });
  const [attemptedMCQs, setAttemptedMCQs] = useState<Set<string>>(new Set());

  // 1. Auth Guard
  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchMCQs();
    fetchAttemptedMCQs();
  }, [initialized, isAuthenticated, router]);

  // 2. Fetch Logic
  const fetchMCQs = async () => {
    try {
      setLoading(true);
      const data = await mcqApi.getMCQs({
        language: filters.language || undefined,
        difficulty: filters.difficulty || undefined,
        search: filters.search || undefined,
        limit: 50,
        offset: 0,
      });

      // SAFETY FIX: Fallback to empty array if undefined
      setMCQs(data?.mcqs || []);
    } catch (error: any) {
      console.error("Failed to fetch MCQs:", error);
      toast.error('Failed to load MCQs');
      setMCQs([]); 
    } finally {
      setLoading(false);
    }
  };

  const fetchAttemptedMCQs = async () => {
    try {
      const data = await mcqApi.getMyAttempts({ limit: 100 });
      // Safety check for submissions array
      const attemptedIds = (data?.submissions || []).map((s: any) => s.mcqId);
      setAttemptedMCQs(new Set(attemptedIds));
    } catch (error) {
      console.error('Failed to load attempted MCQs:', error);
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

  // 3. Loading State
  if (!initialized || (loading && mcqs.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#E5E7EB] mb-2">
          Multiple Choice Questions
        </h1>
        <p className="text-[#9CA3AF]">
          Test your programming knowledge with language-specific MCQs
        </p>
      </div>

      {/* Filters Section */}
      <Card className="bg-[#1E293B] border-[#334155] mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#9CA3AF]" />
                <Input
                  placeholder="Search MCQs..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && fetchMCQs()}
                  className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] pl-10"
                />
              </div>
            </div>

            <div className="w-full lg:w-48">
              <Select
                value={filters.language}
                onValueChange={(value) => setFilters({ ...filters, language: value })}
              >
                <SelectTrigger className="bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#334155]">
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-48">
               <Select
                value={filters.difficulty}
                onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
              >
                <SelectTrigger className="bg-[#0F172A] border-[#334155] text-[#E5E7EB]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#334155]">
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={fetchMCQs}
              disabled={loading}
              className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white whitespace-nowrap"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Filter className="mr-2 h-4 w-4" /> Apply</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* MCQs Grid */}
      {mcqs.length === 0 ? (
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#E5E7EB] mb-2">No MCQs found</h3>
            <p className="text-[#9CA3AF]">Try adjusting your filters or search terms</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mcqs.map((mcq) => {
            const isAttempted = attemptedMCQs.has(mcq._id);
            return (
              <Link key={mcq._id} href={`/mcqs/${mcq._id}`}>
                <Card className={`bg-[#1E293B] border-[#334155] hover:border-[#22C55E] transition-colors cursor-pointer ${isAttempted ? 'border-[#38BDF8]/30' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-[#E5E7EB] text-lg mb-1">
                          {mcq.question.length > 50 ? mcq.question.substring(0, 50) + '...' : mcq.question}
                        </CardTitle>
                        <CardDescription className="text-[#9CA3AF]">
                          {mcq.language} • {mcq.options.length} options
                        </CardDescription>
                      </div>
                      {isAttempted && (
                        <div className="bg-[#38BDF8]/10 p-2 rounded-full">
                          <BookOpen className="h-4 w-4 text-[#38BDF8]" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getDifficultyColor(mcq.difficulty)}>
                        {mcq.difficulty.charAt(0).toUpperCase() + mcq.difficulty.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
}