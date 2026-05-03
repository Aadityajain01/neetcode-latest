"use client";

import React, { useEffect, useState } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin, Calendar, Globe, X,
  Flame, Trophy, Target, Zap, Users, Crown,
  ChevronRight, Hash, TrendingUp, Send, BarChart3, Activity, ArrowLeft
} from "lucide-react";
import { format, eachDayOfInterval, startOfYear, endOfYear } from "date-fns";
import { useRouter, useParams } from "next/navigation";
import { profileApi } from "@/lib/api-modules/profile.api";
import { problemApi } from "@/lib/api-modules";

import { GitHubIcon, LinkedInIcon, XIcon as BrandXIcon } from "@/components/icons/brand-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { ProfileContentSkeleton } from '@/components/skeletons/inline-skeletons';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SocialLinks { github?: string; linkedin?: string; website?: string; twitter?: string; }
interface UserDetails { _id: string; displayName?: string; username?: string; email: string; avatarUrl?: string; bio?: string; socialLinks?: SocialLinks; createdAt: string; }
interface ProfileStats { score: number; rank: number; totalSubmissions: number; solvedBreakdown: { easy: number; medium: number; hard: number; total: number; }; mcqSolvedBreakdown?: { easy: number; medium: number; hard: number; total: number; }; }
interface ActivityData { heatmap: Array<{ _id: string; count: number }>; recent: Array<{ _id: string; problemId: { title: string; difficulty: string; slug: string }; status: string; createdAt: string; }>; }
interface Community { id: string; name: string; role: string; }
interface ProfileResponse { details: UserDetails; stats: ProfileStats; activity: ActivityData; communities: Community[]; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateFullYearData = (backendData: Array<{ _id: string; count: number }>) => {
  const today = new Date();
  const start = startOfYear(today);
  const end = endOfYear(today);
  const dataMap = new Map<string, number>();
  backendData.forEach(item => dataMap.set(item._id, item.count));
  return eachDayOfInterval({ start, end }).map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const count = dataMap.get(dateStr) || 0;
    let level = 0;
    if (count >= 1) level = 1;
    if (count > 1) level = 2;
    if (count > 3) level = 3;
    if (count > 6) level = 4;
    return { date: dateStr, count, level };
  });
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs shadow-xl">
        <p className="font-bold text-zinc-300">{payload[0].payload.subject}</p>
        <p className="text-emerald-400 font-mono mt-1">DSA Solved: {payload[0].value}</p>
        {payload[1] && <p className="text-purple-400 font-mono">MCQ Solved: {payload[1].value}</p>}
      </div>
    );
  }
  return null;
};

