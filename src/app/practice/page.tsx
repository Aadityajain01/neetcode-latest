'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { problemApi } from '@/lib/api-modules';
import { Problem } from '@/lib/api-modules';
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
  Clock,
  Code2,
} from 'lucide-react';

export default function PracticePage() {
  const router = useRouter();
  const { initialized, isAuthenticated } = useAuthStore();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    language: '',
    search: '',
  });

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchProblems();
  }, [initialized, isAuthenticated]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const data = await problemApi.getProblems({
        type: 'practice',
        search: filters.search || undefined,
        limit: 50,
        offset: 0,
      });

      if (filters.language) {
        const filtered = data.problems.filter(p =>
          p.languages.some(l => l.toLowerCase() === filters.language.toLowerCase())
        );
        setProblems(filtered);
      } else {
        setProblems(data.problems);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load practice problems');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-[#E5E7EB] mb-2">
          Programming Practice
        </h1>
        <p className="text-[#9CA3AF]">
          Sharpen your coding skills with practice problems (no leaderboard impact)
        </p>
      </div>

      <Card className="bg-[#1E293B] border-[#334155] mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#9CA3AF]" />
                <Input
                  placeholder="Search problems..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchProblems();
                  }}
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
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#334155]">
                  <SelectItem value="All">All Languages</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="c">C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={fetchProblems}
              disabled={loading}
              className="bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-white whitespace-nowrap"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Filter className="mr-2 h-4 w-4" />
                  Apply
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      ) : problems.length === 0 ? (
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="py-12 text-center">
            <Code2 className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#E5E7EB] mb-2">
              No practice problems found
            </h3>
            <p className="text-[#9CA3AF]">
              Try adjusting your search terms
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem) => (
            <Link key={problem._id} href={`/practice/${problem._id}`}>
              <Card className="bg-[#1E293B] border-[#334155] hover:border-[#38BDF8] transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-[#E5E7EB] text-lg mb-1">
                        {problem.title}
                      </CardTitle>
                      <CardDescription className="text-[#9CA3AF] line-clamp-2">
                        {problem.description}
                      </CardDescription>
                    </div>
                  </div>
          
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge
                      variant="outline"
                      className="bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20"
                    >
                      Practice
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/20"
                    >
                      {problem.languages.length} Languages
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4 text-[#9CA3AF]">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{problem.timeLimit}s</span>
                      </div>
                      <span>
                        {problem.tags.slice(0, 2).join(', ')}
                        {problem.tags.length > 2 && '...'}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#38BDF8]" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
