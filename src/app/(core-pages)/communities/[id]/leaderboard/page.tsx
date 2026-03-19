"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCommunity } from "@/components/communities/CommunityContext";
import {
  leaderboardApi,
  LeaderboardEntry,
  CommunityAverageLeaderboardMe,
} from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Users, Sigma, CalendarDays } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 8;

export default function CommunityLeaderboardPage() {
  const { community } = useCommunity();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [summary, setSummary] = useState<{ participants: number; testsConsidered: number }>({
    participants: 0,
    testsConsidered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [myStats, setMyStats] = useState<(CommunityAverageLeaderboardMe & { displayName: string }) | null>(null);

  useEffect(() => {
    if (!community?._id) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setPage(1);
      try {
        const [data, me] = await Promise.all([
          leaderboardApi.getCommunityAverageLeaderboard(community._id, {
            years: selectedYears,
            limit: 500,
          }),
          leaderboardApi.getCommunityAverageMe(community._id, {
            years: selectedYears,
          }).catch(() => null),
        ]);

        const list = data.leaderboard || [];
        setEntries(list);
        setAvailableYears(data.availableYears || []);
        setSummary(data.summary || { participants: 0, testsConsidered: 0 });

        if (me) {
          const myEntry = list?.find((entry) => entry.userId === me.userId);
          setMyStats({
            ...me,
            displayName: myEntry?.displayName || "You",
          });
        } else {
          setMyStats(null);
        }
      } catch (error) {
        setAvailableYears([]);
        setEntries([]);
        setSummary({ participants: 0, testsConsidered: 0 });
        setMyStats(null);
        toast.error("Unable to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [community?._id, selectedYears]);

  const topStudent = entries.length > 0 ? entries[0] : null;

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const visibleEntries = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageStart = entries.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(page * PAGE_SIZE, entries.length);

  const toggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((item) => item !== year) : [...prev, year].sort((a, b) => a - b)
    );
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-[1080px] flex-col py-3 sm:py-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">Leaderboard</h2>
          </div>
          <div className="text-xs text-zinc-500">Avg score across attempted tests</div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mr-1">
            <CalendarDays className="h-3.5 w-3.5" />
            Years:
          </div>
          <button
            type="button"
            onClick={() => setSelectedYears([])}
            className={`h-7 rounded-md border px-2.5 text-xs ${
              selectedYears.length === 0
                ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
            }`}
          >
            All
          </button>
          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => toggleYear(year)}
              className={`h-7 rounded-md border px-2.5 text-xs ${
                selectedYears.includes(year)
                  ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <Users className="h-3.5 w-3.5" />
              Students
            </div>
            <p className="mt-1 text-lg font-bold text-white">{summary.participants}</p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <Sigma className="h-3.5 w-3.5" />
              Test Attempts
            </div>
            <p className="mt-1 text-lg font-bold text-white">{summary.testsConsidered}</p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
            <div className="text-[11px] text-zinc-400">Top Avg</div>
            <p className="mt-1 text-lg font-bold text-emerald-400">{topStudent?.score ?? 0}</p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
            <div className="text-[11px] text-zinc-400">Top Student</div>
            <p className="mt-1 truncate text-sm font-semibold text-white">{topStudent?.displayName || "-"}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5 sm:p-3">
        <div className="mb-1.5 grid grid-cols-[56px_minmax(0,1fr)_92px_92px_72px] px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500 sm:grid-cols-[64px_minmax(0,1fr)_110px_110px_90px]">
          <div>Rank</div>
          <div>User</div>
          <div className="text-right">Average</div>
          <div className="text-right">Total</div>
          <div className="text-right">Tests</div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-2">
          {loading ? (
            <div className="flex h-full items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex h-full items-center justify-center py-20 text-zinc-500">
              No evaluated test results in selected period.
            </div>
          ) : (
            <>
              {visibleEntries.map((entry) => (
                <Link
                  key={entry.userId}
                  href={`/profile/${entry.userId}`}
                  className="grid grid-cols-[56px_minmax(0,1fr)_92px_92px_72px] items-center rounded-lg border border-zinc-800 bg-zinc-900/35 px-2 py-2.5 text-white transition-colors hover:border-zinc-600 sm:grid-cols-[64px_minmax(0,1fr)_110px_110px_90px]"
                >
                  <div className="font-semibold text-zinc-300">#{entry.rank}</div>
                  <div className="min-w-0 truncate font-semibold">{entry.displayName}</div>
                  <div className="text-right font-bold text-emerald-400">{entry.score}</div>
                  <div className="text-right text-zinc-300">{entry.totalScore ?? 0}</div>
                  <div className="text-right text-zinc-400">{entry.testCount ?? 0}</div>
                </Link>
              ))}

              {myStats && (
                <div className="mt-2 grid grid-cols-[56px_minmax(0,1fr)_92px_92px_72px] items-center rounded-lg border border-emerald-500/40 bg-emerald-900/15 px-2 py-2.5 text-white sm:grid-cols-[64px_minmax(0,1fr)_110px_110px_90px]">
                  <div className="font-semibold text-zinc-100">#{myStats.rank || "-"}</div>
                  <div className="min-w-0 truncate font-semibold text-emerald-300">{myStats.displayName}</div>
                  <div className="text-right font-bold text-emerald-300">{myStats.score}</div>
                  <div className="text-right text-zinc-300">{myStats.totalScore}</div>
                  <div className="text-right text-zinc-400">{myStats.testCount}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!loading && entries.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 border-t border-emerald-900/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-medium text-zinc-500 sm:text-sm">
            Showing {pageStart}-{pageEnd} of {entries.length}
          </div>

          <Button
            variant="ghost"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-lg border border-emerald-800/50 px-5 py-2 text-white hover:bg-emerald-900/30 disabled:opacity-30"
          >
            Prev
          </Button>

          <div className="flex items-center justify-center gap-1 text-sm font-medium text-white">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                  page === p
                    ? "bg-emerald-500 text-black"
                    : "text-emerald-300/60 hover:bg-emerald-900/30 hover:text-emerald-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-emerald-800/50 px-5 py-2 text-white hover:bg-emerald-900/30 disabled:opacity-30"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
