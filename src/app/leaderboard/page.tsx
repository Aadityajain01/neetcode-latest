'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { leaderboardApi, userApi, LeaderboardEntry } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Trophy, Globe, Users, Medal, Crown } from 'lucide-react';

interface CommunityOption {
  id: string;
  name: string;
  type: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, initialized, isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<string>('global'); // 'global' or communityId
  const [communities, setCommunities] = useState<CommunityOption[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);
  
  // Stats for the current view
  const [myStats, setMyStats] = useState<{ rank: number; score: number } | null>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    initPage();
  }, [initialized, isAuthenticated]);

  // Reload rankings when tab changes
  useEffect(() => {
    if (initialized && isAuthenticated) {
      fetchRankings(activeTab);
    }
  }, [activeTab]);

  const initPage = async () => {
    try {
      setLoading(true);
      // 1. Get User's Communities to populate the filter/tabs
      const myCommunities = await userApi.getCommunities();
      
      setCommunities(myCommunities);
    } catch (error) {
      console.log(error);
      toast.error('Failed to load filters');
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async (scope: string) => {
    setRankingLoading(true);
    setLeaderboard([]);
    setMyStats(null);

    try {
      let data: LeaderboardEntry[] = [];
      let stats = null;

      if (scope === 'global') {
        // Fetch Global
        const [lb, me] = await Promise.all([
          leaderboardApi.getGlobal({ limit: 50 }),
          leaderboardApi.getGlobalMe()
        ]);
        data = lb;
        stats = me;
      } else {
        // Fetch specific Community
        const [lb, me] = await Promise.all([
          leaderboardApi.getCommunity(scope, { limit: 50 }),
          leaderboardApi.getCommunityMe(scope)
        ]);
        data = lb;
        stats = me;
      }

      setLeaderboard(data);
      if (stats) {
        setMyStats({ rank: stats.rank, score: stats.score });
      }

    } catch (error: any) {
      console.error(error);
      // If user isn't part of community or other error
      toast.error('Could not load rankings for this selection');
    } finally {
      setRankingLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Medal className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-[#9CA3AF] font-bold w-6 text-center">{rank}</span>;
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#E5E7EB] mb-2 flex items-center gap-2">
          <Trophy className="h-8 w-8 text-[#F59E0B]" /> 
          Leaderboard
        </h1>
        <p className="text-[#9CA3AF]">
          Track your ranking globally or within your communities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Filters */}
        <Card className="bg-[#1E293B] border-[#334155] h-fit lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg text-[#E5E7EB]">View Rankings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Global Button */}
            <Button
              variant={activeTab === 'global' ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${
                activeTab === 'global' 
                  ? 'bg-[#22C55E] text-white hover:bg-[#22C55E]/90' 
                  : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
              }`}
              onClick={() => setActiveTab('global')}
            >
              <Globe className="mr-2 h-4 w-4" />
              Global
            </Button>

            <div className="my-2 border-t border-[#334155]" />
            <p className="px-2 text-xs font-semibold text-[#6B7280] uppercase">Your Communities</p>

            {/* Community Buttons */}
            {communities.length === 0 ? (
              <div className="px-2 py-4 text-sm text-[#9CA3AF] text-center">
                You haven't joined any communities yet.
              </div>
            ) : (
              communities.map((comm) => (
                <Button
                  key={comm.id}
                  variant={activeTab === comm.id ? 'secondary' : 'ghost'}
                  className={`w-full justify-start truncate ${
                    activeTab === comm.id 
                      ? 'bg-[#38BDF8] text-white hover:bg-[#38BDF8]/90' 
                      : 'text-[#9CA3AF] hover:text-[#E5E7EB]'
                  }`}
                  onClick={() => setActiveTab(comm.id)}
                >
                  <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{comm.name}</span>
                </Button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right Content: The List */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Your Stats Banner */}
          {myStats && (
            <Card className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] border-[#334155] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="h-32 w-32 text-white" />
              </div>
              <CardContent className="p-6 flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[#9CA3AF] text-sm mb-1">Your Ranking in</p>
                  <h2 className="text-2xl font-bold text-white">
                    {activeTab === 'global' 
                      ? 'Global Leaderboard' 
                      : communities.find(c => c.id === activeTab)?.name || 'Community'}
                  </h2>
                </div>
                <div className="flex gap-8 text-right">
                  <div>
                    <p className="text-[#9CA3AF] text-xs uppercase tracking-wider">Rank</p>
                    <p className="text-3xl font-bold text-[#F59E0B]">#{myStats.rank}</p>
                  </div>
                  <div>
                    <p className="text-[#9CA3AF] text-xs uppercase tracking-wider">Score</p>
                    <p className="text-3xl font-bold text-[#22C55E]">{myStats.score}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ranking Table */}
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardContent className="p-0">
              {rankingLoading ? (
                 <div className="p-12 flex justify-center">
                   <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
                 </div>
              ) : leaderboard.length === 0 ? (
                 <div className="p-12 text-center text-[#9CA3AF]">
                   No rankings available yet.
                 </div>
              ) : (
                <div className="divide-y divide-[#334155]">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-[#9CA3AF] bg-[#0F172A]/50">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-7">User</div>
                    <div className="col-span-3 text-right">Score</div>
                  </div>

                  {/* Rows */}
                  {leaderboard.map((entry) => {
                    const isMe = entry.userId === user?.id;
                    return (
                      <div 
                        key={entry.userId} 
                        className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${
                          isMe ? 'bg-[#22C55E]/10 border-l-2 border-[#22C55E]' : 'hover:bg-[#0F172A]/30'
                        }`}
                      >
                        <div className="col-span-2 flex justify-center">
                          {getRankBadge(entry.rank)}
                        </div>
                        <div className="col-span-7 flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isMe ? 'bg-[#22C55E] text-white' : 'bg-[#334155] text-[#E5E7EB]'
                          }`}>
                            {entry.displayName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-medium ${isMe ? 'text-[#22C55E]' : 'text-[#E5E7EB]'}`}>
                              {entry.displayName} {isMe && '(You)'}
                            </span>
                            {isMe && <span className="text-[10px] text-[#22C55E]/80">Current User</span>}
                          </div>
                        </div>
                        <div className="col-span-3 text-right">
                          <Badge variant="outline" className="bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20 font-mono">
                            {entry.score}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
}