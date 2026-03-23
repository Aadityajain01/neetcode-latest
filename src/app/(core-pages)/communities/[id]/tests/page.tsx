"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCommunity } from "@/components/communities/CommunityContext";
import { communityApi, CommunityTest } from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ArrowRight, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { TestBuilder } from "@/components/communities/TestBuilder";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

export default function TestsPage() {
  const { community, userRole } = useCommunity();
  const [tests, setTests] = useState<CommunityTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<CommunityTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const canCreate =
    userRole === "admin" || userRole === "owner" || community?.allowTestCreation;

  const fetchTests = async () => {
    if (!community) return;
    try {
      setLoading(true);
      const data = await communityApi.getTests(community._id);
      setTests(data);
      setFilteredTests(data);
    } catch {
      toast.error("Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [community?._id]);

  useEffect(() => {
    const trimmed = search.trim().toLowerCase();
    const next = !trimmed
      ? tests
      : tests.filter((test) => test.title.toLowerCase().includes(trimmed));
    setFilteredTests(next);
    setPage(1);
  }, [search, tests]);

  const totalPages = Math.max(1, Math.ceil(filteredTests.length / PAGE_SIZE));
  const visibleTests = filteredTests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col px-3 py-3 sm:px-5 sm:py-5">
      <div className="flex min-h-0 flex-1 flex-col rounded-[24px] border border-zinc-800/80 bg-zinc-950/70 backdrop-blur">
        <div className="border-b border-zinc-800/80 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Classroom Tests</h2>
              <p className="text-sm text-zinc-500">Manage and attempt community assessments</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {canCreate && <TestBuilder onTestCreated={fetchTests} />}
              <div className="relative w-full sm:w-[260px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tests"
                  className="h-10 rounded-sm border-zinc-700 bg-zinc-950 pl-9 text-sm text-white placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : visibleTests.length === 0 ? (
            <div className="flex h-full items-center justify-center py-20 text-zinc-500">
              No tests found.
            </div>
          ) : (
            <div className="space-y-3 px-4 py-4 sm:px-6">
              {visibleTests.map((test) => {
                const startDate = new Date(test.startTime);
                const endDate = new Date(test.endTime);
                const hasStarted = isPast(startDate);
                const hasEnded = isPast(endDate);
                const isOngoing = hasStarted && !hasEnded;

                let statusText = "Closed";
                let statusClass = "text-zinc-400";

                if (!hasStarted) {
                  statusText = `Starts in ${formatDistanceToNow(startDate)}`;
                  statusClass = "text-blue-300";
                } else if (isOngoing) {
                  statusText = "Live now";
                  statusClass = "text-emerald-300";
                }

                const buttonLabel = hasEnded
                  ? "Results"
                  : isOngoing
                    ? "Enter Test"
                    : "View Details";

                return (
                  <div
                    key={test._id}
                    className="rounded-[18px] border border-zinc-800/80 bg-black/50 px-4 py-4 transition-colors hover:border-zinc-700"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">{test.title}</h3>
                          <span className={cn("text-xs font-medium uppercase tracking-[0.18em]", statusClass)}>
                            {statusText}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500">
                          {test.description || "Community test session"}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                          <span>{test.type.toUpperCase()}</span>
                          <span>{test.totalMarks} marks</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(startDate, "MMM d")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {test.durationMinutes}m
                          </span>
                        </div>
                      </div>

                      <Link href={`/communities/${community?._id}/tests/${test._id}`}>
                        <Button className="h-10 rounded-sm bg-zinc-900 px-4 text-white hover:bg-zinc-800">
                          {buttonLabel}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-4 sm:px-6">
          <Button
            variant="outline"
            className="rounded-sm border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <div className="text-sm text-zinc-400">
            {page} {totalPages > 1 ? `of ${totalPages}` : ""}
          </div>
          <Button
            variant="outline"
            className="rounded-sm border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-900"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
