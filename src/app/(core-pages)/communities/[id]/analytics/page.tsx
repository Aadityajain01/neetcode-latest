"use client";

import { useEffect, useState } from "react";
import { useCommunity } from "@/components/communities/CommunityContext";
import { communityApi, CommunityTest } from "@/lib/api-modules";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AnalyticsData {
  analytics: {
    studentsAttempted: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
  students: {
    userId: { _id: string; displayName: string; email: string };
    totalScore: number;
    mcqScore: number;
    programmingScore: number;
    evaluatedAt: string;
  }[];
}

export default function AnalyticsPage() {
  const { community, userRole } = useCommunity();
  const [tests, setTests] = useState<CommunityTest[]>([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!community) return;

    communityApi
      .getTests(community._id)
      .then((response) => {
        setTests(response);
        if (response.length > 0) {
          setSelectedTestId(response[0]._id);
        }
      })
      .catch(() => toast.error("Failed to load tests"))
      .finally(() => setLoading(false));
  }, [community]);

  useEffect(() => {
    if (!community || !selectedTestId) return;

    setDataLoading(true);
    communityApi
      .getTestAnalytics(community._id, selectedTestId)
      .then(setData)
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setDataLoading(false));
  }, [community, selectedTestId]);

  if (userRole !== "admin" && userRole !== "owner") {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Admins only.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col px-3 py-3 sm:px-5 sm:py-5">
      <div className="flex min-h-0 flex-1 flex-col rounded-[24px] border border-zinc-800 bg-black">
        <div className="flex flex-col gap-4 border-b border-zinc-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-xl font-semibold text-white">{community?.name}</h2>
            <p className="text-sm text-zinc-500">Community analytics</p>
          </div>

          {tests.length > 0 && (
            <Select value={selectedTestId} onValueChange={setSelectedTestId}>
              <SelectTrigger className="w-full rounded-sm border-zinc-700 bg-zinc-950 text-white sm:w-[260px]">
                <SelectValue placeholder="Select test" />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
                {tests.map((test) => (
                  <SelectItem key={test._id} value={test._id}>
                    {test.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {tests.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No tests to analyze yet.
          </div>
        ) : dataLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
          </div>
        ) : !data?.analytics ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No students have attempted this test yet.
          </div>
        ) : (
          <>
            <div className="grid gap-3 border-b border-zinc-800 px-4 py-4 sm:grid-cols-4 sm:px-6">
              <StatCard label="Attempts" value={data.analytics.studentsAttempted} />
              <StatCard label="Avg Score" value={Math.round(data.analytics.averageScore * 10) / 10} />
              <StatCard label="Highest" value={data.analytics.highestScore} />
              <StatCard label="Lowest" value={data.analytics.lowestScore} />
            </div>

            <div className="grid grid-cols-[80px_minmax(0,1fr)_90px_90px_90px] gap-3 border-b border-zinc-800 px-4 py-4 text-sm font-medium text-white sm:px-6">
              <div>Rank</div>
              <div>Name</div>
              <div className="text-right">MCQ</div>
              <div className="text-right">Code</div>
              <div className="text-right">Total</div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {data.students
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((student, index) => (
                  <div
                    key={student.userId?._id || index}
                    className="grid grid-cols-[80px_minmax(0,1fr)_90px_90px_90px] gap-3 border-b border-zinc-800 px-4 py-4 text-sm sm:px-6"
                  >
                    <div className="text-zinc-400">#{index + 1}</div>
                    <div className="truncate text-white">
                      {student.userId?.displayName || "Unknown"}
                    </div>
                    <div className="text-right text-zinc-300">{student.mcqScore}</div>
                    <div className="text-right text-zinc-300">{student.programmingScore}</div>
                    <div className="text-right text-emerald-300">{student.totalScore}</div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[18px] border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}
