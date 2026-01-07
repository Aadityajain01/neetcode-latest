'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { problemApi, Problem } from '@/lib/api-modules';
import { api } from '@/lib/api'; // Ensure you have your axios instance here
import MainLayout from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Search,
  Loader2,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Code2
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function ProblemsPage() {
  const router = useRouter();
  const { initialized, isAuthenticated } = useAuthStore();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [totalProblems, setTotalProblems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({
    type: 'dsa',
    difficulty: '',
    search: '',
  });

  // Stores the Set of solved problem IDs
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Fetch both problems and user's solved status
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchProblems(), fetchSolvedStatus()]);
      setLoading(false);
    };

    initData();
  }, [initialized, isAuthenticated, router, currentPage, filters.type, filters.difficulty]); 

  const fetchProblems = async () => {
    try {
      const data = await problemApi.getProblems({
        type: filters.type,
        difficulty: filters.difficulty || undefined,
        search: filters.search || undefined,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      });

      setProblems(data?.problems || []);
      setTotalProblems(data?.pagination?.total || 0);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load problems');
    }
  };

  const fetchSolvedStatus = async () => {
    try {
      // Call the new backend endpoint
      const { data } = await api.get('/users/me/solved');
      if (Array.isArray(data.solved)) {
        setSolvedProblems(new Set(data.solved));
      }
    } catch (error) {
      console.error('Failed to fetch solved status', error);
    }
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchProblems();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/30 border-0';
      case 'medium': return 'bg-[#F59E0B]/20 text-[#F59E0B] hover:bg-[#F59E0B]/30 border-0';
      case 'hard': return 'bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30 border-0';
      default: return 'bg-[#9CA3AF]/20 text-[#9CA3AF] border-0';
    }
  };

  const totalPages = Math.ceil(totalProblems / ITEMS_PER_PAGE);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B]">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Code2 className="h-8 w-8 text-[#22C55E]" />
            Problems
          </h1>
          <p className="text-[#A1A1AA]">Curated list of challenges to master algorithms.</p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#71717A]" />
            <Input
              placeholder="Search by title..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={handleSearch}
              className="bg-[#18181B] border-[#27272A] text-white pl-10 h-10 focus:ring-[#22C55E] focus:border-[#22C55E]"
            />
          </div>

          <Select 
            value={filters.difficulty} 
            onValueChange={(value) => {
              setFilters({ ...filters, difficulty: value === 'all' ? '' : value });
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px] bg-[#18181B] border-[#27272A] text-white h-10">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-[#18181B] border-[#27272A] text-white">
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={() => { setCurrentPage(1); fetchProblems(); }} 
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white h-10 px-6 font-medium"
          >
            Filter
          </Button>
        </div>

        {/* Table / List View */}
        <div className="bg-[#18181B] rounded-xl border border-[#27272A] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#27272A] bg-[#27272A]/50 text-sm font-medium text-[#A1A1AA]">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-6 md:col-span-7">Title</div>
            <div className="col-span-2 text-center">Difficulty</div>
            <div className="col-span-3 md:col-span-2 text-center">Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#27272A]">
            {loading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
              </div>
            ) : problems.length === 0 ? (
              <div className="py-16 text-center text-[#71717A]">
                <BrainCircuit className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No problems found matching your criteria.</p>
              </div>
            ) : (
              problems.map((problem, index) => {
                const isSolved = solvedProblems.has(problem._id);
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                return (
                  <Link 
                    key={problem._id} 
                    href={`/problems/${problem._id}`}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#27272A]/40 transition-colors group"
                  >
                    {/* Index */}
                    <div className="col-span-1 text-center text-[#71717A] font-mono text-sm group-hover:text-white">
                      {globalIndex}
                    </div>

                    {/* Title & Tags */}
                    <div className="col-span-6 md:col-span-7">
                      <h3 className="text-[#E4E4E7] font-medium group-hover:text-[#22C55E] transition-colors truncate">
                        {problem.title}
                      </h3>
                      {problem.tags && problem.tags.length > 0 && (
                        <div className="flex gap-2 mt-1.5 overflow-hidden">
                          {problem.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-[#27272A] text-[#A1A1AA] text-[10px] px-1.5 py-0 h-5 font-normal hover:bg-[#3F3F46]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Difficulty */}
                    <div className="col-span-2 flex justify-center">
                      <Badge className={`${getDifficultyColor(problem.difficulty)} px-2.5 py-0.5 text-xs font-medium capitalize`}>
                        {problem.difficulty}
                      </Badge>
                    </div>

                    {/* Status */}
                    <div className="col-span-3 md:col-span-2 flex justify-center">
                      {isSolved ? (
                        <div className="flex items-center gap-1.5 text-[#22C55E]">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="text-xs font-medium hidden md:inline">Solved</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#71717A] group-hover:text-[#A1A1AA]">
                          <Circle className="h-5 w-5" />
                          <span className="text-xs font-medium hidden md:inline">Unsolved</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination Footer */}
        {totalProblems > 0 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <p className="text-sm text-[#71717A]">
              Showing <span className="text-white font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="text-white font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalProblems)}</span> of{' '}
              <span className="text-white font-medium">{totalProblems}</span> problems
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="bg-[#18181B] border-[#27272A] text-white hover:bg-[#27272A]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1 px-2">
                 <span className="text-sm font-medium text-white bg-[#22C55E] h-8 w-8 flex items-center justify-center rounded">
                   {currentPage}
                 </span>
                 <span className="text-[#71717A] text-sm px-1">/</span>
                 <span className="text-sm text-[#71717A]">{totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="bg-[#18181B] border-[#27272A] text-white hover:bg-[#27272A]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}