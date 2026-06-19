'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Code2, Trophy, Users, ArrowRight, BarChart3, 
  Terminal, Zap, Target, Activity, CheckCircle2,
  Menu, X, GitBranch, ArrowUpRight, ChevronLeft, ChevronRight, Circle, BrainCircuit, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import logo from "../../public/logo.png";
import { AppRouteSkeleton } from '@/components/skeletons/site-skeletons';
import MainLayout from '@/components/layouts/main-layout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { userApi, problemApi, submissionApi, leaderboardApi, Problem } from '@/lib/api-modules';

import MonochromeLanding from '@/components/monochrome-landing';

// ─── INTERNAL COMPONENTS ───────────────────────────────────────────────────────

const FeatureBento = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={cn("bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-8 relative overflow-hidden group", className)}>
    {children}
  </div>
);

// ─── CIRCULAR PROGRESS GAUGE ───────────────────────────────────────────────────
const CircularProgress = ({ solved, total }: { solved: number; total: number }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;
  const radius = 32;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          className="stroke-zinc-800 fill-none"
          strokeWidth={strokeWidth}
        />
        {total > 0 && (
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-emerald-500 transition-all duration-500 ease-out fill-none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[13px] font-black text-white leading-none">{solved}/{total}</span>
        <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Solved</span>
      </div>
    </div>
  );
};

// ─── STREAK CALENDAR ───────────────────────────────────────────────────────────
const StreakCalendar = ({ submissions }: { submissions: any[] }) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleString('default', { month: 'long' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const activeDays = useMemo(() => {
    const dates = new Set<string>();
    submissions?.forEach((sub) => {
      if (sub.status === 'accepted' && sub.createdAt) {
        const dateStr = new Date(sub.createdAt).toDateString();
        dates.add(dateStr);
      }
    });
    return dates;
  }, [submissions]);

  const days = useMemo(() => {
    const arr: (Date | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      arr.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      arr.push(new Date(year, month, d));
    }
    return arr;
  }, [year, month, firstDayIndex, totalDays]);

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-3 backdrop-blur-md relative overflow-hidden flex flex-col shrink-0">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Streak Calendar</h4>
        <span className="text-[10px] font-bold text-zinc-200">{monthName} {year}</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
        {weekdays.map((w, idx) => (
          <div key={idx}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="h-6 w-full" />;
          
          const isToday = day.toDateString() === now.toDateString();
          const hasStreak = activeDays.has(day.toDateString());

          return (
            <div
              key={idx}
              className={cn(
                "h-6 w-full rounded flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                hasStreak
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.15)]"
                  : isToday
                  ? "bg-zinc-800 border border-zinc-700 text-white"
                  : "text-zinc-500 bg-zinc-950/40 hover:bg-zinc-900/60 border border-transparent hover:text-zinc-300"
              )}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── SMALL LEADERBOARD ─────────────────────────────────────────────────────────
const SmallLeaderboard = ({ entries, myRank }: { entries: any[]; myRank: any }) => {
  const top3 = entries?.slice(0, 3) || [];
  const bottom2 = entries?.slice(3, 5) || [];

  const getTrophy = (rank: number) => {
    if (rank === 1) return <span className="text-yellow-500 text-sm">🥇</span>;
    if (rank === 2) return <span className="text-zinc-400 text-sm">🥈</span>;
    if (rank === 3) return <span className="text-amber-700 text-sm">🥉</span>;
    return null;
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-3 backdrop-blur-md flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex justify-between items-center mb-2 shrink-0">
        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Rankings</h4>
        <Link 
          href="/leaderboard" 
          className="text-[9px] font-bold text-orange-400 hover:text-orange-300 transition-colors uppercase tracking-widest flex items-center gap-0.5"
        >
          View Full <ArrowRight className="h-2.5 w-2.5" />
        </Link>
      </div>

      <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto no-scrollbar pr-0.5">
        {top3.map((entry) => (
          <div key={entry.userId} className="flex items-center justify-between bg-zinc-950/40 border border-zinc-800/50 p-2 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-5 flex items-center justify-center font-bold text-xs text-zinc-500">
                {getTrophy(entry.rank) || `#${entry.rank}`}
              </span>
              <span className="text-xs font-semibold text-zinc-300 truncate max-w-[120px]">
                {entry.displayName || 'Developer'}
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              {entry.score || 0} pts
            </span>
          </div>
        ))}

        {bottom2.map((entry) => (
          <div key={entry.userId} className="flex items-center justify-between bg-transparent px-2 py-1">
            <div className="flex items-center gap-2">
              <span className="w-5 flex items-center justify-center font-bold text-xs text-zinc-600">
                #{entry.rank}
              </span>
              <span className="text-xs text-zinc-400 truncate max-w-[120px]">
                {entry.displayName || 'Developer'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {entry.score || 0} pts
            </span>
          </div>
        ))}
      </div>

      {myRank && (
        <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-800 rounded-xl p-2.5 flex items-center justify-between mt-2.5 shadow-inner shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded">
              Your Rank
            </span>
            <span className="text-xs font-bold text-white">
              #{myRank.rank || '—'}
            </span>
          </div>
          <span className="text-xs font-mono font-black text-orange-400">
            {myRank.score || 0} pts
          </span>
        </div>
      )}
    </div>
  );
};

// ─── AUTHENTICATED DASHBOARD VIEW ──────────────────────────────────────────────
function DashboardView() {
  const { user } = useAuthStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollTags = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Queries
  const dashboardQuery = useQuery({
    queryKey: ['dashboard-data', user?.id],
    queryFn: () => userApi.getDashboard(),
  });

  const problemsQuery = useQuery({
    queryKey: ['all-problems'],
    queryFn: () => problemApi.getProblems({ limit: 1000, type: 'dsa' }),
  });

  const solvedQuery = useQuery({
    queryKey: ['solved-problems', user?.id],
    queryFn: async () => {
      const { data } = await api.get('/users/me/solved');
      return new Set<string>(data.solved || []);
    },
  });

  const submissionsQuery = useQuery({
    queryKey: ['user-submissions', user?.id],
    queryFn: () => submissionApi.getMySubmissions({ limit: 1000 }),
  });

  const leaderboardQuery = useQuery({
    queryKey: ['leaderboard-global'],
    queryFn: () => leaderboardApi.getGlobal({ limit: 5 }),
  });

  const userRankQuery = useQuery({
    queryKey: ['leaderboard-me', user?.id],
    queryFn: () => leaderboardApi.getGlobalMe(),
  });

  const allProblems = problemsQuery.data?.problems || [];

  // Compute tag counts dynamically
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

  // Keep a stable shuffled random set of 15 problems
  const [randomProblems, setRandomProblems] = useState<Problem[]>([]);
  useEffect(() => {
    if (allProblems.length > 0) {
      const shuffled = [...allProblems].sort(() => 0.5 - Math.random()).slice(0, 15);
      setRandomProblems(shuffled);
    }
  }, [problemsQuery.data, allProblems]);

  // Filter problems based on selected tag
  const filteredProblems = useMemo(() => {
    if (!selectedTag) return randomProblems;
    return allProblems.filter((p) => p.tags?.includes(selectedTag));
  }, [selectedTag, randomProblems, allProblems]);

  const isLoading =
    dashboardQuery.isLoading ||
    problemsQuery.isLoading ||
    solvedQuery.isLoading ||
    submissionsQuery.isLoading ||
    leaderboardQuery.isLoading ||
    userRankQuery.isLoading;

  if (isLoading) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const dsaCounts = dashboardQuery.data?.dsaCounts;
  const stats = dashboardQuery.data?.stats;

  const totalDsa = dsaCounts?.total || 20;
  const easyTotal = dsaCounts?.easy || 4;
  const medTotal = dsaCounts?.medium || 12;
  const hardTotal = dsaCounts?.hard || 4;

  const easySolved = stats?.dsaSolvedBreakdown?.easy || 0;
  const medSolved = stats?.dsaSolvedBreakdown?.medium || 0;
  const hardSolved = stats?.dsaSolvedBreakdown?.hard || 0;
  const totalSolved = stats?.problemsSolved || 0;

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-2 min-h-0 overflow-hidden font-sans">
      {/* Middle Content Area */}
      <div className="flex-1 h-full flex flex-col gap-4 min-w-0 overflow-hidden">
        {/* Welcome Header */}
        <div className="shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none">
              Welcome back,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
                {user?.displayName || 'Developer'}
              </span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
              Ready for today's challenge?
            </p>
          </div>
        </div>

        {/* Roadmaps Card */}
        <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-5 backdrop-blur-md relative overflow-hidden flex items-center justify-between shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-1">
            <h2 className="text-base font-black text-white tracking-tight">DSA Learning Path</h2>
            <p className="text-zinc-400 text-xs font-semibold">
              Structured interactive roadmaps covering key computer science topics.
            </p>
          </div>
          <div className="relative z-10 shrink-0 bg-zinc-950 border border-zinc-800/80 px-3 py-1.5 rounded-xl text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
            Coming Soon
          </div>
        </div>

        {/* Category Tags Bar */}
        <div className="shrink-0 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Problem Categories
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollTags('left')}
                className="h-5 w-5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded flex items-center justify-center transition-colors cursor-pointer hover:bg-zinc-800"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => scrollTags('right')}
                className="h-5 w-5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded flex items-center justify-center transition-colors cursor-pointer hover:bg-zinc-800"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 scroll-smooth"
          >
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shrink-0 select-none border',
                selectedTag === null
                  ? 'bg-white border-white text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105'
                  : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
              )}
            >
              <span>Random Mix</span>
              <span
                className={cn(
                  'text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold',
                  selectedTag === null ? 'bg-zinc-950 text-white' : 'bg-zinc-950 text-zinc-500'
                )}
              >
                15
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedTag === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedTag(cat.name)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shrink-0 select-none border',
                    isSelected
                      ? 'bg-white border-white text-zinc-950 shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-105'
                      : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                  )}
                >
                  <span>{cat.label}</span>
                  <span
                    className={cn(
                      'text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold',
                      isSelected ? 'bg-zinc-950 text-white' : 'bg-zinc-950 text-zinc-500'
                    )}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Problems List Scroll Area */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-2">
            {filteredProblems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-zinc-900/10 rounded-2xl border border-zinc-800/50">
                <BrainCircuit className="h-8 w-8 text-zinc-700 mb-3" />
                <p className="text-zinc-500 text-sm font-semibold">No problems found</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredProblems.map((problem) => {
                  const isSolved = solvedQuery.data?.has(problem._id);

                  return (
                    <Link
                      key={problem._id}
                      href={`/problems/${problem._id}`}
                      className="group relative flex items-center justify-between p-3.5 hover:bg-zinc-900/40 rounded-xl transition-all duration-300 gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="shrink-0">
                          {isSolved ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 bg-emerald-500/10 rounded-lg p-0.5 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]" />
                          ) : (
                            <Circle className="h-5 w-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                            {problem.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={cn(
                                'text-[9px] font-bold uppercase tracking-wider',
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
                                <span className="text-[9px] text-zinc-500 font-medium lowercase">
                                  {problem.tags.slice(0, 2).join(', ')}
                                </span>
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
                                : 'text-zinc-800 fill-zinc-800/20'
                            )}
                          />
                          <Zap
                            className={cn(
                              'h-3.5 w-3.5',
                              problem.difficulty === 'hard'
                                ? 'text-red-500 fill-red-500/80 drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                                : 'text-zinc-800 fill-zinc-800/20'
                            )}
                          />
                        </div>
                        <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar Column */}
      <div className="w-full lg:w-[330px] shrink-0 h-full flex flex-col gap-3 overflow-y-auto lg:overflow-hidden pr-1 pb-4 lg:pb-0">
        {/* Desktop floating popover padding spacer */}
        <div className="hidden lg:block h-16 shrink-0" />

        {/* Progress Chart Card */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden flex items-center justify-between shrink-0">
          <div className="space-y-3 flex-1">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
              Progress Stats
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs pr-4">
                <span className="flex items-center gap-1.5 font-bold text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Easy
                </span>
                <span className="font-mono text-zinc-300">
                  {easySolved}/{easyTotal}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pr-4">
                <span className="flex items-center gap-1.5 font-bold text-amber-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Med
                </span>
                <span className="font-mono text-zinc-300">
                  {medSolved}/{medTotal}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pr-4">
                <span className="flex items-center gap-1.5 font-bold text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Hard
                </span>
                <span className="font-mono text-zinc-300">
                  {hardSolved}/{hardTotal}
                </span>
              </div>
            </div>
          </div>
          <CircularProgress solved={totalSolved} total={totalDsa} />
        </div>

        {/* Streak Calendar Card */}
        <div className="shrink-0">
          <StreakCalendar submissions={submissionsQuery.data?.submissions || []} />
        </div>

        {/* Small Leaderboard Card */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <SmallLeaderboard
            entries={leaderboardQuery.data || []}
            myRank={userRankQuery.data}
          />
        </div>
      </div>
    </div>
  );
}

// ─── GUEST LANDING PAGE VIEW ──────────────────────────────────────────────────
function LandingPage() {
  return <MonochromeLanding />;
}

// ─── MAIN EXPORT / ROUTER ───────────────────────────────────────────────────────
export default function HomePage() {
  const { isAuthenticated, initialized } = useAuthStore();

  if (!initialized) {
    return <AppRouteSkeleton />;
  }

  if (isAuthenticated) {
    return (
      <MainLayout>
        <DashboardView />
      </MainLayout>
    );
  }

  return <LandingPage />;
}