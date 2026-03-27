'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { problemApi, Problem } from '@/lib/api-modules';
import { api } from '@/lib/api';
import MainLayout from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Search,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Code2,
  Filter,
  Trophy,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProblemsPageSkeleton } from '@/components/skeletons/site-skeletons';

const ITEMS_PER_PAGE = 10;

export default function ProblemsPage() {
  const router = useRouter();
  const { initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();

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
    if (!initialized || authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchProblems(), fetchSolvedStatus()]);
      setLoading(false);
    };

    initData();
  }, [initialized, isAuthenticated, authLoading, router, currentPage, filters.type, filters.difficulty]); 

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

  const totalPages = Math.ceil(totalProblems / ITEMS_PER_PAGE);

  if (!initialized) {
    return (
      <MainLayout>
        <ProblemsPageSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 font-sans">
        
        {/* Header & Filters */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold tracking-wide uppercase mb-1 border border-emerald-500/20">
                <Code2 className="h-3.5 w-3.5" />
                <span>Coding Challenges</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">Problems</h1>
              <p className="text-zinc-400 text-sm max-w-md mt-1">
                Refine your skills with our curated algorithmic challenges.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-zinc-950/50 border border-zinc-800/80 rounded-2xl shadow-xl shadow-black/20">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="Search problems..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={handleSearch}
                className="bg-transparent border-0 text-zinc-100 pl-12 h-12 text-base focus-visible:ring-0 shadow-none placeholder:text-zinc-600"
              />
            </div>

            <div className="h-8 w-[1px] bg-zinc-800 hidden sm:block"></div>

            <div className="flex items-center gap-2 w-full sm:w-auto px-2 pb-2 sm:pb-0 sm:px-2 sm:pr-1">
              <Select 
                value={filters.difficulty} 
                onValueChange={(value) => {
                  setFilters({ ...filters, difficulty: value === 'all' ? '' : value });
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[130px] bg-zinc-900/50 border border-zinc-800 rounded-xl h-10 text-zinc-300 hover:bg-zinc-800 transition-colors justify-between focus:ring-1 focus:ring-emerald-500 shadow-none">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100 rounded-xl shadow-xl shadow-black/40">
                  <SelectItem value="all" className="focus:bg-zinc-900 focus:text-white rounded-lg">All</SelectItem>
                  <SelectItem value="easy" className="text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400 rounded-lg">Easy</SelectItem>
                  <SelectItem value="medium" className="text-amber-400 focus:bg-amber-500/10 focus:text-amber-400 rounded-lg">Medium</SelectItem>
                  <SelectItem value="hard" className="text-red-400 focus:bg-red-500/10 focus:text-red-400 rounded-lg">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Problem List */}
        <div className="pt-2">
          {loading ? (
            <ProblemsPageSkeleton />
          ) : problems.length === 0 ? (
            <div className="py-24 text-center rounded-3xl border border-dashed border-zinc-800/80 bg-zinc-950/30 flex flex-col items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-zinc-900/50 flex items-center justify-center mb-5 border border-zinc-800">
                <BrainCircuit className="h-10 w-10 text-zinc-700" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-300">No problems found</h3>
              <p className="text-zinc-500 mt-2 max-w-sm mx-auto text-sm">Change your search query or reset the filters to see more results.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {problems.map((problem) => {
                const isSolved = solvedProblems.has(problem._id);

                return (
                  <Link 
                    key={problem._id} 
                    href={`/problems/${problem._id}`}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 md:px-6 md:py-5 bg-zinc-950/40 border border-zinc-800/60 rounded-2xl hover:bg-zinc-900/80 hover:border-emerald-500/30 transition-all duration-300 overflow-hidden"
                  >
                    {/* Subtle hover highlight */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1 relative z-10 w-full">
                      {/* Status Icon */}
                      <div className="shrink-0 pt-0.5 sm:pt-0">
                        {isSolved ? (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600 group-hover:border-zinc-700 group-hover:text-zinc-500 transition-colors">
                            <Circle className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      {/* Title & Tags */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-zinc-100 group-hover:text-white transition-colors text-base truncate pr-4">
                          {problem.title}
                        </h3>
                        {problem.tags && problem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5 hidden sm:flex">
                            {problem.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="bg-zinc-900/80 border-zinc-800 font-normal text-zinc-400 text-[10px] px-2 py-0 h-5 hover:bg-zinc-800 hover:text-zinc-300 transition-colors">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Difficulty Icons & Chevron */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto relative z-10 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-zinc-800/50 sm:border-0 pl-12 sm:pl-0">
                      
                      {/* Visual Difficulty Meter */}
                      <div 
                        className="flex items-center gap-0.5"
                        title={`Difficulty: ${problem.difficulty}`}
                      >
                         <Zap className={cn("h-4 w-4", 
                           problem.difficulty === 'easy' ? "text-emerald-500 fill-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                           problem.difficulty === 'medium' ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : 
                           "text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                         )} />
                         
                         <Zap className={cn("h-4 w-4", 
                           problem.difficulty === 'medium' || problem.difficulty === 'hard' 
                             ? (problem.difficulty === 'medium' ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]")
                             : "text-zinc-800 fill-zinc-800/50"
                         )} />
                         
                         <Zap className={cn("h-4 w-4", 
                           problem.difficulty === 'hard' 
                             ? "text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                             : "text-zinc-800 fill-zinc-800/50"
                         )} />
                      </div>

                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800/60 group-hover:bg-zinc-800 group-hover:border-zinc-700 transition-all">
                        <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Details */}
        {totalProblems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-zinc-800/50">
            <p className="text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800/50">
              Showing <span className="text-zinc-300 font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="text-zinc-300 font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, totalProblems)}</span> of{' '}
              <span className="text-zinc-300 font-semibold">{totalProblems}</span>
            </p>
            
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="h-9 w-9 bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-xl active:scale-95 transition-all focus:ring-1 focus:ring-emerald-500"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center justify-center min-w-[3rem] px-2 h-9 bg-zinc-900 rounded-xl border border-zinc-800">
                 <span className="text-sm font-bold text-white">{currentPage}</span>
                 <span className="text-zinc-600 text-xs mx-1">/</span>
                 <span className="text-sm text-zinc-500">{totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="h-9 w-9 bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-xl active:scale-95 transition-all focus:ring-1 focus:ring-emerald-500"
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