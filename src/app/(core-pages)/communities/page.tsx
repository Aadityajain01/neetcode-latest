"use client";

import { useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  communityApi,
  userApi,
  leaderboardApi,
  mcqApi,
  problemApi,
  messageApi,
  Community,
  LeaderboardEntry,
  CommunityAverageLeaderboardMe,
  CommunityTest,
  CommunityMember,
} from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Search, Loader2, Users, Plus, ArrowRight, UserPlus, Sparkles, Shield, Hash,
  ChevronLeft, ChevronRight, ArrowLeft, MoreVertical, LogOut, MessageSquare,
  Trophy, FileText, BarChart3, Settings, Crown, ShieldAlert, Lock, X, Check,
  Calendar, Clock, Mic, MicOff, UserX, ArrowRightLeft, CalendarDays, ListOrdered
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { TestBuilder } from "@/components/communities/TestBuilder";
import { ChatBox } from "@/components/communities/ChatBox";
import { CommunityProvider, useCommunity } from "@/components/communities/CommunityContext";
import { CommunityTableSkeleton } from "@/components/skeletons/inline-skeletons";

import Link from "next/link";

interface GroupRanking {
  groupId: string;
  name: string;
  description: string;
  isDefault: boolean;
  memberCount: number;
  totalScore: number;
  averageScore: number;
  rank: number;
}

function normalizeDomainInput(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
  const withoutPath = withoutProtocol.split("/")[0];
  const withoutAt = withoutPath.startsWith("@") ? withoutPath.slice(1) : withoutPath;
  return withoutAt.includes("@") ? withoutAt.split("@").pop() || "" : withoutAt;
}

const GRADIENTS = [
  "from-violet-600 to-indigo-600",
  "from-cyan-500 to-blue-600",
  "from-brand-500 to-brand-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-fuchsia-500 to-purple-600",
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[idx];
}


// ── RIGHT SIDEBAR SUB-COMPONENTS ─────────────────────────────────────────────

