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
    1: { size: "h-24 w-24", ring: "ring-amber-400 ring-4", badge: "🥇", badgeBg: "bg-amber-500", order: "order-2", height: "pt-0", scoreColor: "text-amber-400", nameColor: "text-amber-300" },
    2: { size: "h-20 w-20", ring: "ring-slate-300 ring-[3px]", badge: "🥈", badgeBg: "bg-slate-400", order: "order-1", height: "pt-8", scoreColor: "text-slate-300", nameColor: "text-slate-200" },
    3: { size: "h-20 w-20", ring: "ring-amber-700 ring-[3px]", badge: "🥉", badgeBg: "bg-amber-700", order: "order-3", height: "pt-8", scoreColor: "text-amber-600", nameColor: "text-amber-700" },
  }[position];

  return (
    <Link href={`/profile/${entry.userId}`} className={cn("block flex-1 max-w-[180px]", config.order)}>
      <div className={cn("group flex flex-col items-center text-center transition-all duration-300 hover:scale-105", config.height)}>
        <div className="relative mb-3">
          <Avatar className={cn(config.size, config.ring, "ring-offset-2 ring-offset-zinc-950 shadow-2xl transition-transform group-hover:scale-105")}>
            <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
            <AvatarFallback className={cn("font-bold text-xl rounded-full", isMe ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-300")}>
              {(entry.displayName || "??").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className={cn("absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full shadow-lg text-sm", config.badgeBg)}>
            {config.badge}
          </div>
        </div>
        <p className={cn("font-semibold text-sm truncate max-w-[110px] mt-1", isMe ? "text-emerald-400" : config.nameColor)}>
          {entry.displayName}
        </p>
        {isMe && <span className="text-[9px] uppercase tracking-wider text-emerald-500/70 font-bold">You</span>}
        <div className="mt-3 px-5 py-3 rounded-2xl backdrop-blur-sm bg-white/5">
          <p className={cn("text-2xl font-black", config.scoreColor)}>{entry.score}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Avg Score</p>
        </div>
      </div>
    </Link>
  );
}

// ── List Row ──
function LeaderboardRow({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  return (
    <Link href={`/profile/${entry.userId}`} className="block">
      <div className={cn("group grid grid-cols-12 gap-4 px-5 py-3.5 items-center transition-all duration-150 cursor-pointer rounded-xl", isMe ? "bg-emerald-500/10 ring-1 ring-emerald-500/25" : "hover:bg-white/[0.03]")}>
        <div className="col-span-1 flex justify-center">
          <span className={cn("font-mono text-sm font-semibold", isMe ? "text-emerald-400" : "text-zinc-500")}>{entry.rank}</span>
        </div>
        <div className="col-span-7 flex items-center gap-3">
          <Avatar className={cn("h-8 w-8 ring-2 ring-offset-2 ring-offset-zinc-950", isMe ? "ring-emerald-500/30" : "ring-zinc-800")}>
            <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
            <AvatarFallback className={cn("font-bold text-xs rounded-full", isMe ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400")}>
              {(entry.displayName || "??").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className={cn("text-sm font-medium truncate", isMe ? "text-emerald-400" : "text-zinc-300 group-hover:text-white")}>
            {entry.displayName}{isMe && " (You)"}
          </span>
        </div>
        <div className="col-span-2 text-right">
          <span className={cn("font-mono font-semibold text-sm", isMe ? "text-emerald-400" : "text-zinc-400 group-hover:text-zinc-200")}>{entry.score}</span>
          <span className="text-[10px] text-zinc-600 block">avg</span>
        </div>
        <div className="col-span-2 text-right hidden sm:block">
          <span className="font-mono text-xs text-zinc-600">{entry.testCount ?? 0} tests</span>
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
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Trophy className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Leaderboard</h2>
            <p className="text-zinc-500 text-xs">Ranked by avg test score</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/60 border border-zinc-700/40 text-xs text-zinc-400">
            <Users className="h-3.5 w-3.5" />
            <span className="font-semibold text-zinc-200">{summary.participants}</span> students
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-zinc-800/60 border border-zinc-700/40 text-xs text-zinc-400">
            <span className="font-semibold text-zinc-200">{summary.testsConsidered}</span> test attempts
          </div>
        </div>
      </div>

      {/* ── Year Filter ── */}
      {(availableYears.length > 0 || selectedYears.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 mr-1">
            <CalendarDays className="h-3.5 w-3.5" /> Filter
          </div>
          <button onClick={() => setSelectedYears([])} className={cn("h-7 rounded-full px-4 text-xs font-semibold transition-colors", selectedYears.length === 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200")}>
            All Time
          </button>
          {availableYears.map((year) => (
            <button key={year} onClick={() => toggleYear(year)} className={cn("h-7 rounded-full px-4 text-xs font-semibold transition-colors", selectedYears.includes(year) ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200")}>
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
        <div className="flex flex-1 flex-col items-center justify-center py-24 gap-3 text-zinc-600">
          <Users className="h-12 w-12 opacity-20" />
          <p className="text-sm">No test results yet for this period.</p>
        </div>
      ) : (
        <>
          {/* ── Podium (Top 3) — always shown, never repaginated ── */}
          {podiumLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : top3.length > 0 && (
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-3xl pointer-events-none" />
              <div className="flex items-end justify-center gap-3 md:gap-8 pt-8 pb-6">
                {top3[1] && <PodiumCard entry={top3[1]} position={2} isMe={top3[1].userId === myStats?.userId} />}
                {top3[0] && <PodiumCard entry={top3[0]} position={1} isMe={top3[0].userId === myStats?.userId} />}
                {top3[2] && <PodiumCard entry={top3[2]} position={3} isMe={top3[2].userId === myStats?.userId} />}
              </div>
            </div>
          )}

          {/* ── Divider ── */}
          {(tableEntries.length > 0 || tableLoading) && (
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-zinc-800/60" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Rankings</span>
              <div className="h-px flex-1 bg-zinc-800/60" />
            </div>
          )}

          {/* ── Rankings Table (rank 4 onward, paginated) ── */}
          {tableLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500/60" />
            </div>
          ) : tableEntries.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm">
              <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[10px] font-bold text-zinc-600 uppercase tracking-wider border-b border-zinc-800/50">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-7">Student</div>
                <div className="col-span-2 text-right">Avg</div>
                <div className="col-span-2 text-right hidden sm:block">Tests</div>
              </div>
              <div className="divide-y divide-zinc-800/30">
                {tableEntries.map((entry) => (
                  <LeaderboardRow key={entry.userId} entry={entry} isMe={entry.userId === myStats?.userId} />
                ))}
              </div>
            </div>
          )}

          {/* ── Pagination ── */}
          {totalTablePages > 1 && (
            <div className="flex items-center justify-between mt-4 px-1">
              <button
                onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                disabled={tablePage === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-xs text-zinc-600 font-mono">Page {tablePage} of {totalTablePages}</span>
              <button
                onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                disabled={tablePage === totalTablePages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── Pinned user row if not visible in current view ── */}
          {!isMeInTop3 && !isMeInTable && myStats && (
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
        </>
      )}
    </div>
  );
}
