"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useCommunity } from "@/components/communities/CommunityContext";
import { leaderboardApi, LeaderboardEntry, CommunityAverageLeaderboardMe } from "@/lib/api-modules";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Trophy, Users, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TABLE_PAGE_SIZE = 7;

// ── Podium Card ──
function PodiumCard({ entry, position, isMe }: { entry: LeaderboardEntry; position: 1 | 2 | 3; isMe: boolean }) {
  const config = {
    1: {
      size: "h-14 w-14 md:h-18 md:w-18",
      ring: "ring-amber-400 ring-4",
      badge: "🥇",
      badgeBg: "bg-gradient-to-br from-amber-300 to-amber-600 shadow-amber-500/50",
      order: "order-2 z-10",
      height: "md:-translate-y-4",
      scoreColor: "text-amber-400",
      nameColor: "text-amber-300",
      glow: "shadow-[0_0_30px_rgba(251,191,36,0.15)]",
    },
    2: {
      size: "h-12 w-12 md:h-14 md:w-14",
      ring: "ring-slate-300 ring-[3px]",
      badge: "🥈",
      badgeBg: "bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-400/50",
      order: "order-1",
      height: "",
      scoreColor: "text-slate-300",
      nameColor: "text-slate-200",
      glow: "shadow-[0_0_20px_rgba(148,163,184,0.1)]",
    },
    3: {
      size: "h-12 w-12 md:h-14 md:w-14",
      ring: "ring-amber-700/80 ring-[3px]",
      badge: "🥉",
      badgeBg: "bg-gradient-to-br from-amber-600 to-amber-800 shadow-amber-700/50",
      order: "order-3",
      height: "",
      scoreColor: "text-amber-600",
      nameColor: "text-amber-700",
      glow: "shadow-[0_0_20px_rgba(180,83,9,0.15)]",
    },
  }[position];

  return (
    <Link href={`/profile/${entry.userId}`} className={cn("block flex-1 max-w-[150px]", config.order)}>
      <div className={cn("group relative flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 p-3 md:p-4 rounded-3xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/60 hover:border-zinc-700/50 backdrop-blur-md", config.glow, config.height)}>
        <div className="relative mb-2">
          <Avatar className={cn(config.size, config.ring, "ring-offset-2 ring-offset-zinc-900 shadow-xl transition-transform group-hover:scale-105")}>
            <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
            <AvatarFallback className={cn("font-bold text-base flex items-center justify-center h-full w-full rounded-full", isMe ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-300")}>
              {(entry.displayName || "??").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className={cn("absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full shadow-xl text-xs border border-white/20", config.badgeBg)}>
            {config.badge}
          </div>
        </div>
        <p className={cn("font-bold text-sm truncate max-w-full mt-1 relative z-10", isMe ? "text-emerald-400" : config.nameColor)}>{entry.displayName}</p>
        <div className="mt-2 px-3 py-1 rounded-xl bg-black/20 border border-white/5 shadow-inner relative z-10 w-full group-hover:bg-black/30 transition-colors">
          <p className={cn("text-lg md:text-xl font-black tracking-tighter leading-none", config.scoreColor)}>{entry.score}</p>
          <p className="text-[8px] text-zinc-500 uppercase tracking-widest mt-0.5 font-bold">Avg Score</p>
        </div>
      </div>
    </Link>
  );
}

// ── List Row ──
function LeaderboardRow({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  return (
    <Link href={`/profile/${entry.userId}`} className="block">
      <div className={cn("group grid grid-cols-12 gap-3 px-4 md:px-5 py-2.5 items-center transition-all duration-200 cursor-pointer overflow-hidden relative", isMe ? "bg-emerald-500/10" : "hover:bg-zinc-800/40")}>
        {isMe && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}
        <div className="col-span-2 md:col-span-1 flex items-center justify-center">
          <div className={cn("flex items-center justify-center h-7 w-7 rounded-full font-mono text-xs font-bold", isMe ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800/50 text-zinc-500 group-hover:text-zinc-300 group-hover:bg-zinc-700/50")}>{entry.rank}</div>
        </div>
        <div className="col-span-7 md:col-span-8 flex items-center gap-3">
          <Avatar className={cn("h-8 w-8 md:h-9 md:w-9 shadow-sm transition-transform group-hover:scale-105", isMe ? "ring-2 ring-emerald-500/50 ring-offset-1 ring-offset-zinc-900" : "border border-zinc-700")}>
            <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
            <AvatarFallback className={cn("font-bold text-xs rounded-full", isMe ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400")}>
              {(entry.displayName || "??").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className={cn("text-sm font-bold truncate transition-colors leading-tight", isMe ? "text-emerald-400" : "text-zinc-200 group-hover:text-white")}>{entry.displayName} {isMe && <span className="opacity-70">(You)</span>}</span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{entry.testCount ?? 0} tests</span>
          </div>
        </div>
        <div className="col-span-3 md:col-span-3 text-right flex items-center justify-end gap-1.5">
          <span className={cn("font-mono font-black text-sm tracking-tight", isMe ? "text-emerald-400" : "text-zinc-300 group-hover:text-white")}>{entry.score}</span>
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest hidden sm:inline-block mt-0.5">avg</span>
        </div>
      </div>
    </Link>
  );
}

export default function CommunityLeaderboardPage() {
  const { community } = useCommunity();

  // ── State: podium (always top 3) ──
  const [top3, setTop3] = useState<LeaderboardEntry[]>([]);
  const [podiumLoading, setPodiumLoading] = useState(true);

  // ── State: rankings table (offset=3, paginated) ──
  const [tableEntries, setTableEntries] = useState<LeaderboardEntry[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tablePage, setTablePage] = useState(1);
  const [totalBeyondTop3, setTotalBeyondTop3] = useState(0);

  // ── Shared state ──
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [summary, setSummary] = useState<{ participants: number; testsConsidered: number }>({ participants: 0, testsConsidered: 0 });
  const [myStats, setMyStats] = useState<(CommunityAverageLeaderboardMe & { displayName: string; avatarUrl?: string }) | null>(null);

  // ── Fetch the fixed top 3 podium ──
  const fetchPodium = useCallback(async () => {
    if (!community?._id) return;
    setPodiumLoading(true);
    try {
      const [data, me] = await Promise.all([
        leaderboardApi.getCommunityAverageLeaderboard(community._id, { years: selectedYears, limit: 3, offset: 0 }),
        leaderboardApi.getCommunityAverageMe(community._id, { years: selectedYears }).catch(() => null),
      ]);
      const list = data.leaderboard || [];
      setTop3(list);
      setAvailableYears(data.availableYears || []);
      setSummary(data.summary || { participants: 0, testsConsidered: 0 });
      if (me) {
        const myEntry = list.find((e) => e.userId === me.userId);
        setMyStats({ ...me, displayName: myEntry?.displayName || "You", avatarUrl: myEntry?.avatarUrl });
      } else {
        setMyStats(null);
      }
    } catch {
      setTop3([]);
      toast.error("Unable to load leaderboard");
    } finally {
      setPodiumLoading(false);
    }
  }, [community?._id, selectedYears]);

  // ── Fetch the paginated rankings table (rank 4 onwards) ──
  const fetchTable = useCallback(async (page: number) => {
    if (!community?._id) return;
    setTableLoading(true);
    const offset = 3 + (page - 1) * TABLE_PAGE_SIZE;
    try {
      const data = await leaderboardApi.getCommunityAverageLeaderboard(community._id, {
        years: selectedYears,
        limit: TABLE_PAGE_SIZE,
        offset,
      });
      setTableEntries(data.leaderboard || []);
      // total beyond top 3
      const fullTotal = data.total ?? data.summary?.participants ?? 0;
      setTotalBeyondTop3(Math.max(0, fullTotal - 3));
      // update available years if changed
      if (data.availableYears?.length) setAvailableYears(data.availableYears);
      if (data.summary) setSummary(data.summary);
    } catch {
      setTableEntries([]);
      toast.error("Unable to load rankings");
    } finally {
      setTableLoading(false);
    }
  }, [community?._id, selectedYears]);

  // When years filter changes → reset everything
  useEffect(() => {
    setTablePage(1);
    fetchPodium();
    fetchTable(1);
  }, [community?._id, selectedYears]); // eslint-disable-line react-hooks/exhaustive-deps

  // When table page changes → only fetch table
  useEffect(() => {
    fetchTable(tablePage);
  }, [tablePage]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalTablePages = Math.max(1, Math.ceil(totalBeyondTop3 / TABLE_PAGE_SIZE));

  const isMeInTop3 = top3.some((e) => e.userId === myStats?.userId);
  const isMeInTable = tableEntries.some((e) => e.userId === myStats?.userId);

  const toggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year].sort((a, b) => a - b)
    );
  };

  const isInitialLoading = podiumLoading && tableLoading;

  return (
    <div className="h-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 relative flex flex-col items-center">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 md:py-5 relative z-10 flex flex-col h-full min-h-0 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <Trophy className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm truncate">Community Leaderboard</h1>
              <p className="text-zinc-500 text-xs mt-1 truncate">{community?.name || "Community"} • Ranked by average test score</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/60 border border-zinc-700/40 text-xs text-zinc-400">
              <Users className="h-3.5 w-3.5" />
              <span className="font-semibold text-zinc-200">{summary.participants}</span> members
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-zinc-800/60 border border-zinc-700/40 text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200">{summary.testsConsidered}</span> attempts
            </div>
          </div>
        </div>

        {/* Year Filter */}
        {(availableYears.length > 0 || selectedYears.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mb-4 shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 mr-1">
              <CalendarDays className="h-3.5 w-3.5" /> Filter
            </div>
            <button
              onClick={() => setSelectedYears([])}
              className={cn("h-7 rounded-full px-4 text-xs font-semibold transition-colors", selectedYears.length === 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200")}
            >
              All Time
            </button>
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => toggleYear(year)}
                className={cn("h-7 rounded-full px-4 text-xs font-semibold transition-colors", selectedYears.includes(year) ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200")}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {isInitialLoading ? (
          <div className="flex flex-1 items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : top3.length === 0 && tableEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-zinc-600 gap-4 border border-dashed border-zinc-800/80 rounded-3xl bg-zinc-900/10 backdrop-blur-sm w-full">
            <Users className="h-16 w-16 opacity-20" />
            <p className="text-base font-medium">No rankings found yet.</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-7 overflow-hidden w-full">
            {/* Podium */}
            <div className="xl:col-span-5 flex flex-col justify-center items-center w-full shrink-0 xl:shrink xl:min-h-0">
              {podiumLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                </div>
              ) : top3.length > 0 ? (
                <div className="w-full max-w-lg mx-auto">
                  <div className="text-center mb-4 xl:mb-6">
                    <h2 className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-xs">Community Podium</h2>
                    <p className="text-zinc-500 text-sm mt-1">Top members by average score</p>
                  </div>
                  <div className="flex items-end justify-center gap-3 md:gap-4 w-full relative">
                    {top3[1] && <PodiumCard entry={top3[1]} position={2} isMe={top3[1].userId === myStats?.userId} />}
                    {top3[0] && <PodiumCard entry={top3[0]} position={1} isMe={top3[0].userId === myStats?.userId} />}
                    {top3[2] && <PodiumCard entry={top3[2]} position={3} isMe={top3[2].userId === myStats?.userId} />}
                  </div>
                </div>
              ) : (
                <div className="hidden xl:block text-zinc-600 text-sm text-center">Not enough data for podium</div>
              )}
            </div>

            {/* Rankings List */}
            <div className="xl:col-span-7 flex flex-col min-h-0 w-full overflow-hidden">
              {(tableEntries.length > 0 || tableLoading) && (
                <div className="flex items-center gap-4 w-full mb-3 shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Rankings 4+</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-zinc-800/80 to-transparent" />
                </div>
              )}

              {tableLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-500/60" />
                </div>
              ) : tableEntries.length > 0 ? (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="w-full rounded-3xl overflow-hidden border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-xl shadow-xl shadow-black/40 flex-1 min-h-0 flex flex-col">
                    <div className="grid grid-cols-12 gap-3 px-4 md:px-5 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800/40 shrink-0">
                      <div className="col-span-2 md:col-span-1 text-center">#</div>
                      <div className="col-span-7 md:col-span-8">Member</div>
                      <div className="col-span-3 md:col-span-3 text-right">Avg</div>
                    </div>
                    <div className="divide-y divide-zinc-800/40 flex-1 min-h-0 overflow-y-auto no-scrollbar">
                      {tableEntries.map((entry) => (
                        <LeaderboardRow key={entry.userId} entry={entry} isMe={entry.userId === myStats?.userId} />
                      ))}
                    </div>
                  </div>

                  {totalTablePages > 1 && (
                    <div className="flex items-center justify-between w-full pt-3 px-1 shrink-0">
                      <button
                        onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                        disabled={tablePage === 1}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline-block">Previous</span>
                      </button>
                      <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-1.5 rounded-xl border border-zinc-800/50">
                        <span className="text-sm text-emerald-400 font-bold">{tablePage}</span>
                        <span className="text-zinc-600 font-medium text-xs">/</span>
                        <span className="text-sm text-zinc-400 font-bold">{totalTablePages}</span>
                      </div>
                      <button
                        onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                        disabled={tablePage === totalTablePages}
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

              {/* User sticky row */}
              {!isMeInTop3 && !isMeInTable && myStats && (
                <div className="w-full mt-4 pt-3 relative shrink-0">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-zinc-950 border border-zinc-800/50 shadow-md text-[10px] text-zinc-400 font-bold tracking-widest uppercase rounded-full z-20">
                    Your Rank
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.1)] bg-zinc-900/80 backdrop-blur-md relative z-10">
                    <LeaderboardRow
                      entry={{
                        userId: myStats.userId,
                        displayName: myStats.displayName,
                        avatarUrl: myStats.avatarUrl,
                        score: myStats.averageScore,
                        rank: myStats.rank,
                        testCount: myStats.testCount,
                      }}
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
  );
}
