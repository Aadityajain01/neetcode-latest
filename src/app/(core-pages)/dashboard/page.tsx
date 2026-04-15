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
  Code2, Trophy, Target, Users,
  Zap, Flame, TrendingUp, Award, BarChart3, Send, CheckCircle2, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardPageSkeleton } from '@/components/skeletons/site-skeletons';
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
    <div className="group relative bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-3 2xl:p-4 hover:bg-zinc-800/40 hover:border-zinc-700/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-1.5">
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
        <div className={cn("p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50", colorClass)}>
          {icon}
        </div>
      </div>
      <p className="text-xl md:text-2xl font-black text-white tracking-tighter">{value}</p>
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
        <DashboardPageSkeleton />
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

  if (dsaPieData.length === 0) dsaPieData.push({ name: 'Unsolved', value: 1, fill: '#27272a' });
  if (mcqPieData.length === 0) mcqPieData.push({ name: 'Unsolved', value: 1, fill: '#27272a' });

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
      {/* Viewport-locked dashboard — fills exactly the available space */}
      <div className="h-auto lg:h-full overflow-y-auto lg:overflow-hidden font-sans max-w-7xl mx-auto p-3 sm:p-4 md:p-5 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-widest mb-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Platform Active
            </div>
            <h1 className="text-xl md:text-2xl xl:text-3xl font-black text-white tracking-tighter leading-none mb-0.5">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{user?.displayName || 'Developer'}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-xl shrink-0 shadow-sm w-fit">
            <div className={cn("p-1.5 rounded-lg", currentStreak > 0 ? "bg-orange-500/10 text-orange-500" : "bg-zinc-800 text-zinc-500")}>
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-0.5">Active Streak</p>
              <p className="text-sm xl:text-base font-black text-white leading-none tracking-tight">{currentStreak} <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest ml-1">days</span></p>
            </div>
          </div>
        </div>

        {/* ── Main Layout Box ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3 xl:gap-4 min-h-0 overflow-visible lg:overflow-hidden">
          
          {/* Left Column (Stats + Nav) */}
          <div className="flex flex-col gap-3 xl:gap-4 w-full lg:w-[320px] xl:w-[340px] shrink-0 min-h-0">
            {/* Top 4 Stats (Grid 2x2 on Desktop) */}
            <div className="grid grid-cols-2 gap-2.5 shrink-0">
              <MinimalStatCard icon={<TrendingUp className="h-3.5 w-3.5" />} label="Score" value={stats?.score || 0} colorClass="text-blue-400" />
              <MinimalStatCard icon={<Award className="h-3.5 w-3.5" />} label="Rank" value={stats?.rank ? `#${stats.rank}` : '—'} colorClass="text-amber-400" />
              <MinimalStatCard icon={<Send className="h-3.5 w-3.5" />} label="Submits" value={stats?.totalSubmissions || 0} colorClass="text-purple-400" />
              <MinimalStatCard icon={<CheckCircle2 className="h-3.5 w-3.5" />} label="Accuracy" value={`${stats?.totalSubmissions ? Math.round((solved / stats.totalSubmissions) * 100) : 0}%`} colorClass="text-emerald-400" />
            </div>

            {/* Quick Links */}
            <div className="flex-1 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-2.5 xl:p-3 flex flex-col min-h-0 shadow-sm overflow-hidden">
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 shrink-0 px-1">Quick Navigation</h3>
              <div className="flex-1 flex flex-col justify-around min-h-0 overflow-hidden pr-1">
                {quickLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="group outline-none">
                    <div className={cn("bg-zinc-900/40 rounded-xl p-2.5 xl:p-3 flex items-center gap-3 transition-all duration-300 border border-transparent shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]", link.hoverBg)}>
                      <div className="p-1.5 rounded-lg bg-zinc-800/50 group-hover:scale-110 transition-transform duration-300">
                        <link.icon className={cn("h-4 w-4", link.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-[11px] xl:text-[12px] tracking-tight truncate leading-none mb-1">{link.title}</p>
                        <p className="text-[9px] font-medium text-zinc-500 truncate leading-none">{link.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Charts + Wide Banner) */}
          <div className="flex-1 flex flex-col gap-3 xl:gap-4 min-w-0 min-h-0 overflow-visible lg:overflow-hidden">
             
             {/* Top Row: 3 Square-ish Charts */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 xl:gap-4 lg:flex-[3] min-h-0 overflow-visible lg:overflow-hidden">
               {/* 1. DSA Pie Chart */}
               <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl py-3 px-3 xl:p-4 relative overflow-hidden flex flex-col items-center min-h-0 shadow-sm">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[30px] rounded-full pointer-events-none" />
                 <div className="w-full flex items-center gap-1.5 mb-1 shrink-0 z-10">
                   <Target className="h-3 w-3 text-emerald-400" />
                   <h3 className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase">DSA</h3>
                 </div>
                 
                 <div className="w-full flex-1 relative min-h-[140px] lg:min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <RechartsTooltip content={<CustomPieTooltip />} />
                       <Pie data={dsaPieData} cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" paddingAngle={4} dataKey="value" stroke="none">
                         {dsaPieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} style={{ filter: entry.name !== 'Unsolved' ? `drop-shadow(0px 0px 4px ${entry.fill}40)` : 'none' }} />
                         ))}
                       </Pie>
                     </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-xl xl:text-2xl font-black text-white tracking-tighter drop-shadow-md leading-none">{solved}</span>
                     <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">/ {totalProblems}</span>
                   </div>
                 </div>

                 <div className="w-full grid grid-cols-3 gap-1 xl:gap-1.5 mt-1 xl:mt-2 shrink-0 z-10 text-center">
                    <SkillPill label="Easy" count={dsaEasy} color="text-emerald-400" bg="bg-emerald-500/10" dot="bg-emerald-500" />
                    <SkillPill label="Med" count={dsaMedium} color="text-amber-400" bg="bg-amber-500/10" dot="bg-amber-500" />
                    <SkillPill label="Hard" count={dsaHard} color="text-red-400" bg="bg-red-500/10" dot="bg-red-500" />
                 </div>
               </div>

               {/* 2. Side-by-side Bar Chart */}
               <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl py-3 px-3 xl:p-4 flex flex-col relative overflow-hidden min-h-0 shadow-sm">
                  <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/10 blur-[30px] rounded-full pointer-events-none" />
                  
                  <div className="w-full flex items-center gap-1.5 shrink-0 mb-1 z-10">
                    <Activity className="h-3 w-3 text-blue-400" />
                    <h3 className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase">Breakdown</h3>
                  </div>
                  <p className="text-[8px] text-zinc-500 mb-0.5 shrink-0 z-10">DSA vs MCQ difficulties</p>

                 <div className="w-full flex-1 relative min-h-[180px] lg:min-h-0 ml-[-10px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={comparisonData} margin={{ top: 10, right: 0, left: -20, bottom: -5 }} barGap={2} barSize={8}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                       <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 8, fontWeight: 700 }} tickLine={false} axisLine={false} />
                       <YAxis tick={{ fill: '#71717a', fontSize: 8 }} tickLine={false} axisLine={false} />
                       <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
                       <Legend iconType="circle" wrapperStyle={{ fontSize: '8px', fontWeight: 600, paddingTop: '5px' }} />
                       <Bar dataKey="DSA" fill="#10b981" radius={[2, 2, 0, 0]} />
                       <Bar dataKey="MCQ" fill="#a855f7" radius={[2, 2, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </div>

               {/* 3. MCQ Pie Chart */}
               <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl py-3 px-3 xl:p-4 relative overflow-hidden flex flex-col items-center min-h-0 shadow-sm">
                 <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/5 blur-[30px] rounded-full pointer-events-none" />
                 <div className="w-full flex items-center gap-1.5 mb-1 shrink-0 z-10">
                   <BarChart3 className="h-3 w-3 text-purple-400" />
                   <h3 className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase">MCQ</h3>
                 </div>
                 
                 <div className="w-full flex-1 relative min-h-[140px] lg:min-h-0">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <RechartsTooltip content={<CustomPieTooltip />} />
                       <Pie data={mcqPieData} cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" paddingAngle={4} dataKey="value" stroke="none">
                         {mcqPieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.fill} style={{ filter: entry.name !== 'Unsolved' ? `drop-shadow(0px 0px 4px ${entry.fill}40)` : 'none' }} />
                         ))}
                       </Pie>
                     </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-xl xl:text-2xl font-black text-white tracking-tighter drop-shadow-md leading-none">{mcqTotal}</span>
                     <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">/ {mcqCounts.total || 1}</span>
                   </div>
                 </div>

                  <div className="w-full grid grid-cols-3 gap-1 xl:gap-1.5 mt-1 xl:mt-2 shrink-0 z-10 text-center">
                    <SkillPill label="Easy" count={mcqEasy} color="text-emerald-400" bg="bg-emerald-500/10" dot="bg-emerald-500" />
                    <SkillPill label="Med" count={mcqMedium} color="text-amber-400" bg="bg-amber-500/10" dot="bg-amber-500" />
                    <SkillPill label="Hard" count={mcqHard} color="text-red-400" bg="bg-red-500/10" dot="bg-red-500" />
                 </div>
               </div>
             </div>

             {/* Bottom Row: Mastery Tile */}
             <div className="shrink-0 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-4 xl:p-5 relative overflow-hidden flex flex-col justify-center shadow-sm w-full">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
                 
                 <div className="relative z-10 flex flex-row items-end justify-between w-full mb-3 gap-3">
                    <div className="flex flex-col">
                       <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-bold uppercase tracking-widest mb-1.5 w-fit">
                          <Target className="h-2.5 w-2.5" /> Overall Mastery
                       </div>
                       <h2 className="text-base md:text-lg font-black text-white tracking-tight leading-none mb-1">
                         Platform Completion Rate
                       </h2>
                       <p className="text-[9px] md:text-[10px] text-zinc-400 font-medium leading-none">
                         Valid consistent coding problem solving rate.
                       </p>
                    </div>
                    
                    <div className="text-right shrink-0">
                       <p className="text-3xl font-black text-emerald-400 tracking-tighter leading-none">
                          {totalProblems > 0 ? Math.round((solved / totalProblems) * 100) : 0}<span className="text-base text-emerald-500/50 ml-0.5">%</span>
                       </p>
                    </div>
                 </div>

                 {/* Wide Progress Bar */}
                 <div className="relative z-10 w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80 mb-1.5 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      style={{ width: `${totalProblems > 0 ? Math.max(0, (solved / totalProblems) * 100) : 0}%` }}
                    />
                 </div>
                 
                 <div className="w-full flex justify-between relative z-10">
                    <span className="text-[8px] xl:text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" /> {solved} Solved</span>
                    <span className="text-[8px] xl:text-[9px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:inline">{totalProblems} Total Verified Questions</span>
                 </div>
             </div>

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