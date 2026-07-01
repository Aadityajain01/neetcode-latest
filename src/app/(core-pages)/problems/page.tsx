'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { problemApi, Problem } from '@/lib/api-modules';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, CheckCircle2, Circle, ChevronLeft, ChevronRight, BrainCircuit, Code2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProblemsTableSkeleton } from '@/components/skeletons/inline-skeletons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ITEMS_PER_PAGE = 10;

export default function ProblemsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initialized, isAuthenticated, isLoading: authLoading, user, firebaseUser } = useAuthStore();
  
  // Loading & Problems states
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [profileStats, setProfileStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll ref for horizontal categories tags
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync initial difficulty from URL query params
  useEffect(() => {
    const diff = searchParams.get('difficulty');
    if (diff === 'easy' || diff === 'medium' || diff === 'hard') {
      setSelectedDifficulty(diff);
    } else {
      setSelectedDifficulty(null);
    }
  }, [searchParams]);

  // Fetch initial raw dataset
  useEffect(() => {
    if (!initialized || authLoading) return;

    const initData = async () => {
      try {
        setLoading(true);
        if (isAuthenticated) {
          const [problemsRes, solvedRes, profileRes] = await Promise.all([
            problemApi.getProblems({ limit: 1000, type: 'dsa' }),
            api.get('/users/me/solved'),
            api.get('/users/profile/me'),
          ]);

          if (problemsRes?.problems) {
            setAllProblems(problemsRes.problems);
          }
          if (Array.isArray(solvedRes?.data?.solved)) {
            setSolvedProblems(new Set(solvedRes.data.solved));
          }
          if (profileRes?.data?.profile?.stats) {
            setProfileStats(profileRes.data.profile.stats);
          }
        } else {
          const problemsRes = await problemApi.getProblems({ limit: 1000, type: 'dsa' });
          if (problemsRes?.problems) {
            setAllProblems(problemsRes.problems);
          }
          setSolvedProblems(new Set());
          setProfileStats(null);
        }
      } catch (error) {
        console.error('Failed to load data', error);
        toast.error('Failed to load problems dataset');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [initialized, isAuthenticated, authLoading]);

  // Extract unique categories (tags) and count their occurrences
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    allProblems.forEach((p) => {
      if (p.tags) {
        p.tags.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => {
        const label = name
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return { name, label, count };
      })
      .sort((a, b) => b.count - a.count);
  }, [allProblems]);

  // Horizontal scroll tags handler
  const scrollTags = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Compose all filters (Search + Category Tag + Difficulty Card 25 Limit)
  const filteredProblems = useMemo(() => {
    let result = [...allProblems];

    // 1. Search Query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // 2. Tag filter
    if (selectedTag) {
      result = result.filter((p) => p.tags?.includes(selectedTag));
    }

    // 3. Difficulty card filter
    if (selectedDifficulty) {
      result = result.filter((p) => p.difficulty === selectedDifficulty);
    }

    // 4. Cap limit to 25 when difficulty is selected
    if (selectedDifficulty) {
      result = result.slice(0, 25);
    }

    return result;
  }, [allProblems, searchQuery, selectedTag, selectedDifficulty]);

  // Paginated set
  const totalProblems = filteredProblems.length;
  const totalPages = Math.ceil(totalProblems / ITEMS_PER_PAGE);

  const paginatedProblems = useMemo(() => {
    if (selectedDifficulty) {
      return filteredProblems; // Difficulty active filters are capped to 25, no pagination needed
    }
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProblems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProblems, currentPage, selectedDifficulty]);

  // Handle difficulty selection toggling & query param update
  const handleDifficultyToggle = (diff: 'easy' | 'medium' | 'hard') => {
    const nextDiff = selectedDifficulty === diff ? null : diff;
    setSelectedDifficulty(nextDiff);
    setCurrentPage(1);

    const params = new URLSearchParams(window.location.search);
    if (nextDiff) {
      params.set('difficulty', nextDiff);
    } else {
      params.delete('difficulty');
    }
    const queryString = params.toString();
    router.replace(queryString ? `/problems?${queryString}` : '/problems', { scroll: false });
  };

  // Profile photo/initial extraction
  const profileImageUrl = user?.avatarUrl || firebaseUser?.photoURL || undefined;
  const profileInitial =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    firebaseUser?.displayName?.[0]?.toUpperCase() ||
    firebaseUser?.email?.[0]?.toUpperCase() ||
    'U';

  // Calculate difficulty ratios for sidebar cards
  const easyTotal = allProblems.filter((p) => p.difficulty === 'easy').length || 1;
  const medTotal = allProblems.filter((p) => p.difficulty === 'medium').length || 1;
  const hardTotal = allProblems.filter((p) => p.difficulty === 'hard').length || 1;

  const easySolved = allProblems.filter((p) => p.difficulty === 'easy' && solvedProblems.has(p._id)).length;
  const medSolved = allProblems.filter((p) => p.difficulty === 'medium' && solvedProblems.has(p._id)).length;
  const hardSolved = allProblems.filter((p) => p.difficulty === 'hard' && solvedProblems.has(p._id)).length;

  if (!initialized) return null;

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-4 md:p-6 min-h-0 overflow-y-auto lg:overflow-hidden font-sans text-zinc-100">
      
      {/* ── LEFT MAIN CONTENT COLUMN ────────────────────────────────────────── */}
      <div className="flex-1 h-full flex flex-col gap-4 min-w-0">
        
        {/* Header and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight leading-none">Problems</h1>
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mt-1.5">
              Refine your problem-solving skills
            </p>
          </div>

          <div className="flex items-center gap-2 max-w-sm w-full sm:w-80 p-1 bg-zinc-900/40 rounded-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-white transition-colors" />
              <Input
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-0 text-zinc-100 pl-9 pr-3 h-8 text-xs focus-visible:ring-0 shadow-none placeholder:text-zinc-600 w-full"
              />
            </div>
          </div>
        </div>

        {/* Categories Tags row with manual scroll buttons */}
        <div className="shrink-0 flex items-center gap-1 bg-zinc-900/10 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => scrollTags('left')}
            className="h-6 w-6 bg-zinc-900/40 text-zinc-500 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-zinc-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 px-1"
          >
            <button
              onClick={() => {
                setSelectedTag(null);
                setCurrentPage(1);
              }}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 shrink-0 select-none border-0',
                selectedTag === null
                  ? 'bg-white text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              )}
            >
              <span>All Categories</span>
              <span className={cn(
                'text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold',
                selectedTag === null ? 'bg-zinc-950 text-white' : 'bg-zinc-950 text-zinc-500'
              )}>
                {allProblems.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedTag === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedTag(isSelected ? null : cat.name);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 shrink-0 select-none border-0',
                    isSelected
                      ? 'bg-white text-zinc-950 font-bold shadow-sm'
                      : 'bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  )}
                >
                  <span>{cat.label}</span>
                  <span className={cn(
                    'text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold',
                    isSelected ? 'bg-zinc-950 text-white' : 'bg-zinc-950 text-zinc-500'
                  )}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollTags('right')}
            className="h-6 w-6 bg-zinc-900/40 text-zinc-500 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-zinc-900"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Problems List Card Stack - Borderless */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-1">
            {loading ? (
              <ProblemsTableSkeleton />
            ) : filteredProblems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-zinc-900/10 rounded-3xl">
                <BrainCircuit className="h-8 w-8 text-zinc-700 mb-3" />
                <p className="text-zinc-500 text-sm font-semibold">No problems found</p>
                <p className="text-zinc-600 text-xs mt-1">Try resetting the tags or search filters</p>
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedProblems.map((problem) => {
                  const isSolved = solvedProblems.has(problem._id);

                  return (
                    <Link
                      key={problem._id}
                      href={`/problems/${problem._id}`}
                      className="group relative flex items-center justify-between p-4 bg-zinc-900/20 hover:bg-zinc-900/40 rounded-2xl transition-all duration-300 gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="shrink-0">
                          {isSolved ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 bg-emerald-500/10 rounded-lg p-0.5" />
                          ) : (
                            <Circle className="h-5 w-5 text-zinc-800 group-hover:text-zinc-600 transition-colors" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors truncate">
                            {problem.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={cn(
                                'text-[9px] font-black uppercase tracking-wider',
                                problem.difficulty === 'easy'
                                  ? 'text-emerald-500'
                                  : problem.difficulty === 'medium'
                                  ? 'text-amber-500'
                                  : 'text-red-500'
                              )}
                            >
                              {problem.difficulty}
                            </span>
                            {problem.tags && problem.tags.length > 0 && (
                              <>
                                <span className="text-[10px] text-zinc-800 font-bold">•</span>
                                <div className="flex flex-wrap gap-1">
                                  {problem.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[8px] bg-zinc-950 text-zinc-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                      {tag.replace('-', ' ')}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Difficulty Zap indicators & Chevron */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-0.5">
                          <Zap
                            className={cn(
                              'h-3.5 w-3.5',
                              problem.difficulty === 'easy'
                                ? 'text-emerald-500 fill-emerald-500/80 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]'
                                : problem.difficulty === 'medium'
                                ? 'text-amber-500 fill-amber-500/80 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                                : 'text-red-500 fill-red-500/80 drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                            )}
                          />
                          <Zap
                            className={cn(
                              'h-3.5 w-3.5',
                              problem.difficulty === 'medium' || problem.difficulty === 'hard'
                                ? problem.difficulty === 'medium'
                                  ? 'text-amber-500 fill-amber-500/80 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                                  : 'text-red-500 fill-red-500/80 drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                                : 'text-zinc-850 fill-zinc-850/20'
                            )}
                          />
                          <Zap
                            className={cn(
                              'h-3.5 w-3.5',
                              problem.difficulty === 'hard'
                                ? 'text-red-500 fill-red-500/80 drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                                : 'text-zinc-850 fill-zinc-850/20'
                            )}
                          />
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-650 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {!selectedDifficulty && totalProblems > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between gap-3 p-4 shrink-0 bg-zinc-950/20 rounded-2xl mt-2">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Showing <span className="text-zinc-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> -{' '}
                <span className="text-zinc-300">{Math.min(currentPage * ITEMS_PER_PAGE, totalProblems)}</span> of{' '}
                <span className="text-brand-500">{totalProblems}</span> problems
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="h-7 w-7 bg-zinc-900/60 border-0 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg active:scale-95 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center min-w-[3rem] px-2 h-7 bg-zinc-900/60 rounded-lg text-xs font-bold">
                  <span className="text-brand-500">{currentPage}</span>
                  <span className="text-zinc-600 mx-1">/</span>
                  <span className="text-zinc-500">{totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="h-7 w-7 bg-zinc-900/60 border-0 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg active:scale-95 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT DETAILS SIDEBAR ────────────────────────────────────────────── */}
      <div className="w-full lg:w-[320px] shrink-0 h-full flex flex-col gap-4 overflow-y-auto lg:overflow-hidden pr-1 pb-4 lg:pb-0">
        
        {/* Profile spacing offset */}
        <div className="hidden lg:block h-16 shrink-0" />

        {/* Profile Card */}
        {/* <div className="bg-zinc-900/20 backdrop-blur-md rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden shrink-0">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-zinc-600 via-zinc-200 to-zinc-700 p-[1px] relative shrink-0">
            <Avatar className="h-full w-full rounded-full bg-zinc-950 border border-zinc-950">
              <AvatarImage
                src={profileImageUrl}
                alt={user?.displayName || user?.email || 'User avatar'}
                className="h-full w-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="rounded-full bg-zinc-950 text-white font-bold text-sm flex items-center justify-center">
                {profileInitial}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white truncate">{user?.displayName || 'Developer'}</h3>
            <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">{user?.email}</p>
            {profileStats && (
              <div className="flex items-center gap-2 mt-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                <span>Rank #{profileStats.rank || '—'}</span>
                <span className="text-zinc-700">•</span>
                <span>{profileStats.score || 0} Points</span>
              </div>
            )}
          </div>
        </div> */}

        {/* Difficulty Filter Cards */}
        <div className="flex flex-col gap-3 shrink-0">
          
          {/* Easy Card */}
          <div
            onClick={() => handleDifficultyToggle('easy')}
            className={cn(
              'group rounded-3xl p-5 transition-all select-none cursor-pointer duration-300 relative overflow-hidden flex flex-col gap-3.5',
              selectedDifficulty === 'easy'
                ? 'bg-white text-zinc-950 shadow-lg scale-[1.02]'
                : 'bg-zinc-900/20 hover:bg-zinc-900/40 text-zinc-100'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className={cn('text-sm font-black tracking-tight', selectedDifficulty === 'easy' ? 'text-zinc-950' : 'text-white')}>
                  Easy 25
                </h4>
                <p className={cn('text-[9px] font-bold uppercase tracking-wider mt-0.5', selectedDifficulty === 'easy' ? 'text-zinc-600' : 'text-zinc-500')}>
                  Targeted fundamental practice
                </p>
              </div>
              <CheckCircle2 className={cn('h-5 w-5', selectedDifficulty === 'easy' ? 'text-emerald-600' : 'text-emerald-500')} />
            </div>
            
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <span className={selectedDifficulty === 'easy' ? 'text-zinc-700' : 'text-zinc-400'}>Solved</span>
                <span className="font-mono">{easySolved} / {easyTotal}</span>
              </div>
              <div className={cn('h-1.5 w-full rounded-full overflow-hidden', selectedDifficulty === 'easy' ? 'bg-zinc-200' : 'bg-zinc-950')}>
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (easySolved / easyTotal) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Medium Card */}
          <div
            onClick={() => handleDifficultyToggle('medium')}
            className={cn(
              'group rounded-3xl p-5 transition-all select-none cursor-pointer duration-300 relative overflow-hidden flex flex-col gap-3.5',
              selectedDifficulty === 'medium'
                ? 'bg-white text-zinc-950 shadow-lg scale-[1.02]'
                : 'bg-zinc-900/20 hover:bg-zinc-900/40 text-zinc-100'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className={cn('text-sm font-black tracking-tight', selectedDifficulty === 'medium' ? 'text-zinc-950' : 'text-white')}>
                  Medium 25
                </h4>
                <p className={cn('text-[9px] font-bold uppercase tracking-wider mt-0.5', selectedDifficulty === 'medium' ? 'text-zinc-600' : 'text-zinc-500')}>
                  Perfect core algorithms
                </p>
              </div>
              <Zap className={cn('h-5 w-5', selectedDifficulty === 'medium' ? 'text-amber-600 fill-amber-600/20' : 'text-amber-500')} />
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <span className={selectedDifficulty === 'medium' ? 'text-zinc-700' : 'text-zinc-400'}>Solved</span>
                <span className="font-mono">{medSolved} / {medTotal}</span>
              </div>
              <div className={cn('h-1.5 w-full rounded-full overflow-hidden', selectedDifficulty === 'medium' ? 'bg-zinc-200' : 'bg-zinc-950')}>
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (medSolved / medTotal) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hard Card */}
          <div
            onClick={() => handleDifficultyToggle('hard')}
            className={cn(
              'group rounded-3xl p-5 transition-all select-none cursor-pointer duration-300 relative overflow-hidden flex flex-col gap-3.5',
              selectedDifficulty === 'hard'
                ? 'bg-white text-zinc-950 shadow-lg scale-[1.02]'
                : 'bg-zinc-900/20 hover:bg-zinc-900/40 text-zinc-100'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className={cn('text-sm font-black tracking-tight', selectedDifficulty === 'hard' ? 'text-zinc-950' : 'text-white')}>
                  Hard 25
                </h4>
                <p className={cn('text-[9px] font-bold uppercase tracking-wider mt-0.5', selectedDifficulty === 'hard' ? 'text-zinc-600' : 'text-zinc-500')}>
                  Optimize complex systems
                </p>
              </div>
              <BrainCircuit className={cn('h-5 w-5', selectedDifficulty === 'hard' ? 'text-red-650' : 'text-red-500')} />
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <span className={selectedDifficulty === 'hard' ? 'text-zinc-700' : 'text-zinc-400'}>Solved</span>
                <span className="font-mono">{hardSolved} / {hardTotal}</span>
              </div>
              <div className={cn('h-1.5 w-full rounded-full overflow-hidden', selectedDifficulty === 'hard' ? 'bg-zinc-200' : 'bg-zinc-950')}>
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (hardSolved / hardTotal) * 100)}%` }}
                />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
