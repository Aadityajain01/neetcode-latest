"use client";

import React, { useEffect, useState } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { 
  MapPin, Calendar, Github, Linkedin, Globe, Twitter,
  Flame, Trophy, Target, Zap, Loader2, Users, Crown, ChevronRight, Hash, ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { useRouter, useParams } from "next/navigation"; // 1. Import useParams
import { profileApi } from "@/lib/api-modules/profile.api";
import MainLayout from "@/components/layouts/main-layout"; 

// --- TYPES (Same as your main profile) ---
interface SocialLinks {
  github?: string;
  linkedin?: string;
  website?: string;
  twitter?: string;
}

interface UserDetails {
  _id: string;
  displayName?: string;
  username?: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  socialLinks?: SocialLinks;
  createdAt: string;
}

interface ProfileStats {
  score: number;
  rank: number;
  totalSubmissions: number;
  solvedBreakdown: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
  };
}

interface ActivityData {
  heatmap: Array<{ _id: string; count: number }>;
  recent: Array<{
    _id: string;
    problemId: { title: string; difficulty: string; slug: string };
    status: string;
    createdAt: string;
  }>;
}

interface Community {
  id: string;
  name: string;
  role: string;
}

interface ProfileResponse {
  details: UserDetails;
  stats: ProfileStats;
  activity: ActivityData;
  communities: Community[];
}

// --- PUBLIC PROFILE PAGE COMPONENT ---
export default function PublicProfilePage() {
  const router = useRouter();
  const params = useParams(); // 2. Get the ID from the URL
  
  // params.id might be an array or string, force it to string
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data using ID
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        // 3. THIS IS THE KEY FIX: Use getProfileById(userId) instead of getMyProfile()
        const res = await profileApi.getProfileById(userId);
        
        // Note: Check your API response structure. 
        // If your backend returns { profile: ... }, use res.data.profile
        // If your backend returns the object directly, use res.data
        const json = res.data; 
        
        if (json.profile) {
          setData(json.profile);
        } else {
           // Fallback if structure is different
           setData(json as unknown as ProfileResponse); 
        }

      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // --- DERIVED STATE ---
  const myCommunities = data?.communities.filter(c => 
    c.role.toUpperCase() === 'OWNER' || c.role.toUpperCase() === 'ADMIN'
  ) || [];
  
  const joinedCommunities = data?.communities.filter(c => 
    c.role.toUpperCase() !== 'OWNER' && c.role.toUpperCase() !== 'ADMIN'
  ) || [];

  const calendarData = data?.activity.heatmap.map((item) => {
     let level = 0;
     if (item.count === 0) level = 0;
     else if (item.count <= 2) level = 1;
     else if (item.count <= 5) level = 2;
     else if (item.count <= 10) level = 3;
     else level = 4;

     return {
       date: item._id, 
       count: item.count,
       level: level
     };
  }) || [];

  const defaultCalendarData = [
    { date: format(new Date(), 'yyyy-01-01'), count: 0, level: 0 },
    { date: format(new Date(), 'yyyy-12-31'), count: 0, level: 0 }
  ];

  const handleCommunityClick = (id: string) => {
    router.push(`/communities/${id}`);
  };

  return (
    <MainLayout>
      <div className="text-gray-200 font-sans pb-20">
        
        {/* Loading State */}
        {loading && (
          <div className="min-h-[60vh] flex items-center justify-center text-emerald-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {!loading && !data && (
           <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
             <div className="text-gray-400 text-lg">User not found</div>
             <button onClick={() => router.back()} className="text-emerald-500 hover:underline">Go Back</button>
           </div>
        )}

        {/* Profile Content */}
        {!loading && data && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8 px-4">
            
            {/* --- HEADER --- */}
            {/* Added a Back Button for better navigation */}
            <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-[5px]">
                <ArrowLeft size={16} />
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-1 shadow-2xl shadow-emerald-500/20">
                  <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                    {data.details.avatarUrl ? (
                      <img src={data.details.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-white">
                        {data.details.displayName?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {data.details.displayName || "Anonymous User"}
                  </h1>
                  <p className="text-lg text-gray-400 font-medium">@{data.details.username || "user"}</p>
                  <div className="flex items-center gap-2 pt-2 text-sm text-emerald-400">
                      <Zap size={14} fill="currentColor" /> 
                      <span>Pro Member</span>
                  </div>
                </div>
              </div>

              {/* REMOVED: Edit Button (Since we are viewing someone else) */}
            </div>

            {/* --- BENTO GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* LEFT COLUMN (4 spans) */}
              <div className="md:col-span-4 space-y-6">
                
                {/* Bio Card */}
                <div className="bg-[#0f1115] border border-gray-800/60 rounded-xl p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                   <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                     <MapPin size={14} className="text-emerald-500" /> About Me
                   </h3>
                   <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                     {data.details.bio || "No bio added yet."}
                   </p>
                   
                   <div className="mt-6 pt-6 border-t border-gray-800/60 space-y-3">
                     <div className="flex items-center gap-3 text-gray-500 text-sm">
                       <Calendar size={15} /> Joined {format(new Date(data.details.createdAt), "MMMM yyyy")}
                     </div>
                     {data.details.socialLinks?.github && (
                       <a href={data.details.socialLinks.github} target="_blank" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                         <Github size={15} /> GitHub
                       </a>
                     )}
                     {data.details.socialLinks?.linkedin && (
                       <a href={data.details.socialLinks.linkedin} target="_blank" className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors text-sm">
                         <Linkedin size={15} /> LinkedIn
                       </a>
                     )}
                     {data.details.socialLinks?.twitter && (
                       <a href={data.details.socialLinks.twitter} target="_blank" className="flex items-center gap-3 text-gray-400 hover:text-sky-400 transition-colors text-sm">
                         <Twitter size={15} /> Twitter
                       </a>
                     )}
                     {data.details.socialLinks?.website && (
                       <a href={data.details.socialLinks.website} target="_blank" className="flex items-center gap-3 text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                         <Globe size={15} /> Website
                       </a>
                     )}
                   </div>
                </div>

                {/* Communities Section */}
                <div className="bg-[#0f1115] border border-gray-800/60 rounded-xl overflow-hidden flex flex-col">
                  {/* Created Communities */}
                  <div className="p-5 border-b border-gray-800/60">
                    <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Crown size={14} /> Created by user
                    </h3>
                    <div className="space-y-1">
                      {myCommunities.length > 0 ? myCommunities.map((c) => (
                        <CommunityItem key={c.id} community={c} onClick={() => handleCommunityClick(c.id)} />
                      )) : (
                        <div className="text-gray-600 text-xs py-2 italic text-center">No communities created.</div>
                      )}
                    </div>
                  </div>
                  {/* Joined Communities */}
                  <div className="p-5">
                    <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Users size={14} /> Joined
                    </h3>
                    <div className="space-y-1">
                      {joinedCommunities.length > 0 ? joinedCommunities.map((c) => (
                        <CommunityItem key={c.id} community={c} onClick={() => handleCommunityClick(c.id)} />
                      )) : (
                        <div className="text-gray-600 text-xs py-2 italic text-center">No communities joined.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (8 spans) */}
              <div className="md:col-span-8 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={<Trophy className="text-yellow-500" size={20} />} label="Global Rank" value={`#${data.stats.rank}`} />
                  <StatCard icon={<Zap className="text-emerald-500" size={20} />} label="Total Score" value={data.stats.score} />
                  <StatCard icon={<Target className="text-blue-500" size={20} />} label="Solved" value={data.stats.solvedBreakdown.total} />
                  <StatCard icon={<Flame className="text-orange-500" size={20} />} label="Streak" value="0" />
                </div>

                {/* Progress Bars */}
                <div className="bg-[#0f1115] border border-gray-800/60 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Solving Stats</h3>
                  <div className="space-y-5">
                    <DifficultyBar label="Easy" count={data.stats.solvedBreakdown.easy} total={data.stats.solvedBreakdown.total} color="bg-emerald-500" bg="bg-emerald-500/10" />
                    <DifficultyBar label="Medium" count={data.stats.solvedBreakdown.medium} total={data.stats.solvedBreakdown.total} color="bg-yellow-500" bg="bg-yellow-500/10" />
                    <DifficultyBar label="Hard" count={data.stats.solvedBreakdown.hard} total={data.stats.solvedBreakdown.total} color="bg-red-500" bg="bg-red-500/10" />
                  </div>
                </div>

                {/* Heatmap */}
                <div className="bg-[#0f1115] border border-gray-800/60 rounded-xl p-6 overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white">Activity</h3>
                    <span className="text-xs text-gray-500">{new Date().getFullYear()}</span>
                  </div>
                  <div className="w-full overflow-x-auto pb-2 flex justify-center">
                    <ActivityCalendar 
                      data={calendarData.length > 0 ? calendarData : defaultCalendarData}
                      theme={{
                        light: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                        dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                      }}
                      blockSize={12}
                      blockMargin={4}
                      fontSize={12}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// Reuse your Helper Components
function CommunityItem({ community, onClick }: { community: Community, onClick: () => void }) {
    return (
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all group border border-transparent hover:border-gray-800 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#1a1d24] flex items-center justify-center text-gray-500 group-hover:text-emerald-500 transition-colors">
            <Hash size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
              {community.name}
            </span>
            <span className="text-[10px] text-gray-500 font-mono uppercase">
              {community.role}
            </span>
          </div>
        </div>
        <ChevronRight size={14} className="text-gray-600 group-hover:text-gray-300 transition-colors" />
      </button>
    );
  }
  
  function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
    return (
      <div className="bg-[#0f1115] border border-gray-800/60 p-5 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-gray-700 transition-colors">
        <div className="mb-1 p-2 bg-[#1a1d24] rounded-lg">{icon}</div>
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
      </div>
    );
  }
  
  function DifficultyBar({ label, count, total, color, bg }: { label: string, count: number, total: number, color: string, bg: string }) {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-4 group">
        <span className="w-16 text-sm font-medium text-gray-400 group-hover:text-white transition-colors">{label}</span>
        <div className={`flex-1 h-2 ${bg} rounded-full overflow-hidden`}>
          <div className={`h-full ${color} rounded-full transition-all duration-500 ease-out`} style={{ width: `${percentage}%` }} />
        </div>
        <span className="w-10 text-sm text-gray-300 text-right font-mono">{count}</span>
      </div>
    );
  }