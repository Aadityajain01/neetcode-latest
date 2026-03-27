'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { leaderboardApi, userApi, LeaderboardEntry } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { Trophy, Globe, Users, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeaderboardPageSkeleton } from '@/components/skeletons/site-skeletons';

interface CommunityOption {
  id: string;
  name: string;
}

const PAGE_SIZE = 7;

// ── Podium Card for Top 3 (Compact) ──
function PodiumCard({
  entry,
  position,
  isMe,
}: {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
  isMe: boolean;
}) {
  const config = {
    1: {
      size: 'h-16 w-16 md:h-20 md:w-20',
      ring: 'ring-amber-400 ring-4',
      badge: '🥇',
      badgeBg: 'bg-gradient-to-br from-amber-300 to-amber-600 shadow-amber-500/50',
      order: 'order-2 z-10',
      height: 'md:-translate-y-6',
      scoreColor: 'text-amber-400',
      nameColor: 'text-amber-300',
      glow: 'shadow-[0_0_30px_rgba(251,191,36,0.15)]',
    },
    2: {
      size: 'h-14 w-14 md:h-16 md:w-16',
      ring: 'ring-slate-300 ring-[3px]',
      badge: '🥈',
      badgeBg: 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-400/50',
      order: 'order-1',
      height: '',
      scoreColor: 'text-slate-300',
      nameColor: 'text-slate-200',
      glow: 'shadow-[0_0_20px_rgba(148,163,184,0.1)]',
    },
    3: {
      size: 'h-14 w-14 md:h-16 md:w-16',
      ring: 'ring-amber-700/80 ring-[3px]',
      badge: '🥉',
      badgeBg: 'bg-gradient-to-br from-amber-600 to-amber-800 shadow-amber-700/50',
      order: 'order-3',
      height: '',
      scoreColor: 'text-amber-600',
      nameColor: 'text-amber-700',
      glow: 'shadow-[0_0_20px_rgba(180,83,9,0.15)]',
    },
  }[position];

  return (
    <Link href={`/profile/${entry.userId}`} className={cn('block flex-1 max-w-[160px]', config.order)}>
      <div className={cn('group relative flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 p-4 md:p-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/60 hover:border-zinc-700/50 backdrop-blur-md', config.glow, config.height)}>
        <div className={cn("absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500", `bg-${config.scoreColor.split('-')[1]}-500`)} />
        
        <div className="relative mb-3">
          <Avatar className={cn(config.size, config.ring, 'ring-offset-2 ring-offset-zinc-900 shadow-xl transition-transform group-hover:scale-105')}>
            <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
            <AvatarFallback className={cn('font-bold text-lg md:text-xl flex items-center justify-center h-full w-full rounded-full', isMe ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-300')}>
              {(entry.displayName || '??').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className={cn('absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full shadow-xl text-xs md:text-sm border border-white/20', config.badgeBg)}>
            {config.badge}
          </div>
        </div>

        <p className={cn('font-bold text-sm md:text-base truncate max-w-full mt-1 relative z-10', isMe ? 'text-emerald-400' : config.nameColor)}>
          {entry.displayName}
        </p>

        <div className="mt-3 px-3 py-1.5 rounded-xl bg-black/20 border border-white/5 shadow-inner relative z-10 w-full group-hover:bg-black/30 transition-colors">
          <p className={cn('text-lg md:text-2xl font-black tracking-tighter leading-none', config.scoreColor)}>{entry.score}</p>
          <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5 font-bold">Points</p>
        </div>
      </div>
    </Link>
  );
}

// ── List Row for Rank 4+ (Compact) ──
function LeaderboardRow({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  return (
    <Link href={`/profile/${entry.userId}`} className="block">
      <div className={cn(
        'group grid grid-cols-12 gap-3 px-4 md:px-5 py-3 items-center transition-all duration-200 cursor-pointer overflow-hidden relative',
        isMe ? 'bg-emerald-500/10' : 'hover:bg-zinc-800/40'
      )}>
        {isMe && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}
        
        <div className="col-span-2 md:col-span-1 flex items-center justify-center">
          <div className={cn(
            'flex items-center justify-center h-7 w-7 rounded-full font-mono text-xs font-bold',
            isMe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800/50 text-zinc-500 group-hover:text-zinc-300 group-hover:bg-zinc-700/50'
          )}>
            {entry.rank}
          </div>
        </div>

        <div className="col-span-7 md:col-span-8 flex items-center gap-3">
          <Avatar className={cn('h-8 w-8 md:h-10 md:w-10 shadow-sm transition-transform group-hover:scale-105', isMe ? 'ring-2 ring-emerald-500/50 ring-offset-1 ring-offset-zinc-900' : 'border border-zinc-700')}>
            <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
            <AvatarFallback className={cn('font-bold text-xs rounded-full', isMe ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400')}>
              {(entry.displayName || '??').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className={cn('text-sm font-bold truncate transition-colors leading-tight', isMe ? 'text-emerald-400' : 'text-zinc-200 group-hover:text-white')}>
              {entry.displayName} {isMe && <span className="opacity-70">(You)</span>}
            </span>
          </div>
        </div>

        <div className="col-span-3 md:col-span-3 text-right flex items-center justify-end gap-1.5">
          <span className={cn('font-mono font-black text-sm md:text-base tracking-tight', isMe ? 'text-emerald-400' : 'text-zinc-300 group-hover:text-white')}>
            {entry.score}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest hidden sm:inline-block mt-0.5">pts</span>
        </div>
      </div>
    </Link>
  );
}

// ── Community Scope Dropdown ──
function ScopeDropdown({
  activeTab,
  setActiveTab,
  communities,
}: {
  activeTab: string;
  setActiveTab: (id: string) => void;
  communities: CommunityOption[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeName =
    activeTab === 'global' ? 'Global' : communities.find((c) => c.id === activeTab)?.name || 'Global';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-sm text-zinc-200 hover:bg-zinc-700/80 transition-all backdrop-blur-sm"
      >
        {activeTab === 'global' ? <Globe className="h-4 w-4 text-emerald-400" /> : <Users className="h-4 w-4 text-zinc-400" />}
        <span className="max-w-[140px] truncate font-medium">{activeName}</span>
        <ChevronDown className={cn('h-4 w-4 text-zinc-500 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 backdrop-blur-xl">
          <div className="p-1.5">
            <button
              onClick={() => { setActiveTab('global'); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                activeTab === 'global' ? 'bg-emerald-500 text-white font-semibold' : 'text-zinc-300 hover:bg-zinc-800'
              )}
            >
              <Globe className="h-4 w-4" /> Global
            </button>

            {communities.length > 0 && (
              <>
                <div className="h-px bg-zinc-800 my-1.5 mx-2" />
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest px-3 py-1 font-semibold">Communities</p>
                {communities.map((comm) => (
                  <button
                    key={comm.id}
                    onClick={() => { setActiveTab(comm.id); setOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all truncate',
                      activeTab === comm.id ? 'bg-zinc-700 text-emerald-400 font-semibold' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    )}
                  >
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="truncate">{comm.name}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<string>('global');
  const [listPage, setListPage] = useState(0); // 0-indexed page for rank 4+ list
  const isAuthReady = initialized && !authLoading;

  // Reset page when tab changes
  useEffect(() => { setListPage(0); }, [activeTab]);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated) router.push('/login');
  }, [isAuthReady, isAuthenticated, router]);

  const communitiesQuery = useQuery<CommunityOption[]>({
    queryKey: ['leaderboard-communities', user?.id],
    enabled: isAuthReady && isAuthenticated,
    queryFn: async () => {
      const myCommunities = await userApi.getCommunities(user?.id);
      return (myCommunities || []).map((c: any) => ({ id: c.id || c._id, name: c.name }));
    },
  });

  const rankingsQuery = useQuery<{
    leaderboard: LeaderboardEntry[];
    myStats: { rank: number; score: number } | null;
  }>({
    queryKey: ['leaderboard-rankings', user?.id, activeTab],
    enabled: isAuthReady && isAuthenticated,
    queryFn: async () => {
      if (activeTab === 'global') {
        // Global: Redis DSA score-based ranking
        const [data, stats] = await Promise.all([
          leaderboardApi.getGlobal({ limit: 50 }),
          leaderboardApi.getGlobalMe().catch(() => null),
        ]);
        const processed = (data || []).filter(
          (entry) => entry.score > 0 && entry.displayName && entry.displayName !== 'Anonymous' && entry.displayName !== 'admin'
        );
        const reRanked = processed.map((entry, index) => ({ ...entry, rank: index + 1 }));
        const myEntryInList = reRanked.find((entry) => entry.userId === user?.id);
        const myStats = myEntryInList
          ? { rank: myEntryInList.rank, score: myEntryInList.score }
          : stats ? { rank: stats.rank, score: stats.score } : null;
        return { leaderboard: reRanked, myStats };
      } else {
        // Community: Test average score-based ranking (actual community performance)
        const [data, me] = await Promise.all([
          leaderboardApi.getCommunityAverageLeaderboard(activeTab, { limit: 100 }),
          leaderboardApi.getCommunityAverageMe(activeTab).catch(() => null),
        ]);
        const list = (data.leaderboard || []).filter(
          (entry) => entry.displayName && entry.displayName !== 'Anonymous' && entry.displayName !== 'admin'
        );
        const reRanked = list.map((entry, index) => ({ ...entry, rank: index + 1 }));
        const myEntryInList = reRanked.find((entry) => entry.userId === user?.id);
        const myStats = myEntryInList
          ? { rank: myEntryInList.rank, score: myEntryInList.score }
          : me ? { rank: me.rank, score: me.averageScore } : null;
        return { leaderboard: reRanked, myStats };
      }
    },
  });

  useEffect(() => { if (communitiesQuery.error) toast.error('Failed to load community filters'); }, [communitiesQuery.error]);
  useEffect(() => { if (rankingsQuery.error) toast.error('Could not load rankings'); }, [rankingsQuery.error]);

  const communities = communitiesQuery.data || [];
  const leaderboard = rankingsQuery.data?.leaderboard || [];
  const myStats = rankingsQuery.data?.myStats || null;

  const top3 = leaderboard.slice(0, 3);
  const allRest = leaderboard.slice(3); // rank 4+ full list (already fetched)
  const totalPages = Math.ceil(allRest.length / PAGE_SIZE);
  const pagedList = allRest.slice(listPage * PAGE_SIZE, (listPage + 1) * PAGE_SIZE);

  const isMeInTop3 = useMemo(() => top3.some((e) => e.userId === user?.id), [top3, user]);
  const isMeInPagedList = useMemo(() => pagedList.some((e) => e.userId === user?.id), [pagedList, user]);

  if (!isAuthReady || (isAuthenticated && communitiesQuery.isLoading)) {
    return (
      <MainLayout>
        <LeaderboardPageSkeleton />
      </MainLayout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-80px)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 relative overflow-hidden flex flex-col items-center pb-10">
        {/* Premium Background Elements */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="fixed -top-[500px] left-[50%] -translate-x-1/2 w-[1000px] h-[500px] opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none blur-3xl" />
        
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8 relative z-10 flex flex-col h-full">

          {/* ── Header: Title + Scope Dropdown ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 lg:mb-12 shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <Trophy className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">Leaderboard</h1>
              </div>
            </div>

            {/* Dropdown top-right */}
            <div className="shadow-lg shadow-black/20 rounded-xl shrink-0">
              <ScopeDropdown
                activeTab={activeTab}
                setActiveTab={(id) => { setActiveTab(id); setListPage(0); }}
                communities={communities}
              />
            </div>
          </div>

          {rankingsQuery.isLoading ? (
            <LeaderboardPageSkeleton />
          ) : leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-600 gap-4 border border-dashed border-zinc-800/80 rounded-3xl bg-zinc-900/10 backdrop-blur-sm w-full">
              <Users className="h-16 w-16 opacity-20" />
              <p className="text-base font-medium">No rankings found yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-1 items-start w-full">
              
              {/* ── 5/12 Left Side: Podium ── */}
              <div className="lg:col-span-5 flex flex-col justify-center items-center w-full">
                {top3.length > 0 ? (
                  <div className="w-full max-w-lg mx-auto">
                    <div className="text-center mb-8 lg:mb-12">
                      <h2 className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-xs">Hall of Fame</h2>
                      <p className="text-zinc-500 text-sm mt-1">Top developers in this scope</p>
                    </div>

                    <div className="flex items-end justify-center gap-3 md:gap-5 w-full relative">
                      {top3[1] && <PodiumCard entry={top3[1]} position={2} isMe={top3[1].userId === user?.id} />}
                      {top3[0] && <PodiumCard entry={top3[0]} position={1} isMe={top3[0].userId === user?.id} />}
                      {top3[2] && <PodiumCard entry={top3[2]} position={3} isMe={top3[2].userId === user?.id} />}
                    </div>
                  </div>
                ) : (
                  <div className="hidden lg:block text-zinc-600 text-sm text-center">Not enough data for podium</div>
                )}
              </div>

              {/* ── 7/12 Right Side: The Paged List ── */}
              <div className="lg:col-span-7 flex flex-col h-full w-full mx-auto max-w-2xl lg:max-w-none">
                {allRest.length > 0 && (
                  <div className="flex items-center gap-4 w-full mb-5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Rankings 4+</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-zinc-800/80 to-transparent" />
                  </div>
                )}

                {pagedList.length > 0 ? (
                  <div className="flex-1 flex flex-col w-full">
                    <div className="w-full rounded-3xl overflow-hidden border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl shadow-xl shadow-black/40">
                      <div className="divide-y divide-zinc-800/40">
                        {pagedList.map((entry) => (
                          <LeaderboardRow key={entry.userId} entry={entry} isMe={entry.userId === user?.id} />
                        ))}
                      </div>
                    </div>

                    {/* ── Pagination ── */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between w-full pt-5 px-1">
                        <button
                          onClick={() => setListPage((p) => Math.max(0, p - 1))}
                          disabled={listPage === 0}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline-block">Previous</span>
                        </button>

                        <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-1.5 rounded-xl border border-zinc-800/50">
                          <span className="text-sm text-emerald-400 font-bold">{listPage + 1}</span>
                          <span className="text-zinc-600 font-medium text-xs">/</span>
                          <span className="text-sm text-zinc-400 font-bold">{totalPages}</span>
                        </div>

                        <button
                          onClick={() => setListPage((p) => Math.min(totalPages - 1, p + 1))}
                          disabled={listPage >= totalPages - 1}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <span className="hidden sm:inline-block">Next</span> <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-zinc-600 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800/50 w-full flex-1 flex items-center justify-center">
                    No further rankings available.
                  </div>
                )}

                {/* ── User sticky row bottom ── */}
                {!isMeInTop3 && !isMeInPagedList && myStats && user && (
                  <div className="w-full mt-8 pt-4 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-zinc-950 border border-zinc-800/50 shadow-md text-[10px] text-zinc-400 font-bold tracking-widest uppercase rounded-full z-20">Your Rank</div>
                    <div className="rounded-2xl overflow-hidden border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.1)] bg-zinc-900/80 backdrop-blur-md relative z-10">
                      <LeaderboardRow
                        entry={{ userId: user.id, displayName: user.displayName || 'You', avatarUrl: (user as any).avatarUrl, score: myStats.score, rank: myStats.rank }}
                        isMe={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}