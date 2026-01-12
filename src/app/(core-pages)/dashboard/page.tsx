'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { userApi, leaderboardApi, problemApi, UserStats, LeaderboardEntry } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Code2,
  Trophy,
  Target,
  Users,
  ChevronRight,
  Loader2,
  Zap,
  Activity,
  Flame,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, initialized, isAuthenticated } = useAuthStore();
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [topLeaderboard, setTopLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [totalProblems, setTotalProblems] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [initialized, isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetching up to 1000 problems to ensure we get an accurate count 
      // if the backend doesn't provide a 'total' metadata field.
      const [statsData, leaderboardData, problemsData] = await Promise.all([
        userApi.getStats(),
        leaderboardApi.getGlobal({ limit: 5 }),
        problemApi.getProblems({ limit: 1000 }) 
      ]);

      // DEBUGGING: Check your console to see exactly what the backend sends!
      console.log("🔍 DASHBOARD DEBUG:", { stats: statsData, problems: problemsData });

      setStats(statsData);
      setTopLeaderboard(leaderboardData || []);

      // INTELLIGENT COUNT LOGIC:
      // 1. Try metadata 'total'
      // 2. Try array length (if problems comes as a direct array)
      // 3. Try .problems array length (if nested)
      // 4. Default to 0 (never 150)
      let calculatedTotal = 0;
      if (typeof problemsData?.total === 'number') {
        calculatedTotal = problemsData.total;
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

  // Safe Streak Accessor
  const getStreak = (s: any) => {
    if (!s) return 0;
    // Checks all common naming conventions
    return s.currentStreak || s.streak || s.dailyStreak || s.days || 0;
  };

  // --- Circular Progress Component ---
  const CircularProgress = ({ value, max, size = 180, strokeWidth = 12 }: { value: number, max: number, size?: number, strokeWidth?: number }) => {
    const safeMax = max > 0 ? max : 10; // Default to 10 if max is 0 to avoid division by zero visuals
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(value / safeMax, 1);
    const dashOffset = circumference - progress * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-75" />
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-zinc-800" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" className="text-emerald-500 transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Solved</span>
        </div>
      </div>
    );
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const quickLinks = [
    { title: 'DSA Problems', description: 'Algorithm library', href: '/problems', icon: Code2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Practice', description: 'Skill sharpener', href: '/practice', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'Leaderboard', description: 'Global rankings', href: '/leaderboard', icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Communities', description: 'Study groups', href: '/communities', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  const currentStreak = getStreak(stats);

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 p-6 md:p-8 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Welcome back, <span className="text-emerald-500">{user?.displayName || 'Developer'}</span>
            </h1>
            <p className="text-zinc-400">Ready to crush some code today?</p>
          </div>
          
          {/* Streak Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-zinc-400 text-sm">
             <Flame className={cn("h-4 w-4", currentStreak > 0 ? "text-orange-500 fill-orange-500/20" : "text-zinc-600")} /> 
             <span>Daily Streak: <span className={cn("font-bold", currentStreak > 0 ? "text-white" : "text-zinc-500")}>
                {currentStreak} Days
             </span></span>
          </div>
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* LEFT COL: Stats Area */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Progress Card */}
              <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-zinc-100 flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-emerald-500" /> Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  {/* Dynamic Total Count */}
                  <CircularProgress value={stats?.problemsSolved || 0} max={totalProblems} />
                  <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
                    <span>Goal: <span className="text-emerald-400 font-bold">{totalProblems}</span> Problems</span>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6">
                <Card className="bg-zinc-900/50 border-zinc-800 flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-500/10 rounded-xl">
                        <Activity className="h-6 w-6 text-blue-500" />
                      </div>
                      <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded">ALL TIME</span>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm font-medium mb-1">Total Score</p>
                      <h3 className="text-4xl font-bold text-white tracking-tight">{stats?.score || 0}</h3>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800 flex flex-col justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-amber-500/10 rounded-xl">
                        <Trophy className="h-6 w-6 text-amber-500" />
                      </div>
                      <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded">GLOBAL</span>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm font-medium mb-1">Current Rank</p>
                      <h3 className="text-4xl font-bold text-white tracking-tight">
                        {stats?.rank ? `#${stats.rank}` : <span className="text-2xl text-zinc-500">-</span>}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" /> Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="group">
                    <Card className="bg-zinc-900 border-zinc-800 h-full hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_20px_-10px_rgba(16,185,129,0.3)]">
                      <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                        <div className={`p-3 rounded-2xl ${link.bg} group-hover:scale-110 transition-transform duration-300`}>
                          <link.icon className={`h-6 w-6 ${link.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{link.title}</p>
                          <p className="text-xs text-zinc-500 line-clamp-1">{link.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Leaderboard (Kept safely mostly empty/protected as requested) */}
          <div className="lg:col-span-1">
             <Card className="bg-zinc-900/80 border-zinc-800 h-full flex flex-col">
              <CardHeader className="border-b border-zinc-800 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" /> Leaderboard
                  </CardTitle>
                  <Link href="/leaderboard">
                    <Button variant="ghost" size="sm" className="text-xs text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 h-8">
                      View All <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {topLeaderboard && topLeaderboard.length > 0 ? (
                  <div className="divide-y divide-zinc-800/50">
                    {topLeaderboard.map((entry, index) => (
                      <div key={entry.userId || index} className="flex items-center gap-4 p-4 hover:bg-zinc-800/30 transition-colors">
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                          ${index === 0 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                            'text-zinc-500 bg-zinc-900'}
                        `}>
                          #{entry.rank || index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">{entry.displayName || 'Anonymous'}</p>
                          <p className="text-xs text-zinc-500 truncate">Score: {entry.score || 0}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2 p-8 opacity-50">
                    <AlertCircle className="h-10 w-10 text-zinc-600" />
                    <p className="text-sm">Leaderboard unavailable</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}