// ─── Public Profile Page ──────────────────────────────────────────────────────
export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { initialized, isLoading: authLoading, isAuthenticated } = useAuthStore();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [data, setData] = useState<ProfileResponse | null>(null);
  const [dsaCounts, setDsaCounts] = useState<{ easy: number; medium: number; hard: number; total: number }>({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!initialized || authLoading) return;
      if (!isAuthenticated) { router.push("/login"); return; }
      if (!userId) return;

      try {
        setLoading(true);
        const [res, dsaCountsRes] = await Promise.all([
          profileApi.getProfileById(userId),
          problemApi.getCounts({ type: "dsa" }),
        ]);
        
        const json = res.data;
        if (json.profile) setData(json.profile);
        else setData(json as unknown as ProfileResponse);
        
        setDsaCounts(dsaCountsRes);
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, [userId, initialized, authLoading, isAuthenticated, router]);

  const myCommunities = data?.communities.filter(c => ['OWNER', 'ADMIN'].includes(c.role.toUpperCase())) || [];
  const joinedCommunities = data?.communities.filter(c => !['OWNER', 'ADMIN'].includes(c.role.toUpperCase())) || [];
  const calendarData = data ? generateFullYearData(data.activity.heatmap) : [];

  const radarData = data ? [
    { subject: 'Easy', DSA: data.stats.solvedBreakdown.easy, MCQ: data.stats.mcqSolvedBreakdown?.easy || 0, fullMark: Math.max(dsaCounts.easy, 1) },
    { subject: 'Medium', DSA: data.stats.solvedBreakdown.medium, MCQ: data.stats.mcqSolvedBreakdown?.medium || 0, fullMark: Math.max(dsaCounts.medium, 1) },
    { subject: 'Hard', DSA: data.stats.solvedBreakdown.hard, MCQ: data.stats.mcqSolvedBreakdown?.hard || 0, fullMark: Math.max(dsaCounts.hard, 1) },
  ] : [];

  return (
    <>
      {/* Profile is content-heavy — allow internal scroll within the viewport-locked layout */}
      <div className="h-full overflow-y-auto scrollbar-emerald">
      <div className="font-sans pb-20 max-w-5xl mx-auto pt-4 px-4 sm:px-6">

        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 text-xs font-bold uppercase tracking-widest outline-none">
          <ArrowLeft size={14} /> Back
        </button>

        {loading && (
          <ProfileContentSkeleton />
        )}

        {!loading && !data && (
          <div className="text-center mt-20 text-zinc-500 font-mono">USER NOT FOUND 404</div>
        )}

        {!loading && data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Header ──────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[2px] shadow-lg shadow-emerald-500/10">
                  <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center overflow-hidden">
                    <Avatar className="w-full h-full rounded-none">
                      <AvatarImage src={data.details.avatarUrl} className="object-cover" />
                      <AvatarFallback className="text-3xl font-bold text-emerald-400 bg-zinc-950 w-full h-full flex items-center justify-center">
                        {data.details.displayName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                    {data.details.displayName || "Anonymous User"}
                  </h1>
                  <p className="text-sm text-zinc-500 font-medium">@{data.details.username || data.details.email.split('@')[0]}</p>
                  <div className="flex items-center gap-1.5 mt-2 px-2 py-0.5 w-fit rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                    <Zap size={10} fill="currentColor" /> Pro Member
                  </div>
                </div>
              </div>
            </div>

            {/* ── Top Core Stats Row ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MinimalStatCard icon={<Trophy className="text-yellow-400" size={16} />} label="Global Rank" value={`#${data.stats.rank}`} />
              <MinimalStatCard icon={<TrendingUp className="text-emerald-400" size={16} />} label="Total Score" value={data.stats.score} />
              <MinimalStatCard icon={<Target className="text-blue-400" size={16} />} label="Total Solved" value={data.stats.solvedBreakdown.total} />
              <MinimalStatCard icon={<Flame className="text-orange-400" size={16} />} label="Day Streak" value="0" />
            </div>

            {/* ── Bento Grid ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* LEFT COLUMN (4 cols) */}
              <div className="md:col-span-4 space-y-6">

                {/* Bio Card */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-5">
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin size={12} className="text-emerald-500" /> About
                  </h3>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {data.details.bio || "No biography provided."}
                  </p>
                  <div className="mt-5 pt-4 border-t border-zinc-800/50 space-y-2">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                      <Calendar size={12} /> Joined {format(new Date(data.details.createdAt), "MMM yyyy")}
                    </div>
                    {data.details.socialLinks?.github && (
                      <a href={data.details.socialLinks.github} target="_blank" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-medium"><GitHubIcon className="h-3 w-3" /> GitHub</a>
                    )}
                    {data.details.socialLinks?.linkedin && (
                      <a href={data.details.socialLinks.linkedin} target="_blank" className="flex items-center gap-2 text-zinc-400 hover:text-blue-400 transition-colors text-xs font-medium"><LinkedInIcon className="h-3 w-3" /> LinkedIn</a>
                    )}
                    {data.details.socialLinks?.twitter && (
                      <a href={data.details.socialLinks.twitter} target="_blank" className="flex items-center gap-2 text-zinc-400 hover:text-sky-400 transition-colors text-xs font-medium"><BrandXIcon className="h-3 w-3" /> Twitter</a>
                    )}
                    {data.details.socialLinks?.website && (
                      <a href={data.details.socialLinks.website} target="_blank" className="flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-xs font-medium"><Globe size={12} /> Website</a>
                    )}
                  </div>
                </div>

                {/* Communities Card */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-zinc-800/50">
                    <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Crown size={12} /> Created
                    </h3>
                    <div className="space-y-1">
                      {myCommunities.length > 0 ? myCommunities.map((c) => (
                         <CommunityItem key={c.id} community={c} onClick={() => router.push(`/communities/${c.id}`)} />
                      )) : <div className="text-zinc-600 text-xs py-2 italic text-center">No created communities.</div>}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Users size={12} /> Joined
                    </h3>
                    <div className="space-y-1">
                      {joinedCommunities.length > 0 ? joinedCommunities.map((c) => (
                         <CommunityItem key={c.id} community={c} onClick={() => router.push(`/communities/${c.id}`)} />
                      )) : <div className="text-zinc-600 text-xs py-2 italic text-center">No joined communities.</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (8 cols) */}
              <div className="md:col-span-8 space-y-6">

                {/* ── Advanced Proficiency Radar ───────────────────── */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6">
                  
                  {/* Chart Container */}
                  <div className="w-full md:w-1/2 h-56 relative group">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#27272a" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                        <Radar name="DSA" dataKey="DSA" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                        <Radar name="MCQ" dataKey="MCQ" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Detailed Breakdowns */}
                  <div className="flex-1 w-full space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Activity size={12} className="text-emerald-500" /> Proficiency Matrix
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                       <CompactDiffCard label="Easy" dsa={data.stats.solvedBreakdown.easy} mcq={data.stats.mcqSolvedBreakdown?.easy || 0} color="text-emerald-400" />
                       <CompactDiffCard label="Medium" dsa={data.stats.solvedBreakdown.medium} mcq={data.stats.mcqSolvedBreakdown?.medium || 0} color="text-amber-400" />
                       <CompactDiffCard label="Hard" dsa={data.stats.solvedBreakdown.hard} mcq={data.stats.mcqSolvedBreakdown?.hard || 0} color="text-red-400" />
                    </div>
                  </div>
                </div>

                {/* Activity Heatmap */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-5 overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <BarChart3 size={12} className="text-emerald-500" /> Contribution Activity
                    </h3>
                    <span className="text-[10px] text-zinc-600 font-mono font-bold bg-zinc-800/50 px-2 py-1 rounded-md">{new Date().getFullYear()}</span>
                  </div>
                  <div className="flex justify-center w-full overflow-x-auto scrollbar-emerald pb-1">
                    <ActivityCalendar
                      data={calendarData}
                      theme={{
                        light: ['#18181b', '#064e3b', '#047857', '#10b981', '#34d399'],
                        dark: ['#18181b', '#064e3b', '#047857', '#10b981', '#34d399'],
                      }}
                      blockSize={11} blockMargin={3} fontSize={10} showWeekdayLabels={true}
                    />
                  </div>
                </div>

                {/* Recent Solves */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-5">
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Send size={12} className="text-emerald-500" /> Recent Solves
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {data.activity.recent.slice(0, 6).map((sub, idx) => (
                      <div key={idx} className="flex justify-between items-center px-3 py-2 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/60 transition-colors border border-zinc-800/40">
                        <div className="flex items-center gap-2 w-[70%]">
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                            sub.problemId.difficulty === 'Easy' ? 'bg-emerald-500' :
                            sub.problemId.difficulty === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                          )} />
                          <span className="text-[11px] font-semibold text-zinc-300 truncate" title={sub.problemId.title}>{sub.problemId.title}</span>
                        </div>
                        <span className="text-[10px] text-zinc-600 font-mono font-medium">{format(new Date(sub.createdAt), "MMM d")}</span>
                      </div>
                    ))}
                  </div>
                  {data.activity.recent.length === 0 && <p className="text-zinc-600 text-xs text-center py-4 font-mono">NO RECENT ACTIVITY.</p>}
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function MinimalStatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-1 transition-all">
      <div className="flex justify-between items-start mb-1">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
        <div className="p-1 rounded bg-zinc-800/50">{icon}</div>
      </div>
      <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
    </div>
  );
}

function CompactDiffCard({ label, dsa, mcq, color }: { label: string; dsa: number, mcq: number, color: string }) {
  return (
    <div className="bg-zinc-800/30 border border-zinc-800/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
      <span className={cn("text-[10px] font-bold uppercase tracking-widest", color)}>{label}</span>
      <div className="mt-2 text-xs font-mono text-zinc-400 w-full flex justify-between px-1">
        <span><span className="text-emerald-400 font-bold">{dsa}</span> <span className="text-[8px] uppercase">DSA</span></span>
      </div>
      <div className="text-xs font-mono text-zinc-400 w-full flex justify-between px-1">
        <span><span className="text-purple-400 font-bold">{mcq}</span> <span className="text-[8px] uppercase">MCQ</span></span>
      </div>
    </div>
  );
}

function CommunityItem({ community, onClick }: { community: Community; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-zinc-800/50 transition-all group text-left">
      <div className="flex items-center gap-2">
        <div className="text-zinc-600 group-hover:text-emerald-500 transition-colors"><Hash size={12} /></div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">{community.name}</span>
          <span className="text-[8px] text-zinc-600 font-mono uppercase">{community.role}</span>
        </div>
      </div>
      <ChevronRight size={10} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
    </button>
  );
}
