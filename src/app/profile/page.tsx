"use client";

import React, { useEffect, useState } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import {
  Edit, MapPin, Calendar, Github, Linkedin, Globe, Twitter,
  Flame, Trophy, Target, Zap, X, Save, Loader2, Users, Crown,
  ChevronRight, Hash, TrendingUp, Award, Send, BarChart3
} from "lucide-react";
import { format, eachDayOfInterval, startOfYear, endOfYear } from "date-fns";
import { useRouter } from "next/navigation";
import { profileApi } from "@/lib/api-modules/profile.api";
import MainLayout from "@/components/layouts/main-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SocialLinks { github?: string; linkedin?: string; website?: string; twitter?: string; }
interface UserDetails { _id: string; displayName?: string; username?: string; email: string; avatarUrl?: string; bio?: string; socialLinks?: SocialLinks; createdAt: string; }
interface ProfileStats { score: number; rank: number; totalSubmissions: number; solvedBreakdown: { easy: number; medium: number; hard: number; total: number; }; mcqSolvedBreakdown?: { easy: number; medium: number; hard: number; total: number; }; }
interface ActivityData { heatmap: Array<{ _id: string; count: number }>; recent: Array<{ _id: string; problemId: { title: string; difficulty: string; slug: string }; status: string; createdAt: string; }>; }
interface Community { id: string; name: string; role: string; }
interface ProfileResponse { details: UserDetails; stats: ProfileStats; activity: ActivityData; communities: Community[]; }

// ─── Multi-Segment Donut ──────────────────────────────────────────────────────
function MultiSegmentDonut({ easy, medium, hard, total, solved, size = 180, strokeWidth = 13, label = 'Solved' }: {
  easy: number; medium: number; hard: number; total: number; solved: number; size?: number; strokeWidth?: number; label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeTotal = total > 0 ? total : 1;
  const easyFrac = easy / safeTotal;
  const medFrac = medium / safeTotal;
  const hardFrac = hard / safeTotal;
  const medOffset = easyFrac * circumference;
  const hardOffset = (easyFrac + medFrac) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-[40px] scale-75 pointer-events-none" />
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-[#ffffff08]" />
        {easy > 0 && <circle cx={size / 2} cy={size / 2} r={radius} stroke="#22c55e" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={`${easyFrac * circumference} ${circumference - easyFrac * circumference}`} strokeDashoffset={0} strokeLinecap="round" className="transition-all duration-1000 ease-out" />}
        {medium > 0 && <circle cx={size / 2} cy={size / 2} r={radius} stroke="#eab308" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={`${medFrac * circumference} ${circumference - medFrac * circumference}`} strokeDashoffset={-medOffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />}
        {hard > 0 && <circle cx={size / 2} cy={size / 2} r={radius} stroke="#ef4444" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={`${hardFrac * circumference} ${circumference - hardFrac * circumference}`} strokeDashoffset={-hardOffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black text-white tracking-tight leading-none">{solved}</span>
        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mt-1">/{total}</span>
        <span className="text-[9px] font-medium text-emerald-500 mt-0.5">✓ {label}</span>
      </div>
    </div>
  );
}

// ─── Difficulty Badge ─────────────────────────────────────────────────────────
function DiffBadge({ label, count, total, color, dotColor }: { label: string; count: number; total: number; color: string; dotColor: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-900/40 border border-[#ffffff08]">
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", dotColor)} />
        <span className={cn("text-xs font-semibold", color)}>{label}</span>
      </div>
      <span className="text-xs text-zinc-300 font-mono"><span className="text-white font-bold">{count}</span><span className="text-zinc-600">/{total}</span></span>
    </div>
  );
}

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

// ─── Profile Page ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = profileApi.getMyProfile();
      const json = (await res).data;
      if (json.profile) setData(json.profile);
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const myCommunities = data?.communities.filter(c => ['OWNER', 'ADMIN'].includes(c.role.toUpperCase())) || [];
  const joinedCommunities = data?.communities.filter(c => !['OWNER', 'ADMIN'].includes(c.role.toUpperCase())) || [];
  const calendarData = data ? generateFullYearData(data.activity.heatmap) : [];

  return (
    <MainLayout>
      <div className="font-sans pb-20">

        {/* Loading */}
        {loading && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 relative" />
            </div>
          </div>
        )}

        {!loading && !data && (
          <div className="text-center mt-20 text-zinc-500">User not found</div>
        )}

        {!loading && data && (
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Header ──────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-[#ffffff08]">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-[3px] shadow-2xl shadow-emerald-500/15">
                  <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                    <Avatar className="w-full h-full">
                      <AvatarImage src={data.details.avatarUrl} className="object-cover" />
                      <AvatarFallback className="text-3xl font-bold text-white bg-zinc-900 w-full h-full flex items-center justify-center">
                        {data.details.displayName?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    {data.details.displayName || "Anonymous User"}
                  </h1>
                  <p className="text-sm text-zinc-500 font-medium">@{data.details.username || data.details.email.split('@')[0]}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400">
                    <Zap size={12} fill="currentColor" />
                    <span className="font-semibold">Pro Member</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900/50 hover:bg-zinc-800/60 border border-[#ffffff08] hover:border-[#ffffff18] rounded-xl transition-all text-sm font-medium text-zinc-300 hover:text-white group"
              >
                <Edit size={14} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                Edit Profile
              </button>
            </div>

            {/* ── Bento Grid ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* LEFT COLUMN (4 cols) */}
              <div className="md:col-span-4 space-y-6">

                {/* Bio Card */}
                <div className="bg-zinc-900/30 border border-[#ffffff08] rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MapPin size={12} className="text-emerald-500" /> About
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {data.details.bio || "No bio added yet."}
                  </p>
                  <div className="mt-6 pt-5 border-t border-[#ffffff06] space-y-3">
                    <div className="flex items-center gap-3 text-zinc-500 text-xs">
                      <Calendar size={13} /> Joined {format(new Date(data.details.createdAt), "MMMM yyyy")}
                    </div>
                    {data.details.socialLinks?.github && (
                      <a href={data.details.socialLinks.github} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors text-xs"><Github size={13} /> GitHub</a>
                    )}
                    {data.details.socialLinks?.linkedin && (
                      <a href={data.details.socialLinks.linkedin} className="flex items-center gap-3 text-zinc-400 hover:text-blue-400 transition-colors text-xs"><Linkedin size={13} /> LinkedIn</a>
                    )}
                    {data.details.socialLinks?.twitter && (
                      <a href={data.details.socialLinks.twitter} className="flex items-center gap-3 text-zinc-400 hover:text-sky-400 transition-colors text-xs"><Twitter size={13} /> Twitter</a>
                    )}
                    {data.details.socialLinks?.website && (
                      <a href={data.details.socialLinks.website} target="_blank" className="flex items-center gap-3 text-zinc-400 hover:text-emerald-400 transition-colors text-xs"><Globe size={13} /> Website</a>
                    )}
                  </div>
                </div>

                {/* Communities Card */}
                <div className="bg-zinc-900/30 border border-[#ffffff08] rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-[#ffffff06]">
                    <h3 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Crown size={12} /> Created
                    </h3>
                    <div className="space-y-1">
                      {myCommunities.length > 0 ? myCommunities.map((c) => (
                        <CommunityItem key={c.id} community={c} onClick={() => router.push(`/communities/${c.id}`)} />
                      )) : (
                        <div className="text-zinc-600 text-xs py-3 italic text-center border border-dashed border-[#ffffff08] rounded-lg">No communities created.</div>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Users size={12} /> Joined
                    </h3>
                    <div className="space-y-1">
                      {joinedCommunities.length > 0 ? joinedCommunities.map((c) => (
                        <CommunityItem key={c.id} community={c} onClick={() => router.push(`/communities/${c.id}`)} />
                      )) : (
                        <div className="text-zinc-600 text-xs py-3 italic text-center border border-dashed border-[#ffffff08] rounded-lg">No communities joined.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (8 cols) */}
              <div className="md:col-span-8 space-y-6">

                {/* ── Solving Stats Donut + Cards ───────────────────── */}
                <div className="bg-zinc-900/30 border border-[#ffffff08] rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none" />
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Target size={13} className="text-emerald-500" /> Solving Stats
                  </h3>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <MultiSegmentDonut
                      easy={data.stats.solvedBreakdown.easy}
                      medium={data.stats.solvedBreakdown.medium}
                      hard={data.stats.solvedBreakdown.hard}
                      total={data.stats.solvedBreakdown.total || 1}
                      solved={data.stats.solvedBreakdown.total}
                      size={180} strokeWidth={14}
                    />
                    <div className="flex-1 w-full space-y-3">
                      <DiffBadge label="Easy" count={data.stats.solvedBreakdown.easy} total={data.stats.solvedBreakdown.total} color="text-emerald-400" dotColor="bg-emerald-500" />
                      <DiffBadge label="Medium" count={data.stats.solvedBreakdown.medium} total={data.stats.solvedBreakdown.total} color="text-amber-400" dotColor="bg-amber-500" />
                      <DiffBadge label="Hard" count={data.stats.solvedBreakdown.hard} total={data.stats.solvedBreakdown.total} color="text-red-400" dotColor="bg-red-500" />
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={<Trophy className="text-yellow-500" size={18} />} label="Global Rank" value={`#${data.stats.rank}`} accent="bg-yellow-500" />
                  <StatCard icon={<TrendingUp className="text-emerald-500" size={18} />} label="Total Score" value={data.stats.score} accent="bg-emerald-500" />
                  <StatCard icon={<Target className="text-blue-500" size={18} />} label="Solved" value={data.stats.solvedBreakdown.total} accent="bg-blue-500" />
                  <StatCard icon={<Flame className="text-orange-500" size={18} />} label="Streak" value="0" accent="bg-orange-500" />
                </div>

                {/* Activity Heatmap */}
                <div className="bg-zinc-900/30 border border-[#ffffff08] rounded-2xl p-6 overflow-hidden">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 size={13} className="text-emerald-500" /> Activity
                    </h3>
                    <span className="text-xs text-zinc-600 font-mono">{new Date().getFullYear()}</span>
                  </div>
                  <div className="w-full overflow-x-auto pb-2 flex justify-center">
                    <ActivityCalendar
                      data={calendarData}
                      theme={{
                        light: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                        dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                      }}
                      blockSize={12} blockMargin={4} fontSize={12}
                      labels={{
                        legend: { less: 'Less', more: 'More' },
                        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        totalCount: '{{count}} submissions in {{year}}'
                      }}
                      showWeekdayLabels={true}
                    />
                  </div>
                </div>

                {/* Recent Solves */}
                <div className="bg-zinc-900/30 border border-[#ffffff08] rounded-2xl p-6">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Send size={12} className="text-emerald-500" /> Recent Solves
                  </h3>
                  <div className="space-y-2">
                    {data.activity.recent.map((sub, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-zinc-900/40 rounded-xl hover:bg-zinc-800/30 transition-colors border border-[#ffffff06]">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full",
                            sub.problemId.difficulty === 'Easy' ? 'bg-emerald-500' :
                            sub.problemId.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                          )} />
                          <span className="text-sm font-medium text-zinc-200">{sub.problemId.title}</span>
                        </div>
                        <span className="text-xs text-zinc-600 font-mono">{format(new Date(sub.createdAt), "MMM d")}</span>
                      </div>
                    ))}
                    {data.activity.recent.length === 0 && <p className="text-zinc-600 text-sm text-center py-4">No recent activity.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditOpen && data && (
          <EditProfileModal
            user={data.details}
            onClose={() => setIsEditOpen(false)}
            onUpdate={() => { fetchProfile(); setIsEditOpen(false); }}
          />
        )}
      </div>
    </MainLayout>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function CommunityItem({ community, onClick }: { community: Community; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.03] transition-all group text-left">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-zinc-800/50 flex items-center justify-center text-zinc-600 group-hover:text-emerald-500 transition-colors">
          <Hash size={14} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">{community.name}</span>
          <span className="text-[9px] text-zinc-600 font-mono uppercase">{community.role}</span>
        </div>
      </div>
      <ChevronRight size={12} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
    </button>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent: string }) {
  return (
    <div className="group relative bg-zinc-900/30 border border-[#ffffff08] p-5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#ffffff18] transition-all duration-300 overflow-hidden">
      <div className={cn("absolute -top-6 -right-6 w-16 h-16 rounded-full blur-[30px] opacity-0 group-hover:opacity-20 transition-opacity duration-500", accent)} />
      <div className="p-2 bg-zinc-800/50 rounded-xl mb-1">{icon}</div>
      <span className="text-xl font-bold text-white tracking-tight">{value}</span>
      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{label}</span>
    </div>
  );
}

function EditProfileModal({ user, onClose, onUpdate }: { user: UserDetails; onClose: () => void; onUpdate: () => void }) {
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const res = await profileApi.updateProfile(formData);
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

  const inputClass = "w-full bg-zinc-950 border border-[#ffffff10] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-zinc-600";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-[#ffffff08] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-[#ffffff08] flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Display Name</label>
            <input type="text" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} className={inputClass} placeholder="Your Name" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Bio</label>
            <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className={cn(inputClass, "min-h-[100px] resize-none")} placeholder="Tell us about yourself..." />
          </div>
          <div className="space-y-3 pt-2">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Social Links</label>
            <div className="flex items-center gap-3">
              <Github size={16} className="text-zinc-600" />
              <input type="text" placeholder="GitHub URL" value={formData.socialLinks.github} onChange={(e) => setFormData({...formData, socialLinks: { ...formData.socialLinks, github: e.target.value }})} className={cn(inputClass, "flex-1")} />
            </div>
            <div className="flex items-center gap-3">
              <Linkedin size={16} className="text-zinc-600" />
              <input type="text" placeholder="LinkedIn URL" value={formData.socialLinks.linkedin} onChange={(e) => setFormData({...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value }})} className={cn(inputClass, "flex-1")} />
            </div>
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-zinc-600" />
              <input type="text" placeholder="Personal Website" value={formData.socialLinks.website} onChange={(e) => setFormData({...formData, socialLinks: { ...formData.socialLinks, website: e.target.value }})} className={cn(inputClass, "flex-1")} />
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-[#ffffff08] flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}