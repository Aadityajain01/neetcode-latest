'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // ✅ Import Link for profile clicking
import { useAuthStore } from '@/store/auth-store';
import { leaderboardApi, userApi, LeaderboardEntry } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
// ✅ Import Avatar components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { toast } from 'sonner';
import { Loader2, Trophy, Globe, Users, Medal, Crown, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityOption {
  id: string;
  name: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, initialized, isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<string>('global');
  const [communities, setCommunities] = useState<CommunityOption[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [myStats, setMyStats] = useState<{ rank: number; score: number } | null>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    initPage();
  }, [initialized, isAuthenticated, router]);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      fetchRankings(activeTab);
    }
  }, [activeTab, initialized, isAuthenticated]);

  const initPage = async () => {
    try {
      setLoading(true);
      const myCommunities = await userApi.getCommunities(user?.id);
      const formatted = (myCommunities || []).map((c: any) => ({
        id: c.id || c._id,
        name: c.name
      }));
      setCommunities(formatted);
    } catch (error) {
      toast.error('Failed to load community filters');
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async (scope: string) => {
    setRankingLoading(true);
    setLeaderboard([]);
    setMyStats(null);

    try {
      const listPromise = scope === 'global' 
        ? leaderboardApi.getGlobal({ limit: 50 }) 
        : leaderboardApi.getCommunity(scope, { limit: 50 });

      const statsPromise = scope === 'global'
        ? leaderboardApi.getGlobalMe().catch(() => null)
        : leaderboardApi.getCommunityMe(scope).catch(() => null);

      const [data, stats] = await Promise.all([listPromise, statsPromise]);

      const processed = (data || [])
        .filter(entry => entry.displayName !== 'Anonymous' && entry.displayName !== 'admin')
        .slice(0, 10);

      setLeaderboard(processed);

      const myEntryInList = processed.find(entry => entry.userId === user?.id);

      if (myEntryInList) {
        setMyStats({ rank: myEntryInList.rank, score: myEntryInList.score });
      } else if (stats) {
        setMyStats({ rank: stats.rank, score: stats.score });
      }

    } catch (error) {
      toast.error('Could not load rankings');
    } finally {
      setRankingLoading(false);
    }
  };

  const isMeInTop10 = useMemo(() => {
    return leaderboard.some(entry => entry.userId === user?.id);
  }, [leaderboard, user]);

  // --- UI HELPERS ---

  const getRankStyles = (rank: number) => {
    switch(rank) {
      case 1: return { 
        icon: <Crown className="h-5 w-5 text-amber-400 fill-amber-400/20" />, 
        color: "text-amber-400", 
        bg: "bg-amber-400/5 border-amber-400/20 shadow-[0_0_15px_-3px_rgba(251,191,36,0.2)]" 
      };
      case 2: return { 
        icon: <Medal className="h-5 w-5 text-slate-300 fill-slate-300/20" />, 
        color: "text-slate-300", 
        bg: "bg-slate-300/5 border-slate-300/20" 
      };
      case 3: return { 
        icon: <Medal className="h-5 w-5 text-amber-700 fill-amber-700/20" />, 
        color: "text-amber-700", 
        bg: "bg-amber-700/5 border-amber-700/20" 
      };
      default: return { 
        icon: <span className="text-zinc-500 font-mono font-bold text-sm">#{rank}</span>, 
        color: "text-zinc-400", 
        bg: "hover:bg-zinc-800/50 border-transparent" 
      };
    }
  };

  const LeaderboardRow = ({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) => {
    const style = getRankStyles(entry.rank);
    
    return (
      // ✅ LINK WRAPPER: Makes the entire row clickable to visit profile
      <Link href={`/profile/${entry.userId}`} className="block">
        <div className={cn(
          "group relative grid grid-cols-12 gap-4 p-4 items-center rounded-xl border transition-all duration-200 cursor-pointer",
          isMe ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]" : style.bg
        )}>
          {/* Rank Column */}
          <div className="col-span-2 flex justify-center items-center">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", isMe && "bg-emerald-500/20")}>
              {style.icon}
            </div>
          </div>

          {/* User Info Column */}
          <div className="col-span-7 flex items-center gap-4">
            
            {/* ✅ AVATAR COMPONENT: Shows image if available, else initials */}
            <Avatar className={cn(
                "h-10 w-10 ring-2 ring-offset-2 ring-offset-zinc-950 transition-transform group-hover:scale-105",
                isMe ? "ring-emerald-500/30" : "ring-zinc-800"
            )}>
                <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
                <AvatarFallback className={cn("font-bold text-sm flex items-center justify-center h-full w-full rounded-full", isMe ? "bg-emerald-500 text-white" : "bg-zinc-800 text-zinc-400")}>
                    {(entry.displayName || '??').slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className={cn(
                "font-medium truncate",
                isMe ? "text-emerald-400" : "text-zinc-200 group-hover:text-white"
              )}>
                {entry.displayName} {isMe && '(You)'}
              </span>
              {isMe && <span className="text-[10px] uppercase tracking-wider text-emerald-500/70 font-semibold">Current User</span>}
            </div>
          </div>

          {/* Score Column */}
          <div className="col-span-3 text-right">
            <span className={cn(
              "font-mono font-bold text-lg",
              isMe ? "text-emerald-400" : "text-zinc-400 group-hover:text-zinc-200"
            )}>
              {entry.score}
            </span>
            <span className="text-xs text-zinc-600 block">pts</span>
          </div>
        </div>
      </Link>
    );
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-zinc-500 text-sm animate-pulse">Loading Leaderboard...</p>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12 font-sans selection:bg-emerald-500/30">
        
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-12 space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <Trophy className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Leaderboard
            </h1>
          </div>
          <p className="text-zinc-400 ml-16 max-w-2xl">
            See where you stand amongst the best developers in the community.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl sticky top-24">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">
                Ranking Scope
              </h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between h-12 rounded-xl text-sm font-medium transition-all duration-200",
                    activeTab === 'global' 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600" 
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  )}
                  onClick={() => setActiveTab('global')}
                >
                  <span className="flex items-center gap-3"><Globe className="h-4 w-4" /> Global</span>
                  {activeTab === 'global' && <ChevronRight className="h-4 w-4 opacity-50" />}
                </Button>

                <div className="h-px bg-zinc-800 my-4 mx-2" />

                <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2 px-2">
                  Your Communities
                </h3>
                
                {communities.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-zinc-600 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
                    No communities joined yet.
                  </div>
                ) : (
                  communities.map((comm) => (
                    <Button
                      key={comm.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-between h-10 rounded-lg text-sm transition-all",
                        activeTab === comm.id 
                          ? "bg-zinc-800 text-emerald-400 border border-zinc-700" 
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                      )}
                      onClick={() => setActiveTab(comm.id)}
                    >
                      <span className="flex items-center gap-3 truncate">
                        <Users className="h-4 w-4" /> 
                        <span className="truncate max-w-[140px]">{comm.name}</span>
                      </span>
                    </Button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* User Stats Hero Card */}
            {myStats && (
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 shadow-2xl">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
                
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Your Performance</p>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-1">
                      {activeTab === 'global' ? 'Global Ranking' : communities.find(c => c.id === activeTab)?.name}
                    </h2>
                    <p className="text-zinc-400 text-sm">Keep solving problems to improve your standing.</p>
                  </div>

                  <div className="flex gap-4 md:gap-12 w-full md:w-auto bg-zinc-950/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="text-center flex-1 md:flex-none">
                      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Current Rank</p>
                      <p className="text-4xl font-black text-white">#{myStats.rank}</p>
                    </div>
                    <div className="w-px bg-zinc-800" />
                    <div className="text-center flex-1 md:flex-none">
                      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Total Score</p>
                      <p className="text-4xl font-black text-emerald-500">{myStats.score}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard List */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm min-h-[500px]">
              {rankingLoading ? (
                <div className="h-full flex flex-col items-center justify-center min-h-[400px] gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  <span className="text-zinc-500 text-sm">Fetching latest scores...</span>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-zinc-500 gap-2">
                  <Users className="h-12 w-12 opacity-20" />
                  <p>No rankings found for this category yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-4 px-4 pb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-7">Developer</div>
                    <div className="col-span-3 text-right">Score</div>
                  </div>
                  
                  {leaderboard.map((entry) => (
                    <LeaderboardRow key={entry.userId} entry={entry} isMe={entry.userId === user?.id} />
                  ))}

                  {/* If user is not in top 10, show a divider and then the user */}
                  {!isMeInTop10 && myStats && user && (
                    <>
                      <div className="py-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-500 text-xs">
                          <span className="h-1 w-1 rounded-full bg-zinc-500" />
                          <span className="h-1 w-1 rounded-full bg-zinc-500" />
                          <span className="h-1 w-1 rounded-full bg-zinc-500" />
                        </div>
                      </div>
                      <LeaderboardRow 
                        entry={{ 
                          userId: user.id, 
                          displayName: user.displayName || 'You', 
                          // ✅ Cast to allow avatarUrl if your auth store type isn't fully updated yet, though it should be
                          avatarUrl: (user as any).avatarUrl,
                          score: myStats.score, 
                          rank: myStats.rank 
                        }} 
                        isMe={true} 
                      />
                    </>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </MainLayout>
  );
}