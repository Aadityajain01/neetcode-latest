"use client";

import React, { useEffect, useState } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { 
  Edit, MapPin, Calendar, Github, Linkedin, Globe, Twitter,
  Flame, Trophy, Target, Zap, X, Save, Loader2, Users, Crown, ChevronRight, Hash
} from "lucide-react";
import { format, eachDayOfInterval, startOfYear, endOfYear, isSameDay, parseISO } from "date-fns";
import { useRouter } from "next/navigation"; 
import { profileApi } from "@/lib/api-modules/profile.api";
import MainLayout from "@/components/layouts/main-layout"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // ✅ Import Avatar

// --- TYPES ---
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

// --- HELPER: Fill missing calendar days ---
const generateFullYearData = (backendData: Array<{ _id: string; count: number }>) => {
  const today = new Date();
  const start = startOfYear(today);
  const end = endOfYear(today);

  // 1. Create a map for quick lookup: "2024-01-01" -> 5
  const dataMap = new Map<string, number>();
  backendData.forEach(item => {
    // Ensure we handle potentially different date formats if needed
    dataMap.set(item._id, item.count); 
  });

  // 2. Generate every day of the current year
  const allDays = eachDayOfInterval({ start, end });

  // 3. Map to the format the library needs
  return allDays.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const count = dataMap.get(dateStr) || 0;
    
    // Calculate level based on count
    let level = 0;
    if (count === 0) level = 0;
    else if (count <= 1) level = 1;
    else if (count <= 3) level = 2;
    else if (count <= 6) level = 3;
    else level = 4;

    return {
      date: dateStr,
      count: count,
      level: level
    };
  });
};

// --- MAIN PAGE COMPONENT ---
export default function ProfilePage() {
  const router = useRouter(); 
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = profileApi.getMyProfile();
      const json = (await res).data;
      if (json.profile) {
        setData(json.profile);
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // --- DERIVED STATE ---
  const myCommunities = data?.communities.filter(c => 
    c.role.toUpperCase() === 'OWNER' || c.role.toUpperCase() === 'ADMIN'
  ) || [];
  
  const joinedCommunities = data?.communities.filter(c => 
    c.role.toUpperCase() !== 'OWNER' && c.role.toUpperCase() !== 'ADMIN'
  ) || [];

  // ✅ FIX: Generate full year data
  const calendarData = data ? generateFullYearData(data.activity.heatmap) : [];

  const handleCommunityClick = (id: string) => {
    router.push(`/communities/${id}`);
  };

  return (
    <MainLayout>
      <div className="text-gray-200 font-sans pb-20">
        
        {loading && (
          <div className="min-h-[60vh] flex items-center justify-center text-emerald-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {!loading && !data && (
           <div className="text-center mt-20 text-gray-400">User not found</div>
        )}

        {!loading && data && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
              <div className="flex items-center gap-6">
                
                {/* ✅ FIX: Avatar Component */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-1 shadow-2xl shadow-emerald-500/20">
                  <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={data.details.avatarUrl} className="object-cover" />
                      <AvatarFallback className="text-4xl font-bold text-white bg-zinc-900 w-full h-full flex items-center justify-center">
                        {data.details.displayName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {data.details.displayName || "Anonymous User"}
                  </h1>
                  <p className="text-lg text-gray-400 font-medium">@{data.details.username || data.details.email.split('@')[0]}</p>
                  <div className="flex items-center gap-2 pt-2 text-sm text-emerald-400">
                      <Zap size={14} fill="currentColor" /> 
                      <span>Pro Member</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#252525] hover:text-white border border-gray-800 rounded-lg transition-all text-sm font-medium group"
              >
                <Edit size={16} className="text-gray-400 group-hover:text-emerald-400 transition-colors" /> 
                Edit Profile
              </button>
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
                       <a href={data.details.socialLinks.github} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                         <Github size={15} /> GitHub
                       </a>
                     )}
                     {data.details.socialLinks?.linkedin && (
                       <a href={data.details.socialLinks.linkedin} className="flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-colors text-sm">
                         <Linkedin size={15} /> LinkedIn
                       </a>
                     )}
                     {data.details.socialLinks?.twitter && (
                       <a href={data.details.socialLinks.twitter} className="flex items-center gap-3 text-gray-400 hover:text-sky-400 transition-colors text-sm">
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
                      <Crown size={14} /> Created by me
                    </h3>
                    <div className="space-y-1">
                      {myCommunities.length > 0 ? myCommunities.map((c) => (
                        <CommunityItem key={c.id} community={c} onClick={() => handleCommunityClick(c.id)} />
                      )) : (
                        <div className="text-gray-600 text-xs py-2 italic text-center border border-dashed border-gray-800 rounded-lg">
                          No communities created yet.
                        </div>
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
                        <div className="text-gray-600 text-xs py-2 italic text-center border border-dashed border-gray-800 rounded-lg">
                          No communities joined yet.
                        </div>
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
                  <StatCard icon={<Target className="text-blue-500" size={20} />} label="Problems Solved" value={data.stats.solvedBreakdown.total} />
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

                {/* --- HEATMAP SECTION --- */}
                <div className="bg-[#0f1115] border border-gray-800/60 rounded-xl p-6 overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white">Activity</h3>
                    <span className="text-xs text-gray-500">{new Date().getFullYear()}</span>
                  </div>
                  <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800 flex justify-center">
                    <ActivityCalendar 
                      data={calendarData} // ✅ Now uses the full filled year data
                      theme={{
                        light: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                        dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                      }}
                      blockSize={12}
                      blockMargin={4}
                      fontSize={12}
                      labels={{
                         legend: {
                           less: 'Less',
                           more: 'More',
                         },
                         months: [
                           'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                         ],
                         weekdays: [
                           'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' 
                         ],
                         totalCount: '{{count}} submissions in {{year}}'
                       }}
                       showWeekdayLabels={true}
                    />
                  </div>
                </div>

                {/* Recent Solves */}
                <div className="bg-[#0f1115] border border-gray-800/60 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Solves</h3>
                  <div className="space-y-3">
                    {data.activity.recent.map((sub, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-[#16181d] rounded-lg hover:bg-[#1c1f26] transition-colors border border-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            sub.problemId.difficulty === 'Easy' ? 'bg-emerald-500' :
                            sub.problemId.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm font-medium text-gray-200">{sub.problemId.title}</span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">{format(new Date(sub.createdAt), "MMM d")}</span>
                      </div>
                    ))}
                    {data.activity.recent.length === 0 && <p className="text-gray-500 text-sm">No recent activity.</p>}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* --- EDIT PROFILE MODAL --- */}
        {isEditOpen && data && (
          <EditProfileModal 
            user={data.details} 
            onClose={() => setIsEditOpen(false)} 
            onUpdate={() => {
              fetchProfile(); 
              setIsEditOpen(false);
            }} 
          />
        )}
      </div>
    </MainLayout>
  );
}

// ... (Rest of Helper Components: CommunityItem, StatCard, DifficultyBar, EditProfileModal remain UNCHANGED)
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

function EditProfileModal({ user, onClose, onUpdate }: { user: UserDetails, onClose: () => void, onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    displayName: user.displayName || "",
    bio: user.bio || "",
    socialLinks: {
      github: user.socialLinks?.github || "",
      linkedin: user.socialLinks?.linkedin || "",
      twitter: user.socialLinks?.twitter || "",
      website: user.socialLinks?.website || "",
    }
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await profileApi.updateProfile(formData)
      if (res.status === 200) {
        onUpdate();
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f1115] border border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#16181d]">
          <h2 className="text-xl font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase">Display Name</label>
            <input 
              type="text" 
              value={formData.displayName}
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Your Name"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase">Bio</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors min-h-[100px] resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-gray-400 uppercase">Social Links</label>
            
            <div className="flex items-center gap-3">
              <Github size={18} className="text-gray-500" />
              <input 
                type="text" 
                placeholder="GitHub URL"
                value={formData.socialLinks.github}
                onChange={(e) => setFormData({...formData, socialLinks: { ...formData.socialLinks, github: e.target.value }})}
                className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Linkedin size={18} className="text-gray-500" />
              <input 
                type="text" 
                placeholder="LinkedIn URL"
                value={formData.socialLinks.linkedin}
                onChange={(e) => setFormData({...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value }})}
                className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <Globe size={18} className="text-gray-500" />
              <input 
                type="text" 
                placeholder="Personal Website"
                value={formData.socialLinks.website}
                onChange={(e) => setFormData({...formData, socialLinks: { ...formData.socialLinks, website: e.target.value }})}
                className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-gray-800 bg-[#16181d] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={saving}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}