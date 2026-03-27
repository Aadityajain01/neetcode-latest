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

// ── Podium Card for Top 3 (no box border) ──
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
      size: 'h-24 w-24 md:h-28 md:w-28',
      ring: 'ring-amber-400 ring-4',
      badge: '🥇',
      badgeBg: 'bg-amber-500',
      order: 'order-2',
      height: 'pt-0',
      scoreColor: 'text-amber-400',
      nameColor: 'text-amber-300',
    },
    2: {
      size: 'h-20 w-20 md:h-24 md:w-24',
      ring: 'ring-slate-300 ring-[3px]',
      badge: '🥈',
      badgeBg: 'bg-slate-400',
      order: 'order-1',
      height: 'pt-8',
      scoreColor: 'text-slate-300',
      nameColor: 'text-slate-200',
    },
    3: {
      size: 'h-20 w-20 md:h-24 md:w-24',
      ring: 'ring-amber-700 ring-[3px]',
      badge: '🥉',
      badgeBg: 'bg-amber-700',
      order: 'order-3',
      height: 'pt-8',
      scoreColor: 'text-amber-600',
      nameColor: 'text-amber-700',
    },
  }[position];

  return (
    <Link href={`/profile/${entry.userId}`} className={cn('block flex-1 max-w-[200px]', config.order)}>
      <div className={cn('group flex flex-col items-center text-center transition-all duration-300 hover:scale-105', config.height)}>
        {/* Avatar */}
        <div className="relative mb-3">
          <Avatar className={cn(config.size, config.ring, 'ring-offset-2 ring-offset-zinc-950 shadow-2xl transition-transform group-hover:scale-105')}>
            <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
            <AvatarFallback className={cn('font-bold text-xl flex items-center justify-center h-full w-full rounded-full', isMe ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-300')}>
              {(entry.displayName || '??').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className={cn('absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full shadow-lg text-sm', config.badgeBg)}>
            {config.badge}
          </div>
        </div>

        {/* Name */}
        <p className={cn('font-semibold text-sm md:text-base truncate max-w-[120px] mt-1', isMe ? 'text-emerald-400' : config.nameColor)}>
          {entry.displayName}
        </p>
        {isMe && <span className="text-[9px] uppercase tracking-wider text-emerald-500/70 font-bold">You</span>}

        {/* Borderless score pill */}
        <div className="mt-3 px-5 py-3 rounded-2xl backdrop-blur-sm bg-white/5">
          <p className={cn('text-2xl md:text-3xl font-black', config.scoreColor)}>{entry.score}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Points</p>
        </div>
      </div>
    </Link>
  );
}

// ── List Row for Rank 4+ ──
function LeaderboardRow({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  return (
    <Link href={`/profile/${entry.userId}`} className="block">
      <div className={cn(
        'group grid grid-cols-12 gap-4 px-5 py-3.5 items-center rounded-xl transition-all duration-150 cursor-pointer',
        isMe ? 'bg-emerald-500/10 ring-1 ring-emerald-500/25' : 'hover:bg-white/[0.03]'
      )}>
        {/* Rank */}
        <div className="col-span-1 flex justify-center">
          <span className={cn('font-mono text-sm font-semibold', isMe ? 'text-emerald-400' : 'text-zinc-500')}>
            {entry.rank}
          </span>
        </div>

        {/* User */}
        <div className="col-span-8 flex items-center gap-3">
          <Avatar className={cn('h-8 w-8 ring-2 ring-offset-2 ring-offset-zinc-950', isMe ? 'ring-emerald-500/30' : 'ring-zinc-800')}>
            <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
            <AvatarFallback className={cn('font-bold text-xs rounded-full', isMe ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400')}>
              {(entry.displayName || '??').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className={cn('text-sm font-medium truncate', isMe ? 'text-emerald-400' : 'text-zinc-300 group-hover:text-white')}>
            {entry.displayName}{isMe && ' (You)'}
          </span>
        </div>

        {/* Score */}
        <div className="col-span-3 text-right">
          <span className={cn('font-mono font-semibold text-sm', isMe ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-200')}>
            {entry.score}
          </span>
          <span className="text-[10px] text-zinc-600 block">pts</span>
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
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">

          {/* ── Header: Title + Scope Dropdown ── */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Trophy className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Leaderboard</h1>
                <p className="text-zinc-500 text-xs mt-0.5">See where you stand in the community</p>
              </div>
            </div>

            {/* Dropdown top-right */}
            <ScopeDropdown
              activeTab={activeTab}
              setActiveTab={(id) => { setActiveTab(id); setListPage(0); }}
              communities={communities}
            />
          </div>

          {rankingsQuery.isLoading ? (
            <LeaderboardPageSkeleton />
          ) : leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-600 gap-3">
              <Users className="h-12 w-12 opacity-20" />
              <p className="text-sm">No rankings found yet.</p>
            </div>
          ) : (
            <>
              {/* ── Podium (Top 3) — no outer border ── */}
              {top3.length > 0 && (
                <div className="relative mb-10">
                  {/* Ambient glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-3xl pointer-events-none" />
                  <div className="flex items-end justify-center gap-3 md:gap-8 pt-8 pb-6">
                    {top3[1] && <PodiumCard entry={top3[1]} position={2} isMe={top3[1].userId === user?.id} />}
                    {top3[0] && <PodiumCard entry={top3[0]} position={1} isMe={top3[0].userId === user?.id} />}
                    {top3[2] && <PodiumCard entry={top3[2]} position={3} isMe={top3[2].userId === user?.id} />}
                  </div>
                </div>
              )}

              {/* ── Divider ── */}
              {allRest.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-zinc-800/60" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Rankings</span>
                  <div className="h-px flex-1 bg-zinc-800/60" />
                </div>
              )}

              {/* ── List Table ── */}
              {pagedList.length > 0 && (
                <div className="rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm">
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[10px] font-bold text-zinc-600 uppercase tracking-wider border-b border-zinc-800/50">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-8">Developer</div>
                    <div className="col-span-3 text-right">Score</div>
                  </div>

                  <div className="divide-y divide-zinc-800/30">
                    {pagedList.map((entry) => (
                      <LeaderboardRow key={entry.userId} entry={entry} isMe={entry.userId === user?.id} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                  <button
                    onClick={() => setListPage((p) => Math.max(0, p - 1))}
                    disabled={listPage === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>

                  <span className="text-xs text-zinc-600 font-mono">
                    Page {listPage + 1} of {totalPages}
                  </span>

                  <button
                    onClick={() => setListPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={listPage >= totalPages - 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ── User row at bottom if not visible in current page ── */}
              {!isMeInTop3 && !isMeInPagedList && myStats && user && (
                <div className="mt-4">
                  <div className="flex justify-center mb-2">
                    <div className="inline-flex items-center gap-1.5 text-zinc-700 text-xs">
                      <span className="h-1 w-1 rounded-full bg-zinc-700" />
                      <span className="h-1 w-1 rounded-full bg-zinc-700" />
                      <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-900/20">
                    <LeaderboardRow
                      entry={{ userId: user.id, displayName: user.displayName || 'You', avatarUrl: (user as any).avatarUrl, score: myStats.score, rank: myStats.rank }}
                      isMe={true}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}