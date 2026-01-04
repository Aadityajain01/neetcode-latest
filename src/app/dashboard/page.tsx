'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { userApi, leaderboardApi } from '@/lib/api-modules';
import { UserStats, LeaderboardEntry } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Code2,
  Trophy,
  Target,
  BookOpen,
  Users,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, initialized, isAuthenticated, isLoading, logout } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [topLeaderboard, setTopLeaderboard] = useState<LeaderboardEntry[]>([]);
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
      const [statsData, leaderboardData] = await Promise.all([
        userApi.getStats(),
        leaderboardApi.getGlobal({ limit: 5 }),
      ]);

      setStats(statsData);
      setTopLeaderboard(leaderboardData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Score',
      value: stats?.score || 0,
      icon: Trophy,
      color: 'text-[#22C55E]',
      bgColor: 'bg-[#22C55E]/10',
    },
    {
      title: 'Problems Solved',
      value: stats?.problemsSolved || 0,
      icon: Target,
      color: 'text-[#38BDF8]',
      bgColor: 'bg-[#38BDF8]/10',
    },
    {
      title: 'Rank',
      value: stats?.rank || 0,
      icon: BookOpen,
      color: 'text-[#F59E0B]',
      bgColor: 'bg-[#F59E0B]/10',
    },
    {
      title: 'Submissions',
      value: stats?.totalSubmissions || 0,
      icon: Code2,
      color: 'text-[#A855F7]',
      bgColor: 'bg-[#A855F7]/10',
    },
  ];

  const quickLinks = [
    { title: 'DSA Problems', description: 'Solve algorithm problems', href: '/problems', icon: Code2 },
    { title: 'Practice', description: 'Practice programming', href: '/practice', icon: BookOpen },
    { title: 'MCQs', description: 'Test your knowledge', href: '/mcqs', icon: Target },
    { title: 'Leaderboard', description: 'View rankings', href: '/leaderboard', icon: Trophy },
    { title: 'Communities', description: 'Join groups', href: '/communities', icon: Users },
  ];

  return (
    <MainLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#E5E7EB] mb-2">
          Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
        </h2>
        <p className="text-[#9CA3AF]">Ready to solve some problems?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="bg-[#1E293B] border-[#334155]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#9CA3AF] mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-[#E5E7EB]">{card.value}</p>
                  </div>
                  <div className={`${card.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-[#E5E7EB] mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="bg-[#1E293B] border-[#334155] hover:border-[#22C55E] transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#22C55E]/10 p-2 rounded-lg">
                          <Icon className="h-5 w-5 text-[#22C55E]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#E5E7EB]">{link.title}</p>
                          <p className="text-sm text-[#9CA3AF]">{link.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#9CA3AF]" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Preview */}
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#E5E7EB]">Top Performers</CardTitle>
              <CardDescription className="text-[#9CA3AF]">
                Global leaderboard leaders
              </CardDescription>
            </div>
            <Link href="/leaderboard">
              <Button variant="outline" className="border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {topLeaderboard.length > 0 ? (
            <div className="space-y-2">
              {topLeaderboard.map((entry, index) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${
                      index === 0 ? 'text-[#F59E0B]' :
                      index === 1 ? 'text-[#9CA3AF]' :
                      index === 2 ? 'text-[#A855F7]' :
                      'text-[#E5E7EB]'
                    }`}>
                      #{entry.rank}
                    </span>
                    <span className="text-[#E5E7EB]">{entry.displayName}</span>
                  </div>
                  <span className="font-semibold text-[#22C55E]">{entry.score}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#9CA3AF] py-8">No leaderboard data yet</p>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