function RightSidebarAbout() {
  const { community, activeGroup, activeGroupId, userRole, groupUserRole, refreshGroups } = useCommunity();
  const [requests, setRequests] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  const isCommAdmin = userRole === "admin" || userRole === "owner";
  const isGroupAdmin = isCommAdmin || groupUserRole === "owner" || groupUserRole === "admin" || groupUserRole === "subadmin";

  const fetchDetails = async () => {
    if (!community?._id || !activeGroupId) return;
    try {
      setMembersLoading(true);
      const list = await communityApi.getGroupMembers(community._id, activeGroupId);
      setMembers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setMembersLoading(false);
    }

    if (isGroupAdmin) {
      try {
        setRequestsLoading(true);
        const list = await communityApi.getGroupJoinRequests(community._id, activeGroupId);
        setRequests(list);
      } catch (err) {
        console.error(err);
      } finally {
        setRequestsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [community?._id, activeGroupId, isGroupAdmin]);

  const handleResolveRequest = async (requestId: string, action: "approve" | "reject") => {
    if (!community?._id || !activeGroupId) return;
    try {
      await communityApi.resolveGroupJoinRequest(community._id, activeGroupId, requestId, action);
      toast.success(`Request ${action}ed successfully`);
      fetchDetails();
      refreshGroups();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || `Failed to ${action} request`);
    }
  };

  const handleToggleRequireApproval = async () => {
    if (!community?._id || !activeGroup) return;
    try {
      await communityApi.updateGroupSettings(community._id, activeGroup._id, {
        settings: {
          ...activeGroup.settings,
          requireApproval: !activeGroup.settings.requireApproval
        }
      });
      toast.success("Group settings updated");
      refreshGroups();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update settings");
    }
  };

  const handleToggleAllowChat = async () => {
    if (!community?._id || !activeGroup) return;
    try {
      await communityApi.updateGroupSettings(community._id, activeGroup._id, {
        settings: {
          ...activeGroup.settings,
          allowChat: !activeGroup.settings.allowChat
        }
      });
      toast.success("Group settings updated");
      refreshGroups();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update settings");
    }
  };

  if (!activeGroup) return <div className="p-4 text-xs text-zinc-550">Select a group channel.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-zinc-150 flex items-center gap-1.5">
          {activeGroup.type === "announcement" ? <Shield className="w-4 h-4 text-zinc-400" /> : <Hash className="w-4 h-4 text-zinc-400" />}
          #{activeGroup.name}
        </h3>
        {activeGroup.description && (
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{activeGroup.description}</p>
        )}
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-550 font-bold uppercase tracking-wider mt-3">
          <span>{activeGroup.memberCount || 1} members</span>
          <span>·</span>
          <span>{activeGroup.type}</span>
        </div>
      </div>

      {isGroupAdmin && (
        <div className="space-y-3 pt-4 border-t border-zinc-800/60">
          <h4 className="text-[10px] font-black text-zinc-550 uppercase tracking-widest">Channel Settings</h4>
          <div className="space-y-2">
            {!activeGroup.isDefault && (
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">Require Join Approval</span>
                <Switch checked={activeGroup.settings?.requireApproval || false} onCheckedChange={handleToggleRequireApproval} className="data-[state=checked]:bg-white" />
              </label>
            )}
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">Allow Member Chat</span>
              <Switch checked={activeGroup.settings?.allowChat ?? true} onCheckedChange={handleToggleAllowChat} className="data-[state=checked]:bg-white" />
            </label>
          </div>
        </div>
      )}

      {isGroupAdmin && activeGroup.settings?.requireApproval && requests.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-zinc-800/60">
          <h4 className="text-[10px] font-black text-zinc-550 uppercase tracking-widest flex items-center justify-between">
            <span>Join Requests</span>
            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[8px] font-black">{requests.length}</span>
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
            {requests.map((req) => (
              <div key={req._id} className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800 p-2.5 rounded-xl">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-200 truncate">{req.userId?.displayName || "User"}</p>
                  <p className="text-[9px] text-zinc-550 truncate">{req.userId?.email}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button onClick={() => handleResolveRequest(req._id, "approve")} className="h-6 w-6 rounded-lg bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-200 active:scale-95 transition-all shadow">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleResolveRequest(req._id, "reject")} className="h-6 w-6 rounded-lg bg-zinc-850 text-zinc-300 flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all border border-zinc-800">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 pt-4 border-t border-zinc-800/60">
        <h4 className="text-[10px] font-black text-zinc-550 uppercase tracking-widest">Members</h4>
        {membersLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-zinc-550" /></div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
            {members.map((m) => {
              const name = m.userId?.displayName || "Member";
              const avatar = m.userId?.avatarUrl;
              return (
                <div key={m._id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-6 h-6 rounded-full shrink-0 object-cover border border-zinc-800" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-350 shrink-0 capitalize">{name[0]}</div>
                    )}
                    <span className="text-xs text-zinc-300 truncate">{name}</span>
                  </div>
                  {m.role !== "member" && (
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded border",
                      m.role === "owner" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                      m.role === "admin" ? "text-brand-400 bg-brand-500/10 border-brand-500/20" :
                      "text-zinc-400 bg-zinc-800 border-zinc-750"
                    )}>{m.role}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function RightSidebarLeaderboard() {
  const { community, activeGroupId } = useCommunity();
  const [activeTab, setActiveTab] = useState<"group" | "group-rankings" | "classroom">("group");
  const [groupEntries, setGroupEntries] = useState<LeaderboardEntry[]>([]);
  const [groupLoading, setGroupLoading] = useState(true);
  const [groupRankings, setGroupRankings] = useState<GroupRanking[]>([]);
  const [rankingsLoading, setRankingsLoading] = useState(true);
  const [top3, setTop3] = useState<LeaderboardEntry[]>([]);
  const [tableEntries, setTableEntries] = useState<LeaderboardEntry[]>([]);
  const [classroomLoading, setClassroomLoading] = useState(true);
  const [classroomPage, setClassroomPage] = useState(1);
  const [totalBeyondTop3, setTotalBeyondTop3] = useState(0);

  const fetchGroupLeaderboard = async () => {
    if (!activeGroupId) return;
    try {
      setGroupLoading(true);
      const list = await leaderboardApi.getGroup(activeGroupId);
      setGroupEntries(list);
    } catch (err) {
      console.error(err);
    } finally {
      setGroupLoading(false);
    }
  };

  const fetchGroupRankings = async () => {
    if (!community?._id) return;
    try {
      setRankingsLoading(true);
      const data = await leaderboardApi.getGroupRankings(community._id);
      setGroupRankings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRankingsLoading(false);
    }
  };

  const fetchClassroomAvg = async (page: number) => {
    if (!community?._id) return;
    try {
      setClassroomLoading(true);
      const offset = 3 + (page - 1) * 8;
      const [podiumData, tableData] = await Promise.all([
        leaderboardApi.getCommunityAverageLeaderboard(community._id, { limit: 3, offset: 0 }),
        leaderboardApi.getCommunityAverageLeaderboard(community._id, { limit: 8, offset })
      ]);
      setTop3(podiumData.leaderboard || []);
      setTableEntries(tableData.leaderboard || []);
      setTotalBeyondTop3(Math.max(0, (tableData.total ?? tableData.summary?.participants ?? 0) - 3));
    } catch (err) {
      console.error(err);
    } finally {
      setClassroomLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "group" && activeGroupId) {
      fetchGroupLeaderboard();
    } else if (activeTab === "group-rankings" && community?._id) {
      fetchGroupRankings();
    } else if (activeTab === "classroom" && community?._id) {
      fetchClassroomAvg(classroomPage);
    }
  }, [activeTab, activeGroupId, community?._id, classroomPage]);

  const totalClassroomPages = Math.max(1, Math.ceil(totalBeyondTop3 / 8));

  return (
    <div className="space-y-4 flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center p-1 bg-zinc-950 border border-zinc-900 rounded-xl shrink-0">
        <button onClick={() => setActiveTab("group")} className={cn("flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all", activeTab === "group" ? "bg-zinc-850 text-white" : "text-zinc-550 hover:text-zinc-350")}>Group</button>
        <button onClick={() => setActiveTab("group-rankings")} className={cn("flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all", activeTab === "group-rankings" ? "bg-zinc-850 text-white" : "text-zinc-550 hover:text-zinc-350")}>Standings</button>
        <button onClick={() => setActiveTab("classroom")} className={cn("flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all", activeTab === "classroom" ? "bg-zinc-850 text-white" : "text-zinc-550 hover:text-zinc-350")}>Class Avg</button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {activeTab === "group" && (
          groupLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-zinc-550" /></div>
          ) : groupEntries.length === 0 ? (
            <p className="text-center text-xs text-zinc-500 py-10">No scores recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {groupEntries.map((e) => (
                <div key={e.userId} className="flex items-center justify-between gap-3 p-2.5 bg-zinc-900/30 border border-zinc-850/50 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-zinc-500 w-5 text-center">{e.rank}</span>
                    <Avatar className="h-6 w-6 border border-zinc-800">
                      <AvatarImage src={e.avatarUrl} />
                      <AvatarFallback className="text-[9px] bg-zinc-800 font-bold">{(e.displayName || "??").slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-zinc-350 truncate font-semibold">{e.displayName}</span>
                  </div>
                  <span className="font-mono text-xs text-zinc-400 font-bold">{e.score} pts</span>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === "group-rankings" && (
          rankingsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-zinc-550" /></div>
          ) : groupRankings.length === 0 ? (
            <p className="text-center text-xs text-zinc-500 py-10">No rankings available.</p>
          ) : (
            <div className="space-y-2">
              {groupRankings.map((g) => (
                <div key={g.groupId} className="flex items-center justify-between gap-3 p-2.5 bg-zinc-900/30 border border-zinc-850/50 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-200 truncate">#{g.rank} {g.name}</p>
                    <p className="text-[9px] text-zinc-550 truncate mt-0.5">{g.memberCount} members</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs font-bold text-zinc-300">{Math.round(g.averageScore)}</p>
                    <p className="text-[8px] text-zinc-500 uppercase font-black">Avg</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === "classroom" && (
          classroomLoading && top3.length === 0 && tableEntries.length === 0 ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-zinc-550" /></div>
          ) : (
            <div className="space-y-4">
              {top3.length > 0 && (
                <div className="space-y-2 border-b border-zinc-800/60 pb-3">
                  <p className="text-[9px] font-black uppercase text-zinc-550 tracking-wider">Top Performers</p>
                  {top3.map((e, idx) => (
                    <div key={e.userId} className={cn("flex items-center justify-between gap-3 p-2 border rounded-xl", idx === 0 ? "bg-zinc-800/20 border-white/10" : "bg-zinc-900/30 border-zinc-850/50")}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-xs font-black text-white w-5 text-center">#{idx + 1}</span>
                        <Avatar className="h-6 w-6 border border-zinc-850">
                          <AvatarImage src={e.avatarUrl} />
                          <AvatarFallback className="text-[9px] bg-zinc-800 font-bold">{(e.displayName || "??").slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-white truncate font-bold">{e.displayName}</span>
                      </div>
                      <span className="font-mono text-xs text-white font-black">{e.score} avg</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase text-zinc-550 tracking-wider">All ranks</p>
                {tableEntries.map((e) => (
                  <div key={e.userId} className="flex items-center justify-between gap-3 p-2 bg-zinc-900/20 border border-zinc-900 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs font-semibold text-zinc-550 w-5 text-center">#{e.rank}</span>
                      <span className="text-xs text-zinc-300 truncate font-semibold">{e.displayName}</span>
                    </div>
                    <span className="font-mono text-xs text-zinc-400 font-bold">{e.score}</span>
                  </div>
                ))}
              </div>

              {totalClassroomPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <button onClick={() => setClassroomPage((p) => Math.max(1, p - 1))} disabled={classroomPage === 1} className="text-[10px] text-zinc-500 hover:text-white disabled:opacity-30">Prev</button>
                  <span className="text-[10px] text-zinc-550">{classroomPage} of {totalClassroomPages}</span>
                  <button onClick={() => setClassroomPage((p) => Math.min(totalClassroomPages, p + 1))} disabled={classroomPage === totalClassroomPages} className="text-[10px] text-zinc-500 hover:text-white disabled:opacity-30">Next</button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function RightSidebarTests() {
  const { community, userRole, activeGroupId } = useCommunity();
  const [tests, setTests] = useState<CommunityTest[]>([]);
  const [loading, setLoading] = useState(true);

  const canCreate = userRole === "admin" || userRole === "owner" || userRole === "subadmin" || !!community?.allowTestCreation;

  const fetchTests = async () => {
    if (!community) return;
    try {
      setLoading(true);
      const data = await communityApi.getTests(community._id, activeGroupId || undefined);
      setTests(data);
    } catch {
      toast.error("Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [community?._id, activeGroupId]);

  return (
    <div className="space-y-4 flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <h4 className="text-[10px] font-black text-zinc-550 uppercase tracking-widest">Classroom Tests</h4>
        {canCreate && <TestBuilder onTestCreated={fetchTests} />}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 no-scrollbar space-y-3">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-zinc-550" /></div>
        ) : tests.length === 0 ? (
          <p className="text-center text-xs text-zinc-500 py-10">No tests available yet.</p>
        ) : (
          tests.map((test) => {
            const startDate = new Date(test.startTime);
            const endDate = new Date(test.endTime);
            const isOngoing = isPast(startDate) && !isPast(endDate);
            const hasEnded = isPast(endDate);
            const buttonLabel = hasEnded ? "Result Out" : isOngoing ? "Enter Test" : "Pending";

            return (
              <div key={test._id} className="p-3 bg-zinc-900/30 border border-zinc-850/50 rounded-xl space-y-2.5">
                <div>
                  <h5 className="text-xs font-bold text-zinc-200 truncate">{test.title}</h5>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">{test.description || "Classroom test"}</p>
                </div>
                <div className="flex items-center justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                  <span>{test.totalMarks} marks</span>
                  <span>{test.durationMinutes} mins</span>
                </div>
                <Link href={`/communities/${community?._id}/tests/${test._id}`} className="block">
                  <Button className={cn("w-full h-8 rounded-lg text-[10px] font-black uppercase tracking-wider border-0 shadow-none", isOngoing ? "bg-white text-zinc-950 hover:bg-zinc-200" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-750")}>
                    {buttonLabel}
                  </Button>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function RightSidebarMembers() {
  const { community, userRole } = useCommunity();
  const { user } = useAuthStore();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const isOwner = userRole === "owner";

  const fetchMembers = async () => {
    if (!community) return;
    try {
      setLoading(true);
      const list = await communityApi.getMembers(community._id);
      setMembers(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Failed to load community roster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [community?._id]);

  const handleRoleUpdate = async (userId: string, role: "member" | "subadmin" | "admin") => {
    if (!community) return;
    try {
      await communityApi.updateMemberRole(community._id, userId, role);
      toast.success("Role updated successfully");
      fetchMembers();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Update failed");
    }
  };

  const handleMuteToggle = async (userId: string, currentMuted: boolean) => {
    if (!community) return;
    try {
      await communityApi.muteMember(community._id, userId, !currentMuted);
      toast.success(currentMuted ? "Member unmuted" : "Member muted");
      fetchMembers();
    } catch {
      toast.error("Action failed");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!community) return;
    try {
      await communityApi.removeMember(community._id, userId);
      toast.success("Member removed");
      fetchMembers();
    } catch {
      toast.error("Remove failed");
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-full min-h-0 overflow-hidden">
      <h4 className="text-[10px] font-black text-zinc-550 uppercase tracking-widest shrink-0">Community Members ({members.length})</h4>
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 no-scrollbar space-y-2.5">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-zinc-550" /></div>
        ) : (
          members.map((m) => {
            const userData = m.userId as any;
            if (!userData) return null;
            const isMe = userData._id === user?.id;
            const isTargetOwner = m.role === "owner";
            const canRoleManage = isOwner && !isTargetOwner && !isMe;
            const canModerate = isOwner ? (!isTargetOwner && !isMe) : (userRole === "admin" ? (!isTargetOwner && m.role !== "admin" && !isMe) : false);

            return (
              <div key={m._id} className="flex items-center justify-between gap-3 p-2 bg-zinc-900/30 border border-zinc-850/50 rounded-xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 flex shrink-0 items-center justify-center font-bold text-[10px] capitalize">{(userData.displayName?.[0] || userData.email?.[0] || "?").toUpperCase()}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{userData.displayName || "Unknown"}</p>
                    <p className="text-[8px] text-zinc-500 truncate capitalize">{m.role} {m.isMuted ? "· Muted" : ""}</p>
                  </div>
                </div>
                {canModerate || canRoleManage ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-6 w-6 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white flex items-center justify-center"><MoreVertical className="w-3.5 h-3.5" /></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-850 text-zinc-250 text-xs">
                      {canRoleManage && m.role === "member" && (
                        <DropdownMenuItem onClick={() => handleRoleUpdate(userData._id, "subadmin")} className="focus:bg-zinc-900">Promote to Subadmin</DropdownMenuItem>
                      )}
                      {canRoleManage && m.role === "subadmin" && (
                        <DropdownMenuItem onClick={() => handleRoleUpdate(userData._id, "admin")} className="focus:bg-zinc-900">Promote to Admin</DropdownMenuItem>
                      )}
                      {canRoleManage && (m.role === "admin" || m.role === "subadmin") && (
                        <DropdownMenuItem onClick={() => handleRoleUpdate(userData._id, "member")} className="focus:bg-zinc-900">Demote to Member</DropdownMenuItem>
                      )}
                      {canModerate && (
                        <DropdownMenuItem onClick={() => handleMuteToggle(userData._id, !!m.isMuted)} className="focus:bg-zinc-900">{m.isMuted ? "Unmute" : "Mute"}</DropdownMenuItem>
                      )}
                      {canModerate && (
                        <DropdownMenuItem onClick={() => handleRemoveMember(userData._id)} className="text-red-400 focus:bg-red-500/10 focus:text-red-300">Remove</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  m.role !== "member" && (
                    <span className="text-[8px] font-black uppercase tracking-wider text-zinc-550 border border-zinc-800 bg-zinc-950 px-1 py-0.5 rounded">{m.role}</span>
                  )
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function RightSidebarAnalytics() {
  const { community, userRole } = useCommunity();
  const [tests, setTests] = useState<CommunityTest[]>([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!community) return;
    communityApi.getTests(community._id).then((list) => {
      setTests(list);
      if (list.length > 0) setSelectedTestId(list[0]._id);
    }).finally(() => setLoading(false));
  }, [community]);

  useEffect(() => {
    if (!community || !selectedTestId) return;
    communityApi.getTestAnalytics(community._id, selectedTestId).then(setData);
  }, [community, selectedTestId]);

  if (userRole !== "admin" && userRole !== "owner") return <div className="p-4 text-xs text-zinc-550">Admins only.</div>;

  return (
    <div className="space-y-4 flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex flex-col gap-2 shrink-0">
        <h4 className="text-[10px] font-black text-zinc-550 uppercase tracking-widest">Test Analytics</h4>
        {tests.length > 0 && (
          <Select value={selectedTestId} onValueChange={setSelectedTestId}>
            <SelectTrigger className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 h-9 text-xs rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-850 rounded-xl text-zinc-200">
              {tests.map((t) => (
                <SelectItem key={t._id} value={t._id} className="text-xs">{t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1 no-scrollbar space-y-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-zinc-550" /></div>
        ) : !data?.analytics ? (
          <p className="text-center text-xs text-zinc-550 py-10">No attempts recorded yet.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-zinc-900/30 border border-zinc-850/50 rounded-xl">
                <span className="text-[8px] uppercase tracking-wider text-zinc-550 font-black">Attempts</span>
                <p className="text-lg font-black text-white mt-1">{data.analytics.studentsAttempted}</p>
              </div>
              <div className="p-3 bg-zinc-900/30 border border-zinc-850/50 rounded-xl">
                <span className="text-[8px] uppercase tracking-wider text-zinc-550 font-black">Avg Score</span>
                <p className="text-lg font-black text-white mt-1">{Math.round(data.analytics.averageScore * 10) / 10}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase text-zinc-550 tracking-wider">Rank Roster</p>
              {data.students.sort((a: any, b: any) => b.totalScore - a.totalScore).map((s: any, idx: number) => (
                <div key={s.userId?._id || idx} className="flex items-center justify-between p-2.5 bg-zinc-900/20 border border-zinc-900 rounded-xl text-xs">
                  <span className="text-zinc-500 w-5 font-bold">#{idx + 1}</span>
                  <span className="text-zinc-300 truncate flex-1 pl-2 font-medium">{s.userId?.displayName || "Unknown"}</span>
                  <span className="font-mono text-zinc-200 font-black">{s.totalScore} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RightSidebarSettings() {
  const { community, userRole, refreshCommunity } = useCommunity();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", allowUsersToChat: true, allowTestCreation: false });
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (community) {
      setForm({
        name: community.name || "",
        description: community.description || "",
        allowUsersToChat: community.allowUsersToChat ?? true,
        allowTestCreation: community.allowTestCreation ?? false,
      });
    }
  }, [community]);

  const handleSave = async () => {
    if (!community) return;
    try {
      setLoading(true);
      await communityApi.updateSettings(community._id, form);
      toast.success("Community settings saved");
      await refreshCommunity();
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!community) return;
    try {
      await communityApi.deleteCommunity(community._id);
      toast.success("Community deleted");
      router.push("/communities");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (userRole !== "admin" && userRole !== "owner") return <div className="p-4 text-xs text-zinc-550">Admins only.</div>;

  return (
    <div className="space-y-4 flex flex-col h-full min-h-0 overflow-hidden">
      <h4 className="text-[10px] font-black text-zinc-550 uppercase tracking-widest shrink-0">Community Settings</h4>
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 no-scrollbar space-y-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-zinc-400">Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-zinc-900 border-zinc-800 text-zinc-200 h-9 rounded-xl text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-zinc-400">Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-zinc-900 border-zinc-800 text-zinc-200 min-h-[64px] resize-none rounded-xl text-xs" />
          </div>
          <label className="flex items-center justify-between cursor-pointer group py-1">
            <span className="text-xs text-zinc-300">Allow Member Chat</span>
            <Switch checked={form.allowUsersToChat} onCheckedChange={(val) => setForm({ ...form, allowUsersToChat: val })} className="data-[state=checked]:bg-white" />
          </label>
          <label className="flex items-center justify-between cursor-pointer group py-1">
            <span className="text-xs text-zinc-300">Allow Test Creation</span>
            <Switch checked={form.allowTestCreation} onCheckedChange={(val) => setForm({ ...form, allowTestCreation: val })} className="data-[state=checked]:bg-white" />
          </label>
          <Button onClick={handleSave} disabled={loading} className="w-full bg-white text-zinc-950 font-black h-9 rounded-xl text-xs mt-2 border-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>

        {userRole === "owner" && (
          <div className="pt-4 border-t border-red-500/20 space-y-2">
            <h5 className="text-[10px] font-black text-red-400 uppercase tracking-widest">Danger Zone</h5>
            <p className="text-[10px] text-zinc-550">Deleting will remove all channels and test records permanently.</p>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <Button onClick={() => setIsDeleteDialogOpen(true)} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold h-9 rounded-xl text-xs border-0 mt-1">Delete Community</Button>
              <AlertDialogContent className="bg-zinc-950 border-zinc-855 text-zinc-200">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Community?</AlertDialogTitle>
                  <AlertDialogDescription className="text-zinc-400">This action cannot be undone. All data will be deleted.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-900">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
}

// ── THREE-PANE INNER LAYOUT ──────────────────────────────────────────────────

function InnerCommunityLayout({
  onBack,
  activeTab,
  setActiveTab,
  activeGroupId,
  setActiveGroupId,
  mobileView,
  setMobileView
}: {
  onBack: () => void;
  activeTab: string | null;
  setActiveTab: (tab: string | null) => void;
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;
  mobileView: "list" | "chat" | "tab";
  setMobileView: (view: "list" | "chat" | "tab") => void;
}) {
  const {
    community,
    isMember,
    userRole,
    refreshCommunity,
    groups,
    notifications,
    refreshGroups,
    activeGroup,
    groupUserRole,
  } = useCommunity();

  const { requireAuth } = useRequireAuth();

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupType, setGroupType] = useState<"text" | "announcement">("text");
  const [groupRequireApproval, setGroupRequireApproval] = useState(false);
  const [groupAllowChat, setGroupAllowChat] = useState(true);
  const [createGroupLoading, setCreateGroupLoading] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isCommAdminOrSubadmin = userRole === "admin" || userRole === "owner" || userRole === "subadmin";
  const isCommAdmin = userRole === "admin" || userRole === "owner";

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !community) return;
    try {
      setCreateGroupLoading(true);
      await communityApi.createGroup(community._id, {
        name: groupName.trim(),
        description: groupDesc.trim() || undefined,
        type: groupType,
        settings: {
          requireApproval: groupRequireApproval,
          allowChat: groupAllowChat
        }
      });
      toast.success("Group created successfully");
      setIsCreateGroupOpen(false);
      setGroupName("");
      setGroupDesc("");
      setGroupType("text");
      setGroupRequireApproval(false);
      setGroupAllowChat(true);
      await refreshGroups();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to create group");
    } finally {
      setCreateGroupLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    if (!community) return;
    const isAuth = requireAuth(undefined, "Sign in to join this community");
    if (!isAuth) return;
    try {
      setActionLoading(true);
      await communityApi.joinCommunity(community._id);
      toast.success(`Welcome to ${community.name}!`);
      await refreshCommunity();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to join.");
    } finally { setActionLoading(false); }
  };

  const handleLeaveCommunity = async () => {
    if (!community) return;
    try {
      setActionLoading(true);
      await communityApi.leaveCommunity(community._id);
      toast.success("You have left the community.");
      onBack();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to leave");
    } finally { setActionLoading(false); }
  };

  if (!community) return null;

  return (
    <div className="flex h-full w-full overflow-hidden bg-zinc-950/40 relative">
      {/* PANE 1: GROUPS/CHANNELS LIST */}
      <aside className={cn(
        "w-full lg:w-[320px] shrink-0 border-r border-zinc-800/80 bg-zinc-950/70 flex flex-col min-h-0 z-10",
        mobileView !== "list" ? "hidden lg:flex" : "flex"
      )}>
        <div className="p-4 border-b border-zinc-800/80 flex items-center gap-3 shrink-0">
          <button onClick={onBack} className="h-8 w-8 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 flex items-center justify-center shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-black text-white truncate">{community.name}</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{community.memberCount || 1} members</p>
          </div>
          {isCommAdminOrSubadmin && isMember && (
            <button onClick={() => setIsCreateGroupOpen(true)} className="h-8 w-8 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {!isMember ? (
            <div className="py-12 text-center text-xs text-zinc-550 px-4">
              Join this community to view group channels.
            </div>
          ) : groups.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-550">
              No channels created yet.
            </div>
          ) : (
            groups.map((group) => {
              const isActive = group._id === activeGroupId;
              const isLocked = group.settings?.requireApproval && !group.isMember;
              const pendingCount = notifications[group._id] || 0;

              return (
                <button
                  key={group._id}
                  onClick={() => {
                    setActiveGroupId(group._id);
                    setMobileView("chat");
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 group",
                    isActive ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/35"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {group.type === "announcement" ? (
                      <Shield className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    ) : (
                      <Hash className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    )}
                    <span className="text-xs truncate">{group.name}</span>
                    {isLocked && <Lock className="w-2.5 h-2.5 text-zinc-650 shrink-0" />}
                  </div>
                  {pendingCount > 0 && (
                    <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-white text-zinc-950 text-[9px] font-black leading-none ml-2">
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* PANE 2: CHATBOX */}
      <section className={cn(
        "flex-1 flex flex-col min-h-0 bg-transparent overflow-hidden z-10",
        mobileView !== "chat" ? "hidden lg:flex" : "flex"
      )}>
        {!isMember ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-white">Private Community Space</h3>
            <p className="text-xs text-zinc-400">Join this community to access general discussions, tests, and leaderboards.</p>
            <Button onClick={handleJoinCommunity} disabled={actionLoading} className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold h-10 px-6 rounded-xl text-xs border-0 shadow mt-2 transition-all">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Community"}
            </Button>
          </div>
        ) : !activeGroupId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-550">
            <MessageSquare className="w-12 h-12 text-zinc-800 mb-3" />
            <p className="text-xs font-semibold">Select a group channel to view messages.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-transparent">
            {/* Active Group Header */}
            <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur px-4 flex items-center justify-between shrink-0 z-20">
              <div className="flex items-center gap-2.5 min-w-0">
                <button onClick={() => setMobileView("list")} className="h-8 w-8 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 flex lg:hidden items-center justify-center shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 leading-tight">
                    {activeGroup?.type === "announcement" ? <Shield className="w-3.5 h-3.5 text-zinc-500" /> : <Hash className="w-3.5 h-3.5 text-zinc-500" />}
                    {activeGroup?.name}
                  </h3>
                  {activeGroup?.description && (
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-medium leading-none">{activeGroup.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-8 w-8 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 flex items-center justify-center transition-all"><MoreVertical className="w-4 h-4" /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-850 text-zinc-350 p-1 w-48 text-xs shadow-2xl z-50">
                    <DropdownMenuLabel className="text-[9px] uppercase tracking-wider text-zinc-550 py-1.5 px-2 font-black border-b border-zinc-900">Community Features</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => { setActiveTab("about"); setMobileView("tab"); }} className="focus:bg-zinc-900 py-1.5 rounded-lg">About Group</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setActiveTab("leaderboard"); setMobileView("tab"); }} className="focus:bg-zinc-900 py-1.5 rounded-lg">Leaderboard</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setActiveTab("tests"); setMobileView("tab"); }} className="focus:bg-zinc-900 py-1.5 rounded-lg">Classroom Tests</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setActiveTab("members"); setMobileView("tab"); }} className="focus:bg-zinc-900 py-1.5 rounded-lg">Members Roster</DropdownMenuItem>
                    {isCommAdmin && (
                      <DropdownMenuItem onClick={() => { setActiveTab("analytics"); setMobileView("tab"); }} className="focus:bg-zinc-900 py-1.5 rounded-lg">Test Analytics</DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-zinc-900" />
                    {isCommAdmin && (
                      <DropdownMenuItem onClick={() => { setActiveTab("settings"); setMobileView("tab"); }} className="focus:bg-zinc-900 py-1.5 rounded-lg">Global Settings</DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setIsLeaveDialogOpen(true)} disabled={userRole === "owner"} className="text-red-400 focus:bg-red-500/10 focus:text-red-300 py-1.5 rounded-lg">Leave Community</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {activeTab && (
                  <button onClick={() => { setActiveTab(null); setMobileView("chat"); }} className="h-8 w-8 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 flex items-center justify-center"><X className="w-4 h-4" /></button>
                )}
              </div>
            </header>

            <div className="flex-1 min-h-0 flex flex-col bg-transparent overflow-hidden">
              <ChatBox />
            </div>
          </div>
        )}
      </section>

      {/* PANE 3: COLLAPSIBLE RIGHT SIDEBAR */}
      {activeTab && isMember && (
        <aside className={cn(
          "w-full lg:w-[360px] shrink-0 border-l border-zinc-800/80 bg-zinc-950/80 flex flex-col min-h-0 z-20",
          mobileView !== "tab" ? "hidden lg:flex" : "flex"
        )}>
          <div className="h-14 border-b border-zinc-800/80 px-4 flex items-center justify-between shrink-0">
            <button onClick={() => setMobileView("chat")} className="h-8 w-8 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 flex lg:hidden items-center justify-center shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              {activeTab === "about" ? "About Group" :
               activeTab === "leaderboard" ? "Leaderboards" :
               activeTab === "tests" ? "Classroom Assessments" :
               activeTab === "members" ? "Community Members" :
               activeTab === "analytics" ? "Test Analytics" :
               "Community Settings"}
            </span>
            <button onClick={() => { setActiveTab(null); setMobileView("chat"); }} className="h-8 w-8 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            {activeTab === "about" && <RightSidebarAbout />}
            {activeTab === "leaderboard" && <RightSidebarLeaderboard />}
            {activeTab === "tests" && <RightSidebarTests />}
            {activeTab === "members" && <RightSidebarMembers />}
            {activeTab === "analytics" && <RightSidebarAnalytics />}
            {activeTab === "settings" && <RightSidebarSettings />}
          </div>
        </aside>
      )}

      {/* Leave Dialog */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-base">Leave Community?</DialogTitle>
            <DialogDescription className="text-zinc-450 text-xs">You will lose access to member-only chat, tests, and rankings.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsLeaveDialogOpen(false)} className="hover:bg-zinc-800 text-zinc-400 rounded-xl text-xs h-9">Cancel</Button>
            <Button onClick={handleLeaveCommunity} disabled={actionLoading} className="bg-red-500 hover:bg-red-600 border-0 shadow-none text-white rounded-xl text-xs h-9">
              {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
              Confirm Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="border-zinc-850 bg-zinc-950 text-zinc-100 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-base">Create Group Channel</DialogTitle>
            <DialogDescription className="text-zinc-450 text-xs">Add a new channel/group for specific discussions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-xs">Group Name</Label>
              <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. general-chat" className="bg-zinc-900/50 border-zinc-850 rounded-xl text-white text-xs h-9 focus-visible:ring-1 focus-visible:ring-zinc-700" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-xs">Description</Label>
              <Input value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} placeholder="What is this channel about?" className="bg-zinc-900/50 border-zinc-850 rounded-xl text-white text-xs h-9 focus-visible:ring-1 focus-visible:ring-zinc-700" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-xs">Channel Type</Label>
              <Select value={groupType} onValueChange={(v: any) => setGroupType(v)}>
                <SelectTrigger className="bg-zinc-900/50 border-zinc-850 rounded-xl h-9 text-xs text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-850 rounded-xl text-white">
                  <SelectItem value="text" className="text-xs">Text Chat</SelectItem>
                  <SelectItem value="announcement" className="text-xs">Announcement Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2.5 pt-1">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-zinc-300 font-medium group-hover:text-white transition-colors">Require Admin Approval to Join</span>
                <Switch checked={groupRequireApproval} onCheckedChange={setGroupRequireApproval} className="data-[state=checked]:bg-white" />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-zinc-300 font-medium group-hover:text-white transition-colors">Allow Members to Send Messages</span>
                <Switch checked={groupAllowChat} onCheckedChange={setGroupAllowChat} className="data-[state=checked]:bg-white" />
              </label>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="ghost" onClick={() => setIsCreateGroupOpen(false)} className="rounded-xl hover:bg-zinc-900 text-zinc-400 text-xs h-9">Cancel</Button>
            <Button onClick={handleCreateGroup} disabled={createGroupLoading} className="bg-white hover:bg-zinc-200 text-zinc-950 font-black rounded-xl px-6 h-9 text-xs border-0 min-w-[80px]">
              {createGroupLoading ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── ROOT COMMUNITIES PAGE ────────────────────────────────────────────────────

function CommunitiesPageContent() {
  const { community, loading: activeCommunityLoading } = useCommunity();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { requireAuth } = useRequireAuth();

  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [joiningCommunityId, setJoiningCommunityId] = useState<string | null>(null);
  const joinRequestLockRef = useRef<Set<string>>(new Set());

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "", description: "", type: "open" as "open" | "domain_restricted", domain: "",
  });

  // Mobile navigation views: "list", "chat", "tab"
  const [mobileView, setMobileView] = useState<"list" | "chat" | "tab">("list");

  // Sync parameters from URL
  const activeCommunityId = searchParams.get("id") || null;
  const activeGroupId = searchParams.get("groupId") || null;
  const activeTab = searchParams.get("tab") || null;

  const handleSetActiveTab = (tab: string | null) => {
    if (typeof window !== "undefined" && searchParams) {
      const params = new URLSearchParams(searchParams.toString());
      if (tab) {
        params.set("tab", tab);
      } else {
        params.delete("tab");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleSetActiveGroupId = (groupId: string | null) => {
    if (typeof window !== "undefined" && searchParams) {
      const params = new URLSearchParams(searchParams.toString());
      if (groupId) {
        params.set("groupId", groupId);
      } else {
        params.delete("groupId");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search.trim()); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        const [list, mine] = await Promise.all([communityApi.getCommunities(), userApi.getCommunities()]);
        setJoinedCommunityIds(new Set((mine || []).map((c: any) => c._id || c.id).filter(Boolean)));
        setAllCommunities(list);
        setCommunities(list);
      } else {
        const list = await communityApi.getCommunities();
        setJoinedCommunityIds(new Set());
        setAllCommunities(list);
        setCommunities(list);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized || authLoading) return;
    fetchCommunities();
  }, [initialized, isAuthenticated, authLoading]);

  useEffect(() => {
    if (!debouncedSearch) { setCommunities(allCommunities); setCurrentPage(1); return; }
    const filtered = allCommunities.filter((c) => c.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
    setCommunities(filtered);
    setCurrentPage(1);
  }, [debouncedSearch, allCommunities]);

  const totalPages = Math.ceil(communities.length / itemsPerPage);
  const paginatedCommunities = communities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCreateCommunity = async () => {
    const isAuth = requireAuth(undefined, "Sign in to create a community");
    if (!isAuth) return;
    if (!newCommunity.name || !newCommunity.description) { toast.error("Name and description are required"); return; }
    if (newCommunity.type === "domain_restricted" && !newCommunity.domain) { toast.error("Domain is required"); return; }
    const normalizedDomain = newCommunity.type === "domain_restricted" ? normalizeDomainInput(newCommunity.domain) : "";
    if (newCommunity.type === "domain_restricted" && !normalizedDomain) { toast.error("Enter a valid domain"); return; }
    setCreateLoading(true);
    try {
      const created = await communityApi.createCommunity({
        name: newCommunity.name, description: newCommunity.description, type: newCommunity.type,
        domain: newCommunity.type === "domain_restricted" ? normalizedDomain : undefined,
      });
      toast.success("Community created successfully");
      setIsCreateDialogOpen(false);
      setNewCommunity({ name: "", description: "", type: "open", domain: "" });
      await fetchCommunities();
      router.push(`/communities?id=${created._id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Create failed");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    const isAuth = requireAuth(undefined, "Sign in to join this community");
    if (!isAuth) return;
    if (joinRequestLockRef.current.has(communityId)) return;
    joinRequestLockRef.current.add(communityId);
    setJoiningCommunityId(communityId);
    try {
      await communityApi.joinCommunity(communityId);
      toast.success("Joined community successfully", { id: `community-join-success-${communityId}` });
      setJoinedCommunityIds((prev) => new Set(prev).add(communityId));
      const updateMember = (c: Community) => c._id === communityId ? { ...c, memberCount: (c.memberCount || 0) + 1 } : c;
      setAllCommunities((prev) => prev.map(updateMember));
      setCommunities((prev) => prev.map(updateMember));
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to join community", { id: `community-join-error-${communityId}` });
    } finally {
      joinRequestLockRef.current.delete(communityId);
      setJoiningCommunityId(null);
    }
  };

  const handleSelectCommunity = (id: string) => {
    if (typeof window !== "undefined") {
      router.push(`/communities?id=${id}`);
      setMobileView("list");
    }
  };

  const handleBackToCommunities = () => {
    if (typeof window !== "undefined") {
      router.push(`/communities`);
      setMobileView("list");
    }
  };

  if (!initialized) return null;

  return (
    <div className="h-full w-full flex flex-col font-sans overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 relative">
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-500/10 to-transparent pointer-events-none" />

      {activeCommunityId && !activeCommunityLoading && community ? (
        <InnerCommunityLayout
          onBack={handleBackToCommunities}
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          activeGroupId={activeGroupId}
          setActiveGroupId={handleSetActiveGroupId}
          mobileView={mobileView}
          setMobileView={setMobileView}
        />
      ) : (
        <div className="flex h-full w-full overflow-hidden relative">
          {/* LEFT COLUMN: COMMUNITIES DISCOVER SECTION */}
          <aside className="w-full lg:w-[340px] shrink-0 border-r border-zinc-800/80 bg-zinc-950/80 flex flex-col min-h-0 z-10">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800/80 shrink-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/60 text-zinc-300 text-[9px] font-black uppercase tracking-widest mb-2 border border-zinc-700/40 w-fit">
                <Sparkles className="h-3 w-3 text-zinc-400" />
                <span>Discover Spaces</span>
              </div>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-black text-white tracking-tight leading-none">Communities</h1>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="h-8 w-8 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center transition-all border-0 shadow">
                      <Plus className="h-4.5 w-4.5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-950 border border-zinc-850 rounded-2xl max-w-sm text-zinc-100">
                    <DialogHeader>
                      <DialogTitle className="text-white text-base">Create Community</DialogTitle>
                      <DialogDescription className="text-zinc-450 text-xs">Build a space for developers to connect.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-1">
                        <Label className="text-zinc-300 text-xs">Name</Label>
                        <Input value={newCommunity.name} onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })} className="bg-zinc-900 border-zinc-850 rounded-xl text-white text-xs h-9 focus-visible:ring-1 focus-visible:ring-zinc-700" placeholder="e.g. Next.js Masters" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-zinc-300 text-xs">Description</Label>
                        <Textarea value={newCommunity.description} onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })} className="bg-zinc-900 border-zinc-855 h-20 rounded-xl text-white text-xs focus-visible:ring-1 focus-visible:ring-zinc-700 resize-none" placeholder="What is this community about?" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-zinc-300 text-xs">Access Type</Label>
                        <Select value={newCommunity.type} onValueChange={(v: any) => setNewCommunity({ ...newCommunity, type: v })}>
                          <SelectTrigger className="bg-zinc-900 border-zinc-850 rounded-xl h-9 text-xs text-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-850 rounded-xl text-white">
                            <SelectItem value="open" className="text-xs">Open</SelectItem>
                            <SelectItem value="domain_restricted" className="text-xs">Domain Restricted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newCommunity.type === "domain_restricted" && (
                        <div className="space-y-1">
                          <Label className="text-zinc-300 text-xs">Domain</Label>
                          <Input value={newCommunity.domain} onChange={(e) => setNewCommunity({ ...newCommunity, domain: e.target.value })} className="bg-zinc-900 border-zinc-850 rounded-xl text-white text-xs h-9 focus-visible:ring-1 focus-visible:ring-zinc-700" placeholder="company.com" />
                        </div>
                      )}
                    </div>
                    <DialogFooter className="pt-2">
                      <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl hover:bg-zinc-900 text-zinc-400 text-xs h-9">Cancel</Button>
                      <Button onClick={handleCreateCommunity} disabled={createLoading} className="bg-white hover:bg-zinc-200 text-zinc-950 font-black rounded-xl px-6 h-9 text-xs border-0 min-w-[80px]">
                        {createLoading ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search Bar */}
              <div className="relative mt-3 group">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-zinc-350 transition-colors" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search communities..." className="bg-zinc-900/50 border border-zinc-850 text-zinc-100 pl-9 pr-4 h-9 text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-zinc-700 placeholder:text-zinc-650 w-full" />
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
              {loading ? (
                <div className="p-4"><CommunityTableSkeleton /></div>
              ) : paginatedCommunities.length > 0 ? (
                paginatedCommunities.map((c) => {
                  const isJoined = joinedCommunityIds.has(c._id);
                  const isJoining = joiningCommunityId === c._id;
                  const gradient = getGradient(c.name);
                  const initials = c.name.slice(0, 2).toUpperCase();

                  return (
                    <div
                      key={c._id}
                      onClick={() => isJoined && handleSelectCommunity(c._id)}
                      className={cn(
                        "group relative flex flex-col py-3.5 px-1 border-b border-zinc-900 hover:bg-zinc-900/10 transition-all duration-300 cursor-pointer overflow-hidden",
                        isJoined && "hover:translate-x-0.5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar with dynamic modern gradient */}
                        <div className={cn(
                          "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border border-zinc-800/80 font-black text-xs text-white shadow-lg bg-gradient-to-br relative overflow-hidden group-hover:scale-105 transition-transform duration-300",
                          gradient
                        )}>
                          {/* Subtle inner gloss shadow overlay */}
                          <div className="absolute inset-0 bg-white/10 opacity-40" />
                          <span className="relative z-10 tracking-wider">{initials}</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-black text-zinc-200 group-hover:text-white truncate leading-none transition-colors duration-200">
                              {c.name}
                            </h3>
                            {c.type === "domain_restricted" && (
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider scale-90 shrink-0">
                                Domain
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 relative z-10" onClick={(e) => e.stopPropagation()}>
                          {isJoined ? (
                            <Button size="sm" onClick={() => handleSelectCommunity(c._id)} className="h-7 px-3.5 rounded-lg bg-white/10 hover:bg-white hover:text-zinc-950 text-white text-[10px] font-black border border-white/5 hover:border-white transition-all active:scale-95 duration-300 shadow">
                              Open
                            </Button>
                          ) : (
                            <Button disabled={isJoining} onClick={() => handleJoinCommunity(c._id)} className="h-7 px-3.5 rounded-lg bg-zinc-900 hover:bg-white hover:text-zinc-950 text-zinc-300 text-[10px] font-black border border-zinc-800 hover:border-white transition-all active:scale-95 duration-300 shadow">
                              {isJoining ? <Loader2 className="h-3 w-3 animate-spin" /> : "Join"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-zinc-550">
                  No communities found.
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-900 shrink-0">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-7 px-2 bg-zinc-900/60 border border-zinc-850 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white disabled:opacity-30">Prev</button>
                <span className="text-[10px] text-zinc-550">
                  <span className="text-brand-500 font-bold">{currentPage}</span> of {totalPages}
                </span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-7 px-2 bg-zinc-900/60 border border-zinc-850 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white disabled:opacity-30">Next</button>
              </div>
            )}
          </aside>

          {/* CENTER PANEL: WELCOME SCREEN */}
          <section className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 text-center bg-zinc-950/20">
            {activeCommunityId && activeCommunityLoading ? (
              <div className="max-w-sm space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-550 mx-auto" />
                <p className="text-xs text-zinc-400 font-medium animate-pulse">Loading community space...</p>
              </div>
            ) : (
              <div className="max-w-sm space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-zinc-900/50 border border-zinc-850/50 flex items-center justify-center mx-auto text-zinc-400 shadow-inner">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-black text-white tracking-tight">Select a Community</h2>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">Join or open a community room from the left sidebar to start chatting with teammates and competing in challenges.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default function CommunitiesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-550" />
      </div>
    }>
      <CommunitiesPageWithProvider />
    </Suspense>
  );
}

function CommunitiesPageWithProvider() {
  const searchParams = useSearchParams();
  const activeCommunityId = searchParams.get("id") || null;

  return (
    <CommunityProvider communityId={activeCommunityId}>
      <CommunitiesPageContent />
    </CommunityProvider>
  );
}