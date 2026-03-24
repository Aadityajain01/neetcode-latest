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
    <div className="flex h-full w-full flex-col px-4 py-6 sm:px-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#e9edef]">Test Analytics</h2>
          <p className="text-[#8696a0] mt-1">Performance overview for selected assessment</p>
        </div>

        {tests.length > 0 && (
          <Select value={selectedTestId} onValueChange={setSelectedTestId}>
            <SelectTrigger className="w-full rounded-lg border-none bg-[#202c33] text-[#e9edef] sm:w-[260px] h-10 shadow-sm focus:ring-0">
              <SelectValue placeholder="Select test" />
            </SelectTrigger>
            <SelectContent className="border-[#2a3942] bg-[#233138] text-[#d1d7db] rounded-xl shadow-xl">
              {tests.map((test) => (
                <SelectItem key={test._id} value={test._id} className="hover:bg-[#111b21] focus:bg-[#111b21] cursor-pointer rounded-lg py-2">
                  {test.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tests.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[#8696a0]">
            No tests to analyze yet.
          </div>
        ) : dataLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#00a884]" />
          </div>
        ) : !data?.analytics ? (
          <div className="flex h-full items-center justify-center text-sm text-[#8696a0]">
            No students have attempted this test yet.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <StatCard label="Attempts" value={data.analytics.studentsAttempted} />
              <StatCard label="Avg Score" value={Math.round(data.analytics.averageScore * 10) / 10} />
              <StatCard label="Highest" value={data.analytics.highestScore} />
              <StatCard label="Lowest" value={data.analytics.lowestScore} />
            </div>

            <div className="bg-[#111b21] rounded-2xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-[80px_minmax(0,1fr)_90px_90px_90px] gap-3 px-6 py-4 text-xs font-semibold tracking-wider uppercase text-[#8696a0] border-b border-[#202c33]">
                <div>Rank</div>
                <div>Name</div>
                <div className="text-right">MCQ</div>
                <div className="text-right">Code</div>
                <div className="text-right">Total</div>
              </div>

              <div className="divide-y divide-[#202c33]">
                {data.students
                  .sort((a, b) => b.totalScore - a.totalScore)
                  .map((student, index) => (
                    <div
                      key={student.userId?._id || index}
                      className="grid grid-cols-[80px_minmax(0,1fr)_90px_90px_90px] gap-3 items-center px-6 py-4 text-[14.5px] hover:bg-[#202c33]/50 transition-colors"
                    >
                      <div className="text-[#8696a0] font-medium">#{index + 1}</div>
                      <div className="truncate text-[#e9edef] font-medium">
                        {student.userId?.displayName || "Unknown"}
                      </div>
                      <div className="text-right text-[#aebac1]">{student.mcqScore}</div>
                      <div className="text-right text-[#aebac1]">{student.programmingScore}</div>
                      <div className="text-right font-bold text-[#00a884]">{student.totalScore}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-[#111b21] p-5 shadow-sm border border-transparent hover:border-[#2a3942] transition-colors">
      <div className="text-xs uppercase tracking-widest font-semibold text-[#8696a0]">{label}</div>
      <div className="mt-2.5 text-3xl font-bold text-[#e9edef]">{value}</div>
    </div>
  );
}
