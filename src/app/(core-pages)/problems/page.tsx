'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Search, CheckCircle2, Circle, ChevronLeft, ChevronRight, BrainCircuit, Code2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProblemsPageSkeleton } from '@/components/skeletons/site-skeletons';

const ITEMS_PER_PAGE = 10;

export default function ProblemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [totalProblems, setTotalProblems] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get('page') || '1');
    return Number.isFinite(page) && page > 0 ? page : 1;
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'dsa',
    difficulty: searchParams.get('difficulty') || '',
    search: '',
  });
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!initialized || authLoading) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchProblems(), fetchSolvedStatus()]);
      setLoading(false);
    };
    initData();
  }, [initialized, isAuthenticated, authLoading, router, currentPage, filters.type, filters.difficulty]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (currentPage > 1) params.set('page', String(currentPage));

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `/problems?${nextQuery}` : '/problems', { scroll: false });
    }
  }, [filters.difficulty, currentPage, router, searchParams]);

  const fetchProblems = async () => {
    try {
      const data = await problemApi.getProblems({
        type: filters.type, difficulty: filters.difficulty || undefined,
        search: filters.search || undefined, limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      });
      setProblems(data?.problems || []);
      setTotalProblems(data?.pagination?.total || 0);
    } catch (error) { console.error(error); toast.error('Failed to load problems'); }
  };

  const fetchSolvedStatus = async () => {
    try {
      const { data } = await api.get('/users/me/solved');
      if (Array.isArray(data.solved)) setSolvedProblems(new Set(data.solved));
    } catch (error) { console.error('Failed to fetch solved status', error); }
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { setCurrentPage(1); fetchProblems(); }
  };

  const totalPages = Math.ceil(totalProblems / ITEMS_PER_PAGE);

  if (!initialized) {
    return (<MainLayout><ProblemsPageSkeleton /></MainLayout>);
  }

  return (
    <MainLayout>
      <div className="h-auto lg:h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col font-sans animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-visible lg:overflow-hidden">
        {/* Header & Filters */}
        <div className="flex flex-col gap-3 shrink-0 mb-3 bg-zinc-900/40 rounded-3xl p-4 md:p-5 border border-zinc-800/50 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-widest mb-1 border border-emerald-500/20 shadow-sm">
                <Code2 className="h-3 w-3" /><span>Coding Challenges</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">Problems Archive</h1>
              <p className="text-zinc-400 text-[13px] md:text-sm max-w-md font-medium">Refine your skills with our curated algorithmic challenges.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl shadow-inner w-full md:w-auto">
              <div className="relative flex-1 group min-w-[200px]">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <Input placeholder="Search problems..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} onKeyDown={handleSearch} className="bg-transparent border-0 text-zinc-100 pl-11 h-10 text-sm focus-visible:ring-0 shadow-none placeholder:text-zinc-600 w-full" />
              </div>
              <div className="h-6 w-[1px] bg-zinc-800 hidden sm:block shrink-0" />
              <div className="w-full sm:w-auto px-1 pb-1 sm:pb-0 sm:px-1 shrink-0">
                <Select value={filters.difficulty} onValueChange={(value) => { setFilters({ ...filters, difficulty: value === 'all' ? '' : value }); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-[130px] bg-zinc-900 border border-zinc-700/80 rounded-xl h-10 text-zinc-300 hover:bg-zinc-800 transition-colors focus:ring-1 focus:ring-emerald-500 shadow-none text-sm"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100 rounded-xl shadow-xl shadow-black/40 relative z-[100]">
                    <SelectItem value="all" className="focus:bg-zinc-900 focus:text-white rounded-lg text-sm">All Levels</SelectItem>
                    <SelectItem value="easy" className="text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400 rounded-lg text-sm">Easy</SelectItem>
                    <SelectItem value="medium" className="text-amber-400 focus:bg-amber-500/10 focus:text-amber-400 rounded-lg text-sm">Medium</SelectItem>
                    <SelectItem value="hard" className="text-red-400 focus:bg-red-500/10 focus:text-red-400 rounded-lg text-sm">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Table — fills remaining space */}
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/60 rounded-[2rem] overflow-hidden shadow-xl">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-8 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-950/80 border-b border-zinc-800/60 shrink-0">
            <div className="col-span-8 flex items-center">Challenge Title & Tags</div>
            <div className="col-span-4 flex items-center justify-end">Difficulty & Status</div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="divide-y divide-zinc-800/30">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-5 px-8 py-3.5">
                    <div className="h-10 w-10 rounded-xl bg-zinc-800/50 shrink-0 skeleton-shimmer" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-3/5 bg-zinc-800/60 rounded-lg skeleton-shimmer" />
                      <div className="flex gap-2"><div className="h-3 w-14 bg-zinc-800/30 rounded-full skeleton-shimmer" /><div className="h-3 w-14 bg-zinc-800/30 rounded-full skeleton-shimmer" /></div>
                    </div>
                    <div className="h-6 w-16 bg-zinc-800/50 rounded-lg shrink-0 skeleton-shimmer" />
                  </div>
                ))}
              </div>
            ) : problems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-10">
                <div className="h-20 w-20 rounded-[1.5rem] bg-zinc-900/50 flex items-center justify-center mb-5 border border-zinc-800 shadow-inner"><BrainCircuit className="h-10 w-10 text-zinc-700" /></div>
                <h3 className="text-lg font-bold text-zinc-300">No problems found</h3>
                <p className="text-zinc-500 mt-2 max-w-sm mx-auto text-sm text-center font-medium">Change your search query or reset the filters to see more results.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-zinc-800/40">
                {problems.map((problem) => {
                  const isSolved = solvedProblems.has(problem._id);
                  return (
                    <Link
                      key={problem._id}
                      href={{
                        pathname: `/problems/${problem._id}`,
                        query: {
                          ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
                          ...(currentPage > 1 ? { page: String(currentPage) } : {}),
                        },
                      }}
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 md:px-8 md:py-3.5 hover:bg-zinc-800/40 transition-all duration-300 gap-3 sm:gap-0"
                    >
                      <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0 flex-1 relative z-10 w-full">
                        <div className="shrink-0 pt-0.5 sm:pt-0">
                          {isSolved ? (
                            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:bg-emerald-500/20 transition-colors"><CheckCircle2 className="h-5 w-5" /></div>
                          ) : (
                            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:border-zinc-700 group-hover:text-zinc-400 group-hover:bg-zinc-800 shadow-inner transition-all"><Circle className="h-5 w-5" /></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors text-[15px] md:text-base truncate pr-4">{problem.title}</h3>
                          {problem.tags && problem.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5 hidden sm:flex">
                              {problem.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="bg-zinc-950 border-zinc-800 font-bold text-zinc-500 text-[8px] px-2 py-0.5 h-auto uppercase tracking-widest hover:bg-zinc-800 hover:text-zinc-300 transition-colors shadow-sm">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto relative z-10 mt-1 sm:mt-0 pt-3 sm:pt-0 border-t border-zinc-800/40 sm:border-0 pl-14 sm:pl-0 shrink-0">
                        <div className="flex items-center gap-0.5 mr-2" title={`Difficulty: ${problem.difficulty}`}>
                          <Zap className={cn("h-4 w-4", problem.difficulty === 'easy' ? "text-emerald-500 fill-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : problem.difficulty === 'medium' ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]")} />
                          <Zap className={cn("h-4 w-4", problem.difficulty === 'medium' || problem.difficulty === 'hard' ? (problem.difficulty === 'medium' ? "text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]") : "text-zinc-800 fill-zinc-800/50")} />
                          <Zap className={cn("h-4 w-4", problem.difficulty === 'hard' ? "text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-zinc-800 fill-zinc-800/50")} />
                        </div>
                        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-950 border border-zinc-800/80 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all shadow-sm">
                          <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Pagination Footer */}
          {totalProblems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 md:px-8 border-t border-zinc-800/60 bg-zinc-950/90 backdrop-blur-xl shrink-0">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Showing <span className="text-zinc-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="text-zinc-300">{Math.min(currentPage * ITEMS_PER_PAGE, totalProblems)}</span> of <span className="text-emerald-400">{totalProblems}</span> Valid Problems
              </p>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading} className="h-8 w-8 bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-[10px] active:scale-95 transition-all focus:ring-1 focus:ring-emerald-500 shadow-sm"><ChevronLeft className="h-4 w-4" /></Button>
                <div className="flex items-center justify-center min-w-[3.5rem] px-2 h-8 bg-zinc-900 rounded-[10px] border border-zinc-800 shadow-inner">
                  <span className="text-[13px] font-bold text-white leading-none">{currentPage}</span>
                  <span className="text-zinc-600 text-[10px] font-bold mx-1.5 leading-none">/</span>
                  <span className="text-[13px] text-zinc-500 font-bold leading-none">{totalPages}</span>
                </div>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || loading} className="h-8 w-8 bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-[10px] active:scale-95 transition-all focus:ring-1 focus:ring-emerald-500 shadow-sm"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
