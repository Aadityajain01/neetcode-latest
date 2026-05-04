'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { leaderboardApi, userApi, LeaderboardEntry } from '@/lib/api-modules';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { Trophy, Globe, Users, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LeaderboardContentSkeleton } from '@/components/skeletons/inline-skeletons';
import { CustomTrophy } from './custom-trophy';

interface CommunityOption { id: string; name: string; }
const PAGE_SIZE = 9;

function PodiumCard({ entry, position, isMe }: { entry: LeaderboardEntry; position: 1 | 2 | 3; isMe: boolean }) {
  const config = {
    1: { size: 'h-10 w-10 md:h-12 md:w-12', ring: 'ring-amber-400 ring-4', badge: '🥇', badgeBg: 'bg-gradient-to-br from-amber-300 to-amber-600 shadow-amber-500/50', order: 'order-2 z-10', height: 'md:-translate-y-4', scoreColor: 'text-amber-400', nameColor: 'text-amber-300', trophyColor: 'gold', trophySize: 'h-16 w-16 md:h-24 md:w-24 mb-4' },
    2: { size: 'h-8 w-8 md:h-10 md:w-10', ring: 'ring-slate-300 ring-[3px]', badge: '🥈', badgeBg: 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-400/50', order: 'order-1', height: '', scoreColor: 'text-slate-300', nameColor: 'text-slate-200', trophyColor: 'silver', trophySize: 'h-12 w-12 md:h-20 md:w-20 mb-3' },
    3: { size: 'h-8 w-8 md:h-10 md:w-10', ring: 'ring-amber-700/80 ring-[3px]', badge: '🥉', badgeBg: 'bg-gradient-to-br from-amber-600 to-amber-800 shadow-amber-700/50', order: 'order-3', height: '', scoreColor: 'text-amber-600', nameColor: 'text-amber-700', trophyColor: 'bronze', trophySize: 'h-12 w-12 md:h-20 md:w-20 mb-3' },
  }[position];

  const firstName = entry.displayName ? entry.displayName.trim().split(' ')[0] : 'Unknown';

  return (
    <Link href={`/profile/${entry.userId}`} className={cn('block flex-1 max-w-[150px]', config.order)}>
      <div className={cn('group relative flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1', config.height)}>
        <CustomTrophy color={config.trophyColor as 'gold' | 'silver' | 'bronze'} className={cn('drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110 duration-300', config.trophySize)} />

        <div className="relative mb-2">
          <Avatar className={cn(config.size, config.ring, 'ring-offset-2 ring-offset-zinc-900 shadow-xl transition-transform group-hover:scale-105')}>
            <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
            <AvatarFallback className={cn('font-bold text-xs flex items-center justify-center h-full w-full rounded-full', isMe ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-300')}>{(entry.displayName || '??').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className={cn('absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-px rounded-full shadow-xl text-[10px] border border-white/20', config.badgeBg)}>{config.badge}</div>
        </div>

        <div className="mt-1 flex flex-col items-center mb-2">
          <p className={cn('text-lg md:text-xl font-black tracking-tighter leading-none', config.scoreColor)}>{entry.score}</p>
          <p className="text-[8px] text-zinc-500 uppercase tracking-widest mt-0.5 font-bold">Points</p>
        </div>

        <p className={cn('font-bold text-sm md:text-base truncate max-w-full relative z-10', isMe ? 'text-emerald-400' : config.nameColor)}>{firstName}</p>
      </div>
    </Link>
  );
}

function LeaderboardRow({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  return (
    <Link href={`/profile/${entry.userId}`} className="block">
      <div className={cn('group grid grid-cols-12 gap-3 px-4 md:px-5 py-2.5 items-center transition-all duration-200 cursor-pointer overflow-hidden relative', isMe ? 'bg-emerald-500/10' : 'hover:bg-zinc-800/40')}>
        {isMe && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}
        <div className="col-span-2 md:col-span-1 flex items-center justify-center">
          <div className={cn('flex items-center justify-center h-7 w-7 rounded-full font-mono text-xs font-bold', isMe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800/50 text-zinc-500 group-hover:text-zinc-300 group-hover:bg-zinc-700/50')}>{entry.rank}</div>
        </div>
        <div className="col-span-7 md:col-span-8 flex items-center gap-3">
          <Avatar className={cn('h-8 w-8 md:h-9 md:w-9 shadow-sm transition-transform group-hover:scale-105', isMe ? 'ring-2 ring-emerald-500/50 ring-offset-1 ring-offset-zinc-900' : 'border border-zinc-700')}>
            <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
            <AvatarFallback className={cn('font-bold text-xs rounded-full', isMe ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400')}>{(entry.displayName || '??').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className={cn('text-sm font-bold truncate transition-colors leading-tight', isMe ? 'text-emerald-400' : 'text-zinc-200 group-hover:text-white')}>{entry.displayName} {isMe && <span className="opacity-70">(You)</span>}</span>
          </div>
        </div>
        <div className="col-span-3 md:col-span-3 text-right flex items-center justify-end gap-1.5">
          <span className={cn('font-mono font-black text-sm tracking-tight', isMe ? 'text-emerald-400' : 'text-zinc-300 group-hover:text-white')}>{entry.score}</span>
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest hidden sm:inline-block mt-0.5">pts</span>
        </div>
      </div>
    </Link>
  );
}

function ScopeDropdown({ activeTab, setActiveTab, communities }: { activeTab: string; setActiveTab: (id: string) => void; communities: CommunityOption[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const activeName = activeTab === 'global' ? 'Global' : communities.find((c) => c.id === activeTab)?.name || 'Global';

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-sm text-zinc-200 hover:bg-zinc-700/80 transition-all backdrop-blur-sm">
        {activeTab === 'global' ? <Globe className="h-4 w-4 text-emerald-400" /> : <Users className="h-4 w-4 text-zinc-400" />}
        <span className="max-w-[140px] truncate font-medium">{activeName}</span>
        <ChevronDown className={cn('h-4 w-4 text-zinc-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 backdrop-blur-xl">
          <div className="p-1.5">
            <button onClick={() => { setActiveTab('global'); setOpen(false); }} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all', activeTab === 'global' ? 'bg-emerald-500 text-white font-semibold' : 'text-zinc-300 hover:bg-zinc-800')}><Globe className="h-4 w-4" /> Global</button>
            {communities.length > 0 && (
              <>
                <div className="h-px bg-zinc-800 my-1.5 mx-2" />
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest px-3 py-1 font-semibold">Communities</p>
                {communities.map((comm) => (
                  <button key={comm.id} onClick={() => { setActiveTab(comm.id); setOpen(false); }} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all truncate', activeTab === comm.id ? 'bg-zinc-700 text-emerald-400 font-semibold' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200')}>
                    <Users className="h-4 w-4 shrink-0" /><span className="truncate">{comm.name}</span>
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
  const [listPage, setListPage] = useState(0);
  const isAuthReady = initialized && !authLoading;

  useEffect(() => { setListPage(0); }, [activeTab]);
  useEffect(() => { if (!isAuthReady) return; if (!isAuthenticated) router.push('/login'); }, [isAuthReady, isAuthenticated, router]);

  const communitiesQuery = useQuery<CommunityOption[]>({
    queryKey: ['leaderboard-communities', user?.id], enabled: isAuthReady && isAuthenticated,
    queryFn: async () => { const myCommunities = await userApi.getCommunities(user?.id); return (myCommunities || []).map((c: any) => ({ id: c.id || c._id, name: c.name })); },
  });

  const rankingsQuery = useQuery<{ leaderboard: LeaderboardEntry[]; myStats: { rank: number; score: number } | null }>({
    queryKey: ['leaderboard-rankings', user?.id, activeTab], enabled: isAuthReady && isAuthenticated,
    queryFn: async () => {
      if (activeTab === 'global') {
        const [data, stats] = await Promise.all([leaderboardApi.getGlobal({ limit: 50 }), leaderboardApi.getGlobalMe().catch(() => null)]);
        const processed = (data || []).filter((entry) => entry.score > 0 && entry.displayName && entry.displayName !== 'Anonymous' && entry.displayName !== 'admin');
        const reRanked = processed.map((entry, index) => ({ ...entry, rank: index + 1 }));
        const myEntryInList = reRanked.find((entry) => entry.userId === user?.id);
        const myStats = myEntryInList ? { rank: myEntryInList.rank, score: myEntryInList.score } : stats ? { rank: stats.rank, score: stats.score } : null;
        return { leaderboard: reRanked, myStats };
      } else {
        const [data, me] = await Promise.all([leaderboardApi.getCommunityAverageLeaderboard(activeTab, { limit: 100 }), leaderboardApi.getCommunityAverageMe(activeTab).catch(() => null)]);
        const list = (data.leaderboard || []).filter((entry) => entry.displayName && entry.displayName !== 'Anonymous' && entry.displayName !== 'admin');
        const reRanked = list.map((entry, index) => ({ ...entry, rank: index + 1 }));
        const myEntryInList = reRanked.find((entry) => entry.userId === user?.id);
        const myStats = myEntryInList ? { rank: myEntryInList.rank, score: myEntryInList.score } : me ? { rank: me.rank, score: me.averageScore } : null;
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
  const allRest = leaderboard.slice(3);
  const totalPages = Math.ceil(allRest.length / PAGE_SIZE);
  const pagedList = allRest.slice(listPage * PAGE_SIZE, (listPage + 1) * PAGE_SIZE);
  const isMeInTop3 = useMemo(() => top3.some((e) => e.userId === user?.id), [top3, user]);
  const isMeInPagedList = useMemo(() => pagedList.some((e) => e.userId === user?.id), [pagedList, user]);

  if (!isAuthReady) return null;
  if (!isAuthenticated) return null;

  return (
    <>
      <div className="h-auto lg:h-full overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 relative flex flex-col items-center">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-5 relative z-10 flex flex-col lg:h-full min-h-0 overflow-visible lg:overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"><Trophy className="h-5 w-5 text-emerald-400" /></div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">Leaderboard</h1>
            </div>
            <div className="shadow-lg shadow-black/20 rounded-xl shrink-0">
              <ScopeDropdown activeTab={activeTab} setActiveTab={(id) => { setActiveTab(id); setListPage(0); }} communities={communities} />
            </div>
          </div>

          {(rankingsQuery.isLoading || communitiesQuery.isLoading) ? (
            <LeaderboardContentSkeleton />
          ) : leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-4 border border-dashed border-zinc-800/80 rounded-3xl bg-zinc-900/10 backdrop-blur-sm w-full">
              <Users className="h-16 w-16 opacity-20" /><p className="text-base font-medium">No rankings found yet.</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 overflow-visible lg:overflow-hidden w-full">
              {/* Podium */}
              <div className="lg:col-span-5 flex flex-col justify-center items-center w-full shrink-0 lg:shrink lg:min-h-0">
                {top3.length > 0 ? (
                  <div className="w-full max-w-lg mx-auto">
                    <div className="text-center mb-4 lg:mb-6">
                      <h2 className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-xs">Hall of Fame</h2>
                      <p className="text-zinc-500 text-sm mt-1">Top developers in this scope</p>
                    </div>
                    <div className="flex items-end justify-center gap-3 md:gap-4 w-full relative">
                      {top3[1] && <PodiumCard entry={top3[1]} position={2} isMe={top3[1].userId === user?.id} />}
                      {top3[0] && <PodiumCard entry={top3[0]} position={1} isMe={top3[0].userId === user?.id} />}
                      {top3[2] && <PodiumCard entry={top3[2]} position={3} isMe={top3[2].userId === user?.id} />}
                    </div>
                  </div>
                ) : (
                  <div className="hidden lg:block text-zinc-600 text-sm text-center">Not enough data for podium</div>
                )}
              </div>

              {/* Rankings List */}
              <div className="lg:col-span-7 flex flex-col min-h-0 w-full mx-auto max-w-2xl lg:max-w-none overflow-hidden">
                {allRest.length > 0 && (
                  <div className="flex items-center gap-4 w-full mb-3 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Rankings 4+</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-zinc-800/80 to-transparent" />
                  </div>
                )}
                {pagedList.length > 0 ? (
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="w-full rounded-3xl overflow-hidden border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl shadow-xl shadow-black/40 flex-1 min-h-0 flex flex-col">
                      <div className="divide-y divide-zinc-800/40 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                        {pagedList.map((entry) => (<LeaderboardRow key={entry.userId} entry={entry} isMe={entry.userId === user?.id} />))}
                      </div>
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between w-full pt-3 px-1 shrink-0">
                        <button onClick={() => setListPage((p) => Math.max(0, p - 1))} disabled={listPage === 0} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                          <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline-block">Previous</span>
                        </button>
                        <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-1.5 rounded-xl border border-zinc-800/50">
                          <span className="text-sm text-emerald-400 font-bold">{listPage + 1}</span>
                          <span className="text-zinc-600 font-medium text-xs">/</span>
                          <span className="text-sm text-zinc-400 font-bold">{totalPages}</span>
                        </div>
                        <button onClick={() => setListPage((p) => Math.min(totalPages - 1, p + 1))} disabled={listPage >= totalPages - 1} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                          <span className="hidden sm:inline-block">Next</span> <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-zinc-600 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800/50 w-full flex-1 flex items-center justify-center">No further rankings available.</div>
                )}
                {/* User sticky row */}
                {!isMeInTop3 && !isMeInPagedList && myStats && user && (
                  <div className="w-full mt-4 pt-3 relative shrink-0">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-zinc-950 border border-zinc-800/50 shadow-md text-[10px] text-zinc-400 font-bold tracking-widest uppercase rounded-full z-20">Your Rank</div>
                    <div className="rounded-2xl overflow-hidden border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.1)] bg-zinc-900/80 backdrop-blur-md relative z-10">
                      <LeaderboardRow entry={{ userId: user.id, displayName: user.displayName || 'You', avatarUrl: (user as any).avatarUrl, score: myStats.score, rank: myStats.rank }} isMe={true} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}