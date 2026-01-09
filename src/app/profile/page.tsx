"use client";

import React, { useEffect, useState } from "react";
// import ActivityCalendar from "react-activity-calendar";
import { 
  Edit, MapPin, Calendar, Github, Linkedin, Globe, Twitter,
  Flame, Trophy, Target, Zap, X, Save, Loader2
} from "lucide-react";
import { format } from "date-fns";
// import { toast } from "sonner"; 
import { profileApi } from "@/lib/api-modules/profile.api";

// IMPORT YOUR MAIN LAYOUT HERE
// Ensure this path matches where you saved the MainLayout component
import MainLayout from "@/components/layouts/main-layout"; 

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

// --- MAIN PAGE COMPONENT ---
export default function ProfilePage() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fetch Data
  const fetchProfile = async () => {
    try {
      const res = profileApi.getMyProfile();
      console.log(res); 
      const json = (await res).data;
      console.log("profile-json", json);
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

  // --- RENDERING ---

  // 1. Wrap everything in MainLayout so the Sidebar appears
  return (
    <MainLayout>
      <div className="text-gray-200 font-sans pb-20">
        
        {/* Loading State - Centered in Content Area */}
        {loading && (
          <div className="min-h-[60vh] flex items-center justify-center text-emerald-500">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {!loading && !data && (
           <div className="text-center mt-20 text-gray-400">User not found</div>
        )}

        {/* Profile Content */}
        {!loading && data && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
              <div className="flex items-center gap-6">
                {/* Avatar */}
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
                
                {/* Name & Title */}
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

                {/* Communities */}
                <div className="bg-[#0f1115] border border-gray-800/60 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">Communities</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.communities.length > 0 ? data.communities.map((c) => (
                      <span key={c.id} className="px-3 py-1 bg-[#1a1d24] text-xs font-medium text-gray-300 rounded-full border border-gray-700/50 hover:border-emerald-500/50 transition-colors cursor-default">
                        {c.name}
                      </span>
                    )) : (
                      <span className="text-gray-500 text-sm italic">No communities joined.</span>
                    )}
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
                  <StatCard icon={<Flame className="text-orange-500" size={20} />} label="Active Streak" value="12 Days" />
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
                  <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800">
                    {/* Activity Calendar component here */}
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

// --- SUB-COMPONENTS ---

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

// --- EDIT MODAL COMPONENT ---

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
      const res = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
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