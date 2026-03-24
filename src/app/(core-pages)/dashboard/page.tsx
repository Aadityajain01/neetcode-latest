'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { userApi, DashboardPayload } from '@/lib/api-modules/user.api';
import MainLayout from '@/components/layouts/main-layout';
import { toast } from 'sonner';
import {
  Code2, Trophy, Target, Users, Loader2,
  Zap, Flame, TrendingUp, Award, BarChart3, Send, CheckCircle2, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

// ─── Recharts Custom Tooltips ────────────────────────────────────────────────
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700/50 rounded-lg p-3 text-xs shadow-xl backdrop-blur-md">
        <p className="font-bold text-zinc-300">{payload[0].name}</p>
        <p className="font-mono mt-1" style={{ color: payload[0].payload.fill }}>
          Solved: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-lg p-3 text-xs shadow-xl">
        <p className="font-bold text-zinc-300 uppercase tracking-widest border-b border-zinc-800 pb-2 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
           <p key={index} className="font-mono mt-1 flex justify-between items-center gap-4">
             <span style={{ color: entry.color }}>{entry.name}:</span>
             <span className="text-white font-bold">{entry.value}</span>
           </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Minimal Components ──────────────────────────────────────────────────────
function MinimalStatCard({ icon, label, value, colorClass }: { icon: React.ReactNode; label: string; value: string | number; colorClass: string }) {
  return (
    <div className="group relative bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-4 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
        <div className={cn("p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50", colorClass)}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user, initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const isAuthReady = initialized && !authLoading;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated) router.push('/login');
  }, [isAuthReady, isAuthenticated, router]);

  const dashboardQuery = useQuery<DashboardPayload>({
    queryKey: ['dashboard-data', user?.id],
    enabled: isAuthReady && isAuthenticated,
    queryFn: userApi.getDashboard,
  });

  useEffect(() => {
    if (dashboardQuery.error) {
      toast.error('Failed to load dashboard data');
    }
  }, [dashboardQuery.error]);

  const getStreak = (s: any) => s?.currentStreak || s?.streak || s?.dailyStreak || s?.days || 0;

  if (!isAuthReady || (isAuthenticated && dashboardQuery.isLoading) || !mounted) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Compiling Dashboard Data...</p>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated || !dashboardQuery.data) return null;

  const { stats, totalProblems, dsaCounts, mcqCounts } = dashboardQuery.data;
  const currentStreak = getStreak(stats);
  const solved = stats?.problemsSolved || 0;

  const mcqEasy = stats?.mcqSolvedBreakdown?.easy || 0;
  const mcqMedium = stats?.mcqSolvedBreakdown?.medium || 0;
  const mcqHard = stats?.mcqSolvedBreakdown?.hard || 0;
  const mcqTotal = mcqEasy + mcqMedium + mcqHard;

  const dsaEasy = stats?.dsaSolvedBreakdown?.easy || 0;
  const dsaMedium = stats?.dsaSolvedBreakdown?.medium || 0;
  const dsaHard = stats?.dsaSolvedBreakdown?.hard || 0;

  // ─── Graph Data Formats ───
  
  // Custom Pie Colors: Easy (Emerald), Medium (Amber), Hard (Red)
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  
  const dsaPieData = [
    { name: 'Easy', value: dsaEasy, fill: COLORS[0] },
    { name: 'Medium', value: dsaMedium, fill: COLORS[1] },
    { name: 'Hard', value: dsaHard, fill: COLORS[2] },
  ].filter(d => d.value > 0);

  const mcqPieData = [
    { name: 'Easy', value: mcqEasy, fill: COLORS[0] },
    { name: 'Medium', value: mcqMedium, fill: COLORS[1] },
    { name: 'Hard', value: mcqHard, fill: COLORS[2] },
  ].filter(d => d.value > 0);

  // Fallback data if 0 solves
  if (dsaPieData.length === 0) dsaPieData.push({ name: 'Unsolved', value: 1, fill: '#27272a' });
  if (mcqPieData.length === 0) mcqPieData.push({ name: 'Unsolved', value: 1, fill: '#27272a' });

  // Comparison Bar Chart
  const comparisonData = [
    { name: 'Easy', DSA: dsaEasy, MCQ: mcqEasy },
    { name: 'Medium', DSA: dsaMedium, MCQ: mcqMedium },
    { name: 'Hard', DSA: dsaHard, MCQ: mcqHard },
  ];

  const quickLinks = [
    { title: 'DSA Problems', desc: 'Core algorithms', href: '/problems', icon: Code2, color: 'text-emerald-400', hoverBg: 'hover:bg-emerald-500/10 hover:border-emerald-500/30' },
    { title: 'MCQ Practice', desc: 'Sharpen syntax', href: '/practice', icon: Zap, color: 'text-amber-400', hoverBg: 'hover:bg-amber-500/10 hover:border-amber-500/30' },
    { title: 'Leaderboard', desc: 'Global ranks', href: '/leaderboard', icon: Trophy, color: 'text-purple-400', hoverBg: 'hover:bg-purple-500/10 hover:border-purple-500/30' },
    { title: 'Communities', desc: 'Study groups', href: '/communities', icon: Users, color: 'text-blue-400', hoverBg: 'hover:bg-blue-500/10 hover:border-blue-500/30' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen pb-12 font-sans max-w-6xl mx-auto pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-white/5 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Platform Active
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{user?.displayName || 'Developer'}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 px-5 py-3 bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl">
            <div className={cn("p-2 rounded-xl", currentStreak > 0 ? "bg-orange-500/10 text-orange-500" : "bg-zinc-800 text-zinc-500")}>
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Streak</p>
              <p className="text-xl font-black text-white leading-none tracking-tight">{currentStreak} <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest ml-1">days</span></p>
            </div>
          </div>
        </div>

        {/* ── Top Core Stats Row ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MinimalStatCard icon={<TrendingUp className="h-4 w-4" />} label="Total Score" value={stats?.score || 0} colorClass="text-blue-400" />
          <MinimalStatCard icon={<Award className="h-4 w-4" />} label="Global Rank" value={stats?.rank ? `#${stats.rank}` : '—'} colorClass="text-amber-400" />
          <MinimalStatCard icon={<Send className="h-4 w-4" />} label="Submissions" value={stats?.totalSubmissions || 0} colorClass="text-purple-400" />
          <MinimalStatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Accuracy" value={`${stats?.totalSubmissions ? Math.round((solved / stats.totalSubmissions) * 100) : 0}%`} colorClass="text-emerald-400" />
        </div>

        {/* ── Advanced Bento Visualizations ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* 1. DSA Pie Chart */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-5 relative overflow-hidden flex flex-col items-center col-span-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="w-full flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-emerald-400" />
              <h3 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Algorithms (DSA)</h3>
            </div>
            
            <div className="w-full h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={dsaPieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {dsaPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} style={{ filter: entry.name !== 'Unsolved' ? `drop-shadow(0px 0px 6px ${entry.fill}40)` : 'none' }} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">{solved}</span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">/ {totalProblems}</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-3 gap-2 mt-2">
               <SkillPill label="Easy" count={dsaEasy} color="text-emerald-400" bg="bg-emerald-500/10" dot="bg-emerald-500" />
               <SkillPill label="Med" count={dsaMedium} color="text-amber-400" bg="bg-amber-500/10" dot="bg-amber-500" />
               <SkillPill label="Hard" count={dsaHard} color="text-red-400" bg="bg-red-500/10" dot="bg-red-500" />
            </div>
          </div>

          {/* 2. Side-by-side Bar Chart (DSA vs MCQ Comparison) */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-5 col-span-1 lg:col-span-1 flex flex-col relative overflow-hidden">
             <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
             <div className="w-full flex flex-col mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-blue-400" />
                <h3 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Performance Split</h3>
              </div>
              <p className="text-[10px] text-zinc-500">DSA vs MCQ across difficulties</p>
            </div>

            <div className="w-full flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} barGap={2} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 600, paddingTop: '10px' }} />
                  <Bar dataKey="DSA" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="MCQ" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. MCQ Pie Chart */}
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-5 relative overflow-hidden flex flex-col items-center col-span-1">
            <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500/5 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="w-full flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              <h3 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Knowledge (MCQ)</h3>
            </div>
            
            <div className="w-full h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={mcqPieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {mcqPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} style={{ filter: entry.name !== 'Unsolved' ? `drop-shadow(0px 0px 6px ${entry.fill}40)` : 'none' }} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">{mcqTotal}</span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">/ {mcqCounts.total || 1}</span>
              </div>
            </div>

             <div className="w-full grid grid-cols-3 gap-2 mt-2">
               <SkillPill label="Easy" count={mcqEasy} color="text-emerald-400" bg="bg-emerald-500/10" dot="bg-emerald-500" />
               <SkillPill label="Med" count={mcqMedium} color="text-amber-400" bg="bg-amber-500/10" dot="bg-amber-500" />
               <SkillPill label="Hard" count={mcqHard} color="text-red-400" bg="bg-red-500/10" dot="bg-red-500" />
            </div>
          </div>
        </div>

        {/* ── Action Grid ──────────────────────────────────────── */}
        <div>
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-1">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="group outline-none">
                <div className={cn("bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300", link.hoverBg)}>
                  <div className="p-2 w-fit rounded-lg bg-zinc-800/50 group-hover:scale-110 transition-transform duration-300">
                    <link.icon className={cn("h-4 w-4", link.color)} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-[13px] tracking-tight mb-0.5">{link.title}</p>
                    <p className="text-[10px] font-medium text-zinc-500">{link.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function SkillPill({ label, count, color, bg, dot }: { label: string, count: number, color: string, bg: string, dot: string }) {
  return (
     <div className={cn("rounded-xl p-2 flex flex-col items-center justify-center gap-1 border border-zinc-800/60", bg)}>
       <div className="flex items-center gap-1.5">
         <div className={cn("w-1.5 h-1.5 rounded-full", dot)} />
         <span className={cn("text-[9px] font-bold uppercase tracking-widest", color)}>{label}</span>
       </div>
       <span className="text-sm font-mono font-bold text-white">{count}</span>
     </div>
  );
}