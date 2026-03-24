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
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-6 sm:px-8">
      <div className="rounded-2xl bg-[#111b21] p-5 shadow-sm border border-transparent hover:border-[#2a3942] transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#00a884]" />
            <h2 className="text-2xl font-bold text-[#e9edef]">Leaderboard</h2>
          </div>
          <div className="text-sm text-[#8696a0]">Avg score across attempted tests</div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8696a0] mr-2">
            <CalendarDays className="h-4 w-4" />
            Years
          </div>
          <button
            type="button"
            onClick={() => setSelectedYears([])}
            className={`h-8 rounded-full border-none px-4 text-[13px] font-medium transition-colors ${
              selectedYears.length === 0
                ? "bg-[#00a884]/15 text-[#00a884]"
                : "bg-[#202c33] text-[#aebac1] hover:bg-[#2a3942] hover:text-[#d1d7db]"
            }`}
          >
            All Time
          </button>
          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => toggleYear(year)}
              className={`h-8 rounded-full border-none px-4 text-[13px] font-medium transition-colors ${
                selectedYears.includes(year)
                  ? "bg-[#00a884]/15 text-[#00a884]"
                  : "bg-[#202c33] text-[#aebac1] hover:bg-[#2a3942] hover:text-[#d1d7db]"
              }`}
            >
               {year}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-[#202c33] px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-[#8696a0] font-medium">
              <Users className="h-4 w-4" />
              Students
            </div>
            <p className="mt-1.5 text-2xl font-bold text-[#e9edef]">{summary.participants}</p>
          </div>

          <div className="rounded-xl bg-[#202c33] px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-[#8696a0] font-medium">
              <Sigma className="h-4 w-4" />
              Test Attempts
            </div>
            <p className="mt-1.5 text-2xl font-bold text-[#e9edef]">{summary.testsConsidered}</p>
          </div>

          <div className="rounded-xl bg-[#202c33] px-4 py-3">
            <div className="text-xs text-[#8696a0] font-medium">Top Avg</div>
            <p className="mt-1.5 text-2xl font-bold text-[#00a884]">{topStudent?.score ?? 0}</p>
          </div>

          <div className="rounded-xl bg-[#202c33] px-4 py-3">
            <div className="text-xs text-[#8696a0] font-medium">Top Student</div>
            <p className="mt-1.5 truncate text-[17px] font-semibold text-[#e9edef]">{topStudent?.displayName || "-"}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col rounded-2xl bg-[#111b21] shadow-sm overflow-hidden">
        <div className="grid grid-cols-[60px_minmax(0,1fr)_80px_80px_60px] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#8696a0] border-b border-[#202c33] sm:grid-cols-[70px_minmax(0,1fr)_100px_100px_80px]">
          <div>Rank</div>
          <div>User</div>
          <div className="text-right">Average</div>
          <div className="text-right">Total</div>
          <div className="text-right">Tests</div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#202c33]">
          {loading ? (
            <div className="flex h-full items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#00a884]" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex h-full items-center justify-center py-20 text-sm text-[#8696a0]">
              No evaluated test results in selected period.
            </div>
          ) : (
            <>
              {visibleEntries.map((entry) => (
                <Link
                  key={entry.userId}
                  href={`/profile/${entry.userId}`}
                  className="grid grid-cols-[60px_minmax(0,1fr)_80px_80px_60px] items-center px-6 py-4 text-[14.5px] transition-colors hover:bg-[#202c33]/50 sm:grid-cols-[70px_minmax(0,1fr)_100px_100px_80px]"
                >
                  <div className="font-semibold text-[#8696a0]">#{entry.rank}</div>
                  <div className="min-w-0 truncate font-semibold text-[#e9edef]">{entry.displayName}</div>
                  <div className="text-right font-bold text-[#00a884]">{entry.score}</div>
                  <div className="text-right text-[#aebac1]">{entry.totalScore ?? 0}</div>
                  <div className="text-right text-[#8696a0]">{entry.testCount ?? 0}</div>
                </Link>
              ))}

              {myStats && (
                <div className="mt-2 grid grid-cols-[60px_minmax(0,1fr)_80px_80px_60px] items-center px-6 py-4 bg-[#00a884]/10 sm:grid-cols-[70px_minmax(0,1fr)_100px_100px_80px] border-t border-[#00a884]/20">
                  <div className="font-semibold text-[#e9edef]">#{myStats.rank || "-"}</div>
                  <div className="min-w-0 truncate font-semibold text-[#00a884]">{myStats.displayName}</div>
                  <div className="text-right font-bold text-[#00a884]">{myStats.score}</div>
                  <div className="text-right text-[#d1d7db]">{myStats.totalScore}</div>
                  <div className="text-right text-[#aebac1]">{myStats.testCount}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {!loading && entries.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2 px-2">
          <div className="text-sm font-medium text-[#8696a0]">
            Showing {pageStart}-{pageEnd} of {entries.length}
          </div>

          <div className="flex items-center justify-center gap-1 text-sm font-medium">
            <Button
              variant="ghost"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-lg h-9 px-4 text-[#8696a0] hover:bg-[#202c33] hover:text-[#d1d7db] disabled:opacity-50 border-0"
            >
              Prev
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
               <button
                 key={p}
                 onClick={() => setPage(p)}
                 className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                   page === p
                     ? "bg-[#00a884] text-[#111b21] font-bold"
                     : "text-[#8696a0] hover:bg-[#202c33] hover:text-[#d1d7db]"
                 }`}
               >
                 {p}
               </button>
            ))}

            <Button
              variant="ghost"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-lg h-9 px-4 text-[#8696a0] hover:bg-[#202c33] hover:text-[#d1d7db] disabled:opacity-50 border-0"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
