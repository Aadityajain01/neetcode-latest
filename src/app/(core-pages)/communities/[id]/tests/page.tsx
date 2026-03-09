"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCommunity } from "@/components/communities/CommunityContext";
import { communityApi, CommunityTest } from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, FileQuestion, ArrowRight, Plus, Trophy } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, isPast, format } from "date-fns";
import { TestBuilder } from "@/components/communities/TestBuilder";

export default function TestsPage() {
  const { community, userRole } = useCommunity();
  const [tests, setTests] = useState<CommunityTest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    if (!community) return;
    try {
      setLoading(true);
      const data = await communityApi.getTests(community._id);
      setTests(data);
    } catch {
      toast.error("Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTests(); }, [community?._id]);

  const canCreate = userRole === 'admin' || userRole === 'owner' || community?.allowTestCreation;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-500" />
            Classroom Tests
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Assignments, quizzes, and programming contests.</p>
        </div>
        {canCreate && <TestBuilder onTestCreated={fetchTests} />}
      </div>

      {tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
            <FileQuestion className="w-7 h-7 text-zinc-600" />
          </div>
          <p className="text-zinc-400 font-medium">No tests yet</p>
          <p className="text-xs text-zinc-600 mt-1">
            {canCreate ? "Click 'Create Test' to get started." : "No tests have been created in this community."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map(test => {
            const startDate = new Date(test.startTime);
            const endDate   = new Date(test.endTime);
            const hasStarted = isPast(startDate);
            const hasEnded   = isPast(endDate);
            const isOngoing  = hasStarted && !hasEnded;

            let statusBg   = "bg-zinc-800/60 text-zinc-400 border-zinc-700";
            let statusText = "Closed";
            if (!hasStarted) {
              statusBg   = "bg-blue-500/10 text-blue-400 border-blue-500/20";
              statusText = `Starts in ${formatDistanceToNow(startDate)}`;
            } else if (isOngoing) {
              statusBg   = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
              statusText = "● Live Now";
            }

            const btnLabel = hasEnded ? "Results" : isOngoing ? "Enter Test" : "View Details";

            return (
              <div
                key={test._id}
                className="group bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Left */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white truncate">{test.title}</h3>
                      <Badge variant="outline" className={`text-[10px] h-4 px-1.5 border ${statusBg}`}>
                        {statusText}
                      </Badge>
                    </div>
                    {test.description && (
                      <p className="text-xs text-zinc-500 line-clamp-1">{test.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md capitalize">{test.type} Test</span>
                      <span className="text-emerald-400 font-medium">{test.totalMarks} marks</span>
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Calendar className="w-3 h-3" /> {format(startDate, "MMM d")}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Clock className="w-3 h-3" /> {test.durationMinutes}m
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <Link href={`/communities/${community?._id}/tests/${test._id}`} className="shrink-0">
                    <Button
                      size="sm"
                      className={`w-full sm:w-auto h-8 px-4 text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isOngoing
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                      }`}
                    >
                      {btnLabel}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
