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
  Loader2,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Code2,
  Filter,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900/50 border border-zinc-800 p-8 md:p-10">
          <div className="absolute top-0 right-0 p-8 opacity-5"><BrainCircuit className="w-64 h-64 text-emerald-500" /></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Code2 className="h-6 w-6 text-emerald-500" />
              </div>
              Algorithm Library
            </h1>
            <p className="text-zinc-400 max-w-2xl">
              Master Data Structures & Algorithms with our curated list of challenges. 
              Track your progress and climb the leaderboard.
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm sticky top-4 z-20 shadow-xl shadow-black/20">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search problem title..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={handleSearch}
              className="bg-zinc-950 border-zinc-800 text-zinc-100 pl-10 h-11 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Select 
              value={filters.difficulty} 
              onValueChange={(value) => {
                setFilters({ ...filters, difficulty: value === 'all' ? '' : value });
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-zinc-950 border-zinc-800 text-zinc-100 h-11">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy" className="text-emerald-400">Easy</SelectItem>
                <SelectItem value="medium" className="text-amber-400">Medium</SelectItem>
                <SelectItem value="hard" className="text-red-400">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={() => { setCurrentPage(1); fetchProblems(); }} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white h-11 px-6 font-medium shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"
            >
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>
        </div>

        {/* Problem List */}
        <div className="space-y-2">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
              <p className="text-zinc-500 animate-pulse">Loading library...</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="py-24 text-center text-zinc-500 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
              <BrainCircuit className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-zinc-300">No problems found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {/* Header Row (Hidden on mobile) */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-6">Title</div>
                <div className="col-span-2 text-center">Difficulty</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              {problems.map((problem, index) => {
                const isSolved = solvedProblems.has(problem._id);
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                return (
                  <Link 
                    key={problem._id} 
                    href={`/problems/${problem._id}`}
                    className="group relative grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-4 items-center bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-900 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
                  >
                    {/* Index */}
                    <div className="hidden md:block col-span-1 text-center font-mono text-zinc-600 group-hover:text-zinc-300">
                      {globalIndex}
                    </div>

                    {/* Title */}
                    <div className="col-span-12 md:col-span-6">
                      <h3 className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors text-base truncate pr-4">
                        {problem.title}
                      </h3>
                      {problem.tags && problem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {problem.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-zinc-950 border-zinc-800 text-zinc-500 text-[10px] px-1.5 py-0 h-5 font-medium hover:text-zinc-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Difficulty */}
                    <div className="col-span-6 md:col-span-2 flex md:justify-center items-center">
                      <Badge className={cn("capitalize border bg-opacity-10 backdrop-blur-sm",
                        problem.difficulty === 'easy' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        problem.difficulty === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {problem.difficulty}
                      </Badge>
                    </div>

                    {/* Status */}
                    <div className="col-span-6 md:col-span-2 flex md:justify-center items-center justify-end">
                      {isSolved ? (
                        <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs font-bold">Solved</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-zinc-600 group-hover:text-zinc-400">
                          <Circle className="h-4 w-4" />
                          <span className="text-xs font-medium">Unsolved</span>
                        </div>
                      )}
                    </div>

                    {/* Action Arrow */}
                    <div className="hidden md:flex col-span-1 justify-end">
                      <ChevronRight className="h-5 w-5 text-zinc-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalProblems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              Showing <span className="text-zinc-200 font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="text-zinc-200 font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, totalProblems)}</span> of{' '}
              <span className="text-zinc-200 font-medium">{totalProblems}</span> problems
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1 px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
                 <span className="text-sm font-bold text-emerald-500">{currentPage}</span>
                 <span className="text-zinc-600 text-sm">/</span>
                 <span className="text-sm text-zinc-400">{totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
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