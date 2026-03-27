"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCommunity } from "@/components/communities/CommunityContext";
import { communityApi, CommunityTest } from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ArrowRight, Calendar, Clock, FileText } from "lucide-react";
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
    userRole === "admin" ||
    userRole === "owner" ||
    userRole === "subadmin" ||
    !!community?.allowTestCreation;

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
    <div className="flex h-full w-full flex-col px-4 py-6 sm:px-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#e9edef]">Classroom Tests</h2>
          <p className="text-[#8696a0] mt-1">Manage and attempt community assessments</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row items-center">
           {canCreate && <TestBuilder onTestCreated={fetchTests} />}
           <div className="relative w-full sm:w-[260px]">
             <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8696a0]" />
             <Input
               value={search}
               onChange={(event) => setSearch(event.target.value)}
               placeholder="Search tests"
               className="h-10 rounded-lg border-none bg-[#202c33] pl-9 text-sm text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0"
             />
           </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-2">
        {loading ? (
          <div className="flex h-full items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#00a884]" />
          </div>
        ) : visibleTests.length === 0 ? (
          <div className="flex flex-col h-full items-center py-20 text-[#8696a0]">
            <div className="bg-[#111b21] p-6 rounded-full mb-4 shadow hover:bg-[#202c33] transition">
               <FileText className="w-12 h-12 text-[#8696a0]" />
            </div>
            {search ? "No tests match your search." : "No tests available yet."}
          </div>
        ) : (
          <div className="grid gap-4">
            {visibleTests.map((test) => {
              const startDate = new Date(test.startTime);
              const endDate = new Date(test.endTime);
              const hasStarted = isPast(startDate);
              const hasEnded = isPast(endDate);
              const isOngoing = hasStarted && !hasEnded;

              let statusText = "Closed";
              let statusClass = "text-[#8696a0] bg-[#202c33]";

              if (!hasStarted) {
                statusText = `Starts in ${formatDistanceToNow(startDate)}`;
                statusClass = "text-sky-400 bg-sky-400/10";
              } else if (isOngoing) {
                statusText = "Live now";
                statusClass = "text-[#00a884] bg-[#00a884]/10";
              }

              const buttonLabel = hasEnded
                ? "Result Out"
                : isOngoing
                  ? "Enter Test"
                  : "View Details";

              return (
                <div
                  key={test._id}
                  className="rounded-xl bg-[#111b21] hover:bg-[#202c33] border border-transparent hover:border-[#2a3942] transition-colors p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-[17px] font-semibold text-[#e9edef]">{test.title}</h3>
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md", statusClass)}>
                          {statusText}
                        </span>
                      </div>
                      <p className="text-sm text-[#8696a0]">
                        {test.description || "Community test session"}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#8696a0]">
                        <span className="uppercase tracking-widest">{test.type}</span>
                        <span>•</span>
                        <span>{test.totalMarks} marks</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(startDate, "MMM d")}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {test.durationMinutes}m
                        </span>
                      </div>
                    </div>

                    <Link href={`/communities/${community?._id}/tests/${test._id}`}>
                      <Button className="w-full md:w-auto h-10 rounded-lg bg-[#00a884] px-6 text-[#111b21] hover:bg-[#029074] shadow-none border-0 font-semibold">
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 pb-2">
          <Button
            variant="ghost"
            className="rounded-lg text-[#8696a0] hover:bg-[#202c33] hover:text-[#d1d7db]"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <div className="text-sm font-medium text-[#8696a0]">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="ghost"
            className="rounded-lg text-[#8696a0] hover:bg-[#202c33] hover:text-[#d1d7db]"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
