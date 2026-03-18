"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCommunity } from "@/components/communities/CommunityContext";
import { leaderboardApi, LeaderboardEntry } from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy } from "lucide-react";

const PAGE_SIZE = 8;

export default function CommunityLeaderboardPage() {
  const { community } = useCommunity();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [myStats, setMyStats] = useState<{ rank: number; score: number; displayName: string } | null>(
    null
  );

  useEffect(() => {
    if (!community?._id) return;
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const [list, me] = await Promise.all([
          leaderboardApi.getCommunity(community._id, { limit: 50 }),
          leaderboardApi.getCommunityMe(community._id).catch(() => null),
        ]);
        setEntries(list || []);
        if (me) {
          // Find the user's display name from the full list if available
          const myEntry = list?.find(e => e.userId === me.userId);
          setMyStats({ 
            rank: me.rank, 
            score: me.score, 
            displayName: myEntry?.displayName || "You" 
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [community?._id]);

  const topStudent = entries.length > 0 ? entries[0] : null;

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const visibleEntries = entries.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col py-2 sm:py-4">
      {/* Header */}
      <div className="mb-4 flex flex-row items-center justify-between px-2">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          LeaderBoard
        </h2>
        {topStudent && (
          <div className="text-sm font-medium text-white sm:text-base">
            top student - {topStudent.displayName}
          </div>
        )}
      </div>

      {/* Table Head: Rank, User Name, Score */}
      <div className="mb-2 grid grid-cols-[80px_1fr_80px] px-4 font-semibold text-white sm:grid-cols-[100px_1fr_100px]">
        <div>Rank</div>
        <div>User Name</div>
        <div className="text-right">Score</div>
      </div>

      {/* List */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {loading ? (
          <div className="flex h-full items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-full items-center justify-center py-20 text-emerald-500/50">
            No rankings yet.
          </div>
        ) : (
          <>
            {/* Top 8 / Paginated users */}
            {visibleEntries.map((entry) => (
              <Link
                key={entry.userId}
                href={`/profile/${entry.userId}`}
                className="grid grid-cols-[80px_1fr_80px] items-center rounded-xl border border-emerald-800/40 bg-emerald-950/20 px-4 py-3 text-white transition-colors hover:bg-emerald-900/30 sm:grid-cols-[100px_1fr_100px]"
              >
                <div className="font-medium">{entry.rank}</div>
                <div className="min-w-0 truncate font-medium">{entry.displayName}</div>
                <div className="text-right font-medium">{entry.score}</div>
              </Link>
            ))}

            {/* Current user card (Add-on at the bottom) */}
            {myStats && (
              <div className="mt-4 grid grid-cols-[80px_1fr_80px] items-center rounded-xl border border-emerald-500/50 bg-emerald-900/20 px-4 py-3 text-white sm:grid-cols-[100px_1fr_100px]">
                <div className="font-medium">{myStats.rank}</div>
                <div className="min-w-0 truncate font-semibold text-emerald-400">
                  {myStats.displayName}
                </div>
                <div className="text-right font-medium">{myStats.score}</div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && entries.length > 0 && (
        <div className="mt-auto flex items-center justify-between border-t border-emerald-800/40 pt-4">
          <Button
            variant="ghost"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-lg border border-emerald-800/50 px-6 py-2 text-white hover:bg-emerald-900/30 disabled:opacity-30"
          >
            Prev
          </Button>

          <div className="flex items-center gap-1 text-sm font-medium text-white">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                  page === p
                    ? "bg-emerald-500 text-black"
                    : "text-emerald-500/50 hover:bg-emerald-900/30 hover:text-emerald-300"
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
            className="rounded-lg border border-emerald-800/50 px-6 py-2 text-white hover:bg-emerald-900/30 disabled:opacity-30"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
