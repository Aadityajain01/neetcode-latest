'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { userApi, problemApi, UserStats, mcqApi } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { toast } from 'sonner';
import {
  Code2, Trophy, Target, Users, Loader2,
  Zap, Flame, TrendingUp, Award, BarChart3, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Multi-Segment Donut Component ────────────────────────────────────────────
// Draws a donut chart with Easy (green), Medium (yellow), Hard (red) arc segments
// exactly like LeetCode / TakeUForward style
interface DonutProps {
  easy: number;
  medium: number;
  hard: number;
  total: number;   // total problems available on platform
  solved: number;  // total solved (easy+med+hard)
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function MultiSegmentDonut({ easy, medium, hard, total, solved, size = 200, strokeWidth = 14, label = 'Solved' }: DonutProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeTotal = total > 0 ? total : 1;

  // Each segment's fraction of the full circle
  const easyFrac = easy / safeTotal;
  const medFrac = medium / safeTotal;
  const hardFrac = hard / safeTotal;

  // Cumulative offsets (rotate -90° so arcs start from 12 o'clock)
  const easyOffset = 0;
  const medOffset = easyFrac * circumference;
  const hardOffset = (easyFrac + medFrac) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Glow */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-[40px] scale-75 pointer-events-none" />

      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="currentColor" strokeWidth={strokeWidth}
          fill="transparent" className="text-[#ffffff08]"
        />

        {/* Easy arc (green) */}
        {easy > 0 && (
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="#22c55e" strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${easyFrac * circumference} ${circumference - easyFrac * circumference}`}
            strokeDashoffset={-easyOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        )}

        {/* Medium arc (yellow/amber) */}
        {medium > 0 && (
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="#eab308" strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${medFrac * circumference} ${circumference - medFrac * circumference}`}
            strokeDashoffset={-medOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        )}

        {/* Hard arc (red) */}
        {hard > 0 && (
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="#ef4444" strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${hardFrac * circumference} ${circumference - hardFrac * circumference}`}
            strokeDashoffset={-hardOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        )}
      </svg>

      {/* Center text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black text-white tracking-tight leading-none">{solved}</span>
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">/{total}</span>
        <span className="text-[10px] font-medium text-emerald-500 mt-0.5 flex items-center gap-0.5">
          <span>✓</span> {label}
        </span>
      </div>
    </div>
  );
}

// ─── Difficulty Badge ─────────────────────────────────────────────────────────
function DiffBadge({ label, count, total, color, dotColor }: { label: string; count: number; total: number; color: string; dotColor: string }) {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200",
      "bg-zinc-900/40 border-[#ffffff08] hover:border-[#ffffff15]"
    )}>
      <div className="flex items-center gap-2.5">
        <div className={cn("w-2.5 h-2.5 rounded-full", dotColor)} />
        <span className={cn("text-sm font-semibold", color)}>{label}</span>
      </div>
      <span className="text-sm text-zinc-300 font-mono">
        <span className="text-white font-bold">{count}</span>
        <span className="text-zinc-600">/{total}</span>
      </span>
    </div>
  );
}

// ─── Glass Stat Card ──────────────────────────────────────────────────────────
function GlassStatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent: string }) {
  return (
    <div className="group relative bg-zinc-900/30 border border-[#ffffff08] rounded-2xl p-5 hover:border-[#ffffff18] transition-all duration-300 overflow-hidden">
      <div className={cn("absolute -top-6 -right-6 w-20 h-20 rounded-full blur-[40px] opacity-0 group-hover:opacity-30 transition-opacity duration-500", accent)} />
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-xl bg-zinc-800/60">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user, initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [totalProblems, setTotalProblems] = useState<number>(0);
  const [dsaCounts, setDsaCounts] = useState<{ easy: number; medium: number; hard: number; total: number }>({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [mcqCounts, setMcqCounts] = useState<{ easy: number; medium: number; hard: number; total: number }>({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialized || authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [initialized, isAuthenticated, authLoading, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, problemsData, mcqCountsData, dsaCountsData] = await Promise.all([
        userApi.getStats(),
        problemApi.getProblems({ type: 'dsa', limit: 1000 }),
        mcqApi.getCounts(),
        problemApi.getCounts({ type: 'dsa' })
      ]);

      setStats(statsData);
      setMcqCounts(mcqCountsData);
      setDsaCounts(dsaCountsData);

      let calculatedTotal = 0;
      if (typeof (problemsData as any)?.pagination?.total === 'number') {
        calculatedTotal = (problemsData as any).pagination.total;
      } else if (Array.isArray(problemsData)) {
        calculatedTotal = problemsData.length;
      } else if (problemsData?.problems && Array.isArray(problemsData.problems)) {
        calculatedTotal = problemsData.problems.length;
      }
      setTotalProblems(calculatedTotal);
    } catch (error: any) {
      console.error("Dashboard fetch error:", error);
      toast.error('Failed to sync dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStreak = (s: any) => {
    if (!s) return 0;
    return s.currentStreak || s.streak || s.dailyStreak || s.days || 0;
  };

  // ── Loading State ────
  if (!initialized || authLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500 relative" />
          </div>
          <p className="text-zinc-600 text-sm">Loading your stats...</p>
        </div>
      </MainLayout>
    );
  }

  const currentStreak = getStreak(stats);
  const solved = stats?.problemsSolved || 0;

  // Breakdown from MCQ stats (dashboard uses mcqSolvedBreakdown)
  const mcqEasy = stats?.mcqSolvedBreakdown?.easy || 0;
  const mcqMedium = stats?.mcqSolvedBreakdown?.medium || 0;
  const mcqHard = stats?.mcqSolvedBreakdown?.hard || 0;
  const mcqTotal = mcqEasy + mcqMedium + mcqHard;

  // DSA per-difficulty solved from backend accepted submissions.
  const dsaEasy = stats?.dsaSolvedBreakdown?.easy || 0;
  const dsaMedium = stats?.dsaSolvedBreakdown?.medium || 0;
  const dsaHard = stats?.dsaSolvedBreakdown?.hard || 0;

  const quickLinks = [
    { title: 'DSA Problems', desc: 'Algorithm library', href: '/problems', icon: Code2, color: 'text-emerald-400', glow: 'bg-emerald-500' },
    { title: 'Practice', desc: 'Skill sharpener', href: '/practice', icon: Zap, color: 'text-amber-400', glow: 'bg-amber-500' },
    { title: 'Leaderboard', desc: 'Global rankings', href: '/leaderboard', icon: Trophy, color: 'text-purple-400', glow: 'bg-purple-500' },
    { title: 'Communities', desc: 'Study groups', href: '/communities', icon: Users, color: 'text-blue-400', glow: 'bg-blue-500' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen pb-12 font-sans">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1.5 tracking-tight">
              Welcome back, <span className="text-emerald-400">{user?.displayName || 'Developer'}</span>
            </h1>
            <p className="text-zinc-500 text-sm">Track your progress and keep building momentum.</p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-[#ffffff08] rounded-full text-sm">
            <Flame className={cn("h-4 w-4", currentStreak > 0 ? "text-orange-500 fill-orange-500/30" : "text-zinc-600")} />
            <span className="text-zinc-400">
              Streak: <span className={cn("font-bold", currentStreak > 0 ? "text-orange-400" : "text-zinc-500")}>{currentStreak} days</span>
            </span>
          </div>
        </div>

        {/* ── Main Content ──────────────────────────────────────────────── */}
        <div className="space-y-6">



            {/* ── Progress Rings Row ───────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* DSA Problem Progress */}
              <div className="bg-zinc-900/30 border border-[#ffffff08] rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none" />
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-500" /> Problem Progress
                </h3>
                <div className="flex items-center gap-8">
                  <MultiSegmentDonut
                    easy={dsaEasy} medium={dsaMedium} hard={dsaHard}
                    total={totalProblems} solved={solved}
                    size={170} strokeWidth={13}
                  />
                  <div className="flex-1 space-y-3">
                    <DiffBadge label="Easy" count={dsaEasy} total={dsaCounts.easy} color="text-emerald-400" dotColor="bg-emerald-500" />
                    <DiffBadge label="Medium" count={dsaMedium} total={dsaCounts.medium} color="text-amber-400" dotColor="bg-amber-500" />
                    <DiffBadge label="Hard" count={dsaHard} total={dsaCounts.hard} color="text-red-400" dotColor="bg-red-500" />
                  </div>
                </div>
              </div>

              {/* MCQ Progress */}
              <div className="bg-zinc-900/30 border border-[#ffffff08] rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 blur-[60px] rounded-full pointer-events-none" />
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-400" /> MCQ Progress
                </h3>
                <div className="flex items-center gap-8">
                  <MultiSegmentDonut
                    easy={mcqEasy} medium={mcqMedium} hard={mcqHard}
                    total={mcqCounts.total || 1} solved={mcqTotal}
                    size={170} strokeWidth={13}
                    label="Answered"
                  />
                  <div className="flex-1 space-y-3">
                    <DiffBadge label="Easy" count={mcqEasy} total={mcqCounts.easy} color="text-emerald-400" dotColor="bg-emerald-500" />
                    <DiffBadge label="Medium" count={mcqMedium} total={mcqCounts.medium} color="text-amber-400" dotColor="bg-amber-500" />
                    <DiffBadge label="Hard" count={mcqHard} total={mcqCounts.hard} color="text-red-400" dotColor="bg-red-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Stats Cards ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassStatCard
                icon={<TrendingUp className="h-5 w-5 text-blue-400" />}
                label="Total Score" value={stats?.score || 0} accent="bg-blue-500"
              />
              <GlassStatCard
                icon={<Award className="h-5 w-5 text-amber-400" />}
                label="Global Rank"
                value={stats?.rank ? `#${stats.rank}` : '—'}
                accent="bg-amber-500"
              />
              <GlassStatCard
                icon={<Send className="h-5 w-5 text-purple-400" />}
                label="Submissions" value={stats?.totalSubmissions || 0} accent="bg-purple-500"
              />
              <GlassStatCard
                icon={<Flame className="h-5 w-5 text-orange-400" />}
                label="Day Streak" value={currentStreak} accent="bg-orange-500"
              />
            </div>

            {/* ── Quick Actions ─────────────────────────────────────── */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-yellow-400" /> Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="group">
                    <div className="relative bg-zinc-900/30 border border-[#ffffff08] rounded-2xl p-5 flex flex-col items-center text-center gap-3 hover:border-[#ffffff18] transition-all duration-300 overflow-hidden">
                      <div className={cn("absolute -top-4 -right-4 w-16 h-16 rounded-full blur-[30px] opacity-0 group-hover:opacity-20 transition-opacity duration-500", link.glow)} />
                      <div className="p-3 rounded-2xl bg-zinc-800/50 group-hover:scale-110 transition-transform duration-300">
                        <link.icon className={cn("h-6 w-6", link.color)} />
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-200 text-sm group-hover:text-white transition-colors">{link.title}</p>
                        <p className="text-[11px] text-zinc-600">{link.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
      </div>
    </MainLayout>
  );
}