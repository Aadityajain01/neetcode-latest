"use client";

import { useEffect, useState } from "react";
import { useCommunity } from "@/components/communities/CommunityContext";
import { communityApi, CommunityTest } from "@/lib/api-modules";
import { Loader2, TrendingUp, Users, Target, Activity, BarChart2, Medal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) => (
  <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
    <div>
      <p className="text-xs text-zinc-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

export default function AnalyticsPage() {
  const { community, userRole } = useCommunity();
  const [tests, setTests]             = useState<CommunityTest[]>([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [data, setData]               = useState<AnalyticsData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!community) return;
    communityApi.getTests(community._id).then(d => {
      setTests(d);
      if (d.length > 0) setSelectedTestId(d[0]._id);
    }).catch(() => toast.error("Failed to load tests")).finally(() => setLoading(false));
  }, [community]);

  useEffect(() => {
    if (!community || !selectedTestId) return;
    setDataLoading(true);
    communityApi.getTestAnalytics(community._id, selectedTestId)
      .then(setData)
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setDataLoading(false));
  }, [community, selectedTestId]);

  if (userRole !== "admin" && userRole !== "owner") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-500 text-sm">Admins only.</p>
      </div>
    );
  }

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
            <BarChart2 className="w-5 h-5 text-emerald-500" />
            Classroom Analytics
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Performance metrics for each test.</p>
        </div>
        {tests.length > 0 && (
          <Select value={selectedTestId} onValueChange={setSelectedTestId}>
            <SelectTrigger className="w-full sm:w-52 bg-zinc-900 border-zinc-700 text-sm h-9">
              <SelectValue placeholder="Select test" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
              {tests.map(t => (
                <SelectItem key={t._id} value={t._id} className="focus:bg-zinc-800">{t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {tests.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
          No tests to analyze yet.
        </div>
      ) : dataLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-zinc-500" />
        </div>
      ) : !data?.analytics ? (
        <div className="py-16 text-center text-zinc-500 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
          No students have attempted this test yet.
        </div>
      ) : (
        <div className="space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Attempts"      value={data.analytics.studentsAttempted}                     icon={Users}      color="bg-blue-500/10 text-blue-400" />
            <StatCard label="Avg Score"     value={Math.round(data.analytics.averageScore * 10) / 10}  icon={Activity}   color="bg-emerald-500/10 text-emerald-400" />
            <StatCard label="Highest"       value={data.analytics.highestScore}                          icon={TrendingUp} color="bg-amber-500/10 text-amber-400" />
            <StatCard label="Lowest"        value={data.analytics.lowestScore}                           icon={Target}     color="bg-red-500/10 text-red-400" />
          </div>

          {/* Leaderboard table */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center gap-2">
              <Medal className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Leaderboard</h3>
            </div>
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-zinc-950/40">
                    <th className="px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">#</th>
                    <th className="px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Student</th>
                    <th className="px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">MCQ</th>
                    <th className="px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Code</th>
                    <th className="px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total</th>
                    <th className="px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {data.students.sort((a, b) => b.totalScore - a.totalScore).map((s, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3.5 text-zinc-500 font-mono text-xs w-8">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                            {(s.userId?.displayName?.[0] || "?").toUpperCase()}
                          </div>
                          <span className="text-zinc-200 font-medium text-sm truncate max-w-[120px]">
                            {s.userId?.displayName || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-400 hidden sm:table-cell">{s.mcqScore}</td>
                      <td className="px-5 py-3.5 text-zinc-400 hidden sm:table-cell">{s.programmingScore}</td>
                      <td className="px-5 py-3.5 font-bold text-emerald-400">{s.totalScore}</td>
                      <td className="px-5 py-3.5 text-xs text-zinc-600 hidden md:table-cell">
                        {new Date(s.evaluatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
