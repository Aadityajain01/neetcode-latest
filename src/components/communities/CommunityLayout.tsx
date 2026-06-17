"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCommunity } from "./CommunityContext";
import { CommunityShellSkeleton } from "@/components/skeletons/site-skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { communityApi } from "@/lib/api-modules";
import { toast } from "sonner";
import {
  BarChart3, FileText, Loader2, Lock, LogOut, MessageSquare,
  MoreVertical, Settings, Trophy, ArrowLeft, Users, Shield, Hash, Plus, Check, X,
} from "lucide-react";

export function CommunityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    community,
    isMember,
    userRole,
    loading,
    refreshCommunity,
    groups,
    activeGroupId,
    setActiveGroupId,
    notifications,
    refreshGroups,
    activeGroup,
    isGroupMember,
    groupUserRole,
  } = useCommunity();

  const [actionLoading, setActionLoading] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  // Group creation dialog state
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupType, setGroupType] = useState<"text" | "announcement">("text");
  const [groupRequireApproval, setGroupRequireApproval] = useState(false);
  const [groupAllowChat, setGroupAllowChat] = useState(true);
  const [createGroupLoading, setCreateGroupLoading] = useState(false);

  // Right sidebar details state
  const [activeGroupRequests, setActiveGroupRequests] = useState<any[]>([]);
  const [activeGroupMembers, setActiveGroupMembers] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  const isCommAdminOrSubadmin = userRole === "admin" || userRole === "owner" || userRole === "subadmin";
  const isCommAdmin = userRole === "admin" || userRole === "owner";
  const isGroupAdmin = isCommAdmin || groupUserRole === "owner" || groupUserRole === "admin" || groupUserRole === "subadmin";

  // Fetch group requests and members when active group changes
  useEffect(() => {
    if (!community?._id || !activeGroupId || !isMember) return;

    const fetchMembers = async () => {
      try {
        setMembersLoading(true);
        const list = await communityApi.getGroupMembers(community._id, activeGroupId);
        setActiveGroupMembers(list);
      } catch (err) {
        console.error("Failed to load group members:", err);
      } finally {
        setMembersLoading(false);
      }
    };

    const fetchRequests = async () => {
      if (!isGroupAdmin) {
        setActiveGroupRequests([]);
        return;
      }
      try {
        setRequestsLoading(true);
        const list = await communityApi.getGroupJoinRequests(community._id, activeGroupId);
        setActiveGroupRequests(list);
      } catch (err) {
        console.error("Failed to load join requests:", err);
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchMembers();
    fetchRequests();
  }, [community?._id, activeGroupId, isMember, userRole, groupUserRole]);

  if (loading) {
    return <CommunityShellSkeleton />;
  }

  if (!community) {
    return (
      <div className="p-8 text-center text-zinc-450">Community not found.</div>
    );
  }

  const basePath = `/communities/${community._id}`;
  const roleLabel =
    userRole === "owner" ? "Owner"
    : userRole === "admin" ? "Admin"
    : userRole === "subadmin" ? "Subadmin"
    : "Member";

  const navItems = [
    { name: "Chat", path: `${basePath}/chat`, icon: MessageSquare, show: true },
    { name: "Leaderboard", path: `${basePath}/leaderboard`, icon: Trophy, show: true },
    { name: "Tests", path: `${basePath}/tests`, icon: FileText, show: true },
    { name: "Members", path: `${basePath}/members`, icon: Users, show: isMember },
    { name: "Analytics", path: `${basePath}/analytics`, icon: BarChart3, show: isCommAdmin },
    { name: "Settings", path: `${basePath}/settings`, icon: Settings, show: true },
  ].filter((item) => item.show);

  const handleJoinCommunity = async () => {
    setActionLoading(true);
    try {
      await communityApi.joinCommunity(community._id);
      toast.success(`Welcome to ${community.name}!`);
      await refreshCommunity();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to join.");
    } finally { setActionLoading(false); }
  };

  const handleLeaveCommunity = async () => {
    setActionLoading(true);
    try {
      await communityApi.leaveCommunity(community._id);
      toast.success("You have left the community.");
      router.push("/communities");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to leave");
    } finally { setActionLoading(false); }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
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

  const handleResolveRequest = async (requestId: string, action: "approve" | "reject") => {
    if (!community?._id || !activeGroupId) return;
    try {
      await communityApi.resolveGroupJoinRequest(community._id, activeGroupId, requestId, action);
      toast.success(`Request ${action}ed successfully`);
      
      // Update UI lists
      const list = await communityApi.getGroupJoinRequests(community._id, activeGroupId);
      setActiveGroupRequests(list);
      
      const membersList = await communityApi.getGroupMembers(community._id, activeGroupId);
      setActiveGroupMembers(membersList);
      
      await refreshGroups();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || `Failed to ${action} request`);
    }
  };

  const handleToggleRequireApproval = async () => {
    if (!community?._id || !activeGroup) return;
    try {
      const updatedRequireApproval = !activeGroup.settings.requireApproval;
      await communityApi.updateGroupSettings(community._id, activeGroup._id, {
        settings: {
          ...activeGroup.settings,
          requireApproval: updatedRequireApproval
        }
      });
      toast.success("Group settings updated");
      await refreshGroups();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update settings");
    }
  };

  const handleToggleAllowChat = async () => {
    if (!community?._id || !activeGroup) return;
    try {
      const updatedAllowChat = !activeGroup.settings.allowChat;
      await communityApi.updateGroupSettings(community._id, activeGroup._id, {
        settings: {
          ...activeGroup.settings,
          allowChat: updatedAllowChat
        }
      });
      toast.success("Group settings updated");
      await refreshGroups();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update settings");
    }
  };

  return (
    <div className="relative flex h-auto lg:h-full w-full min-h-0 flex-col overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 text-zinc-100 font-sans">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-500/10 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[1500px] flex-col px-3 py-3 sm:px-4 sm:py-4 lg:w-[90%]">
        <section className="flex h-auto lg:h-full min-h-0 flex-col overflow-visible lg:overflow-hidden rounded-[1.5rem] border border-zinc-800/60 bg-zinc-900/35 backdrop-blur-xl shadow-xl">
          {/* ── Top Header Bar ─────────────────────────────────────── */}
          <header className="h-[60px] shrink-0 flex items-center justify-between px-4 md:px-6 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 z-30">
            {/* Left: back + community info */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => router.push("/communities")}
                className="flex items-center justify-center h-9 w-9 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className={cn(
                "h-9 w-9 rounded-xl flex shrink-0 items-center justify-center font-black text-base shadow-sm border border-zinc-800/80 text-zinc-300 bg-zinc-900/40"
              )}>
                {community.type === "domain_restricted" ? (
                  <Shield className="h-4 w-4 text-zinc-400" />
                ) : (
                  <Hash className="h-4 w-4 text-zinc-400" />
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <h1 className="text-[15px] font-bold text-zinc-100 leading-tight truncate">
                  {community.name}
                </h1>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                  {community.type === "domain_restricted" && <Lock className="h-2.5 w-2.5" />}
                  <span>{community.memberCount || 1} members</span>
                  <span className="text-zinc-700">·</span>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-zinc-800 text-zinc-400 bg-zinc-900/50"
                  )}>
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {isMember ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center h-9 w-9 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-52 rounded-2xl border-zinc-800 bg-zinc-900 p-1.5 text-zinc-200 shadow-2xl shadow-black/50 backdrop-blur-xl"
                  >
                    <div className="px-3 py-2 mb-1 border-b border-zinc-800">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Community Menu</p>
                    </div>
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname.startsWith(item.path);
                      return (
                        <DropdownMenuItem
                          key={item.path}
                          onSelect={() => router.push(item.path)}
                          className={cn(
                            "rounded-xl text-sm cursor-pointer hover:bg-zinc-800 hover:text-white transition-colors my-0.5 gap-2.5",
                            isActive && "bg-zinc-800 text-white font-semibold"
                          )}
                        >
                          <Icon className="h-4 w-4 text-zinc-400" />
                          {item.name}
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator className="bg-zinc-800 my-1" />
                    <DropdownMenuItem
                      onSelect={() => setIsLeaveDialogOpen(true)}
                      disabled={userRole === "owner"}
                      className="rounded-xl text-sm text-red-400 cursor-pointer hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300 transition-colors gap-2.5"
                    >
                      <LogOut className="h-4 w-4" />
                      Leave Community
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  size="sm"
                  onClick={handleJoinCommunity}
                  disabled={actionLoading}
                  className="h-9 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-4 text-xs border-0 shadow-sm transition-all"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Join Community
                </Button>
              )}
            </div>
          </header>

          {/* ── Content Area ──────────────────────────────────────────── */}
          <main className="flex flex-1 min-h-0 flex-col overflow-visible lg:overflow-hidden bg-transparent">
            {!isMember ? (
              <div className="h-full flex flex-col items-center justify-center gap-5 p-10 text-center">
                <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center mb-2 shadow-inner border border-zinc-800">
                  <Lock className="h-10 w-10 text-zinc-600" />
                </div>
                <h2 className="text-xl font-black text-white">Private Community Space</h2>
                <p className="text-sm text-zinc-400 max-w-sm font-medium">
                  Join this community to view messages, participate in tests, and see rankings.
                </p>
                <Button
                  onClick={handleJoinCommunity}
                  disabled={actionLoading}
                  className="rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-8 h-11 mt-2 border-0 shadow-sm transition-all"
                >
                  {actionLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Join Community
                </Button>
              </div>
            ) : (
              <div className="flex flex-1 min-h-0 w-full overflow-hidden">
                {/* Left Sidebar: Groups List */}
                <aside className="w-60 shrink-0 border-r border-zinc-800/80 bg-zinc-950/40 flex flex-col min-h-0 hidden md:flex">
                  <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Channels</span>
                    {isCommAdminOrSubadmin && (
                      <button
                        onClick={() => setIsCreateGroupOpen(true)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 space-y-0.5 no-scrollbar">
                    {groups.map((group) => {
                      const isActive = group._id === activeGroupId;
                      const isAnnouncement = group.type === "announcement";
                      const pendingCount = notifications[group._id] || 0;
                      const isLocked = group.settings?.requireApproval && !group.isMember;
                      
                      return (
                        <button
                          key={group._id}
                          onClick={() => setActiveGroupId(group._id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-200 group/item",
                            isActive
                              ? "bg-zinc-800 text-white font-bold"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isAnnouncement ? (
                              <Shield className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                            ) : (
                              <Hash className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                            )}
                            <span className="text-xs truncate">{group.name}</span>
                            {isLocked && <Lock className="w-2.5 h-2.5 text-zinc-650" />}
                          </div>
                          
                          {pendingCount > 0 && (
                            <span className="flex items-center justify-center min-w-5 h-5 px-1 bg-white text-zinc-950 text-[10px] font-black rounded-full shadow">
                              {pendingCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </aside>

                {/* Center Area */}
                <div className="flex-1 flex flex-col min-h-0 bg-transparent overflow-hidden">
                  {children}
                </div>

                {/* Right Sidebar: Active Group Details, settings, members, approvals */}
                {activeGroup && (
                  <aside className="w-64 xl:w-72 shrink-0 border-l border-zinc-800/80 bg-zinc-950/40 flex flex-col min-h-0 hidden lg:flex">
                    <div className="p-4 border-b border-zinc-800/60 flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">About Channel</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5">
                      {/* Metadata */}
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-black text-white">#{activeGroup.name}</h3>
                        {activeGroup.description && (
                          <p className="text-xs text-zinc-450 leading-relaxed font-medium">{activeGroup.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                          <span>{activeGroup.memberCount || 1} members</span>
                          <span>·</span>
                          <span className="capitalize">{activeGroup.type}</span>
                        </div>
                      </div>
                      
                      {/* Settings Toggle (if group owner/admin or comm admin) */}
                      {isGroupAdmin && (
                        <div className="space-y-3 pt-3 border-t border-zinc-900/60">
                          <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Settings</h4>
                          
                          <div className="space-y-2">
                            {/* Require Approval Toggle */}
                            {!activeGroup.isDefault && (
                              <label className="flex items-center justify-between cursor-pointer group/label">
                                <span className="text-xs text-zinc-300 font-medium group-hover/label:text-white transition-colors">Require Approval</span>
                                <input
                                  type="checkbox"
                                  checked={activeGroup.settings?.requireApproval || false}
                                  onChange={handleToggleRequireApproval}
                                  className="sr-only peer"
                                />
                                <div className="relative w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-400 after:border-zinc-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-white peer-checked:after:bg-zinc-950"></div>
                              </label>
                            )}
                            
                            {/* Allow Chat Toggle */}
                            <label className="flex items-center justify-between cursor-pointer group/label">
                              <span className="text-xs text-zinc-300 font-medium group-hover/label:text-white transition-colors">Allow Member Chat</span>
                              <input
                                  type="checkbox"
                                  checked={activeGroup.settings?.allowChat ?? true}
                                  onChange={handleToggleAllowChat}
                                  className="sr-only peer"
                                />
                              <div className="relative w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-400 after:border-zinc-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-white peer-checked:after:bg-zinc-950"></div>
                            </label>
                          </div>
                        </div>
                      )}
                      
                      {/* Join Requests Section (if group requireApproval is true and user is admin/subadmin) */}
                      {isGroupAdmin && activeGroup.settings?.requireApproval && activeGroupRequests.length > 0 && (
                        <div className="space-y-2 pt-3 border-t border-zinc-900/60">
                          <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                            <span>Join Requests</span>
                            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[8px] font-black">{activeGroupRequests.length} pending</span>
                          </h4>
                          
                          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                            {activeGroupRequests.map((req) => (
                              <div key={req._id} className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/80 p-2.5 rounded-xl">
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-zinc-200 truncate">{req.userId?.displayName || "User"}</p>
                                  <p className="text-[9px] text-zinc-500 truncate">{req.userId?.email}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                  <button
                                    onClick={() => handleResolveRequest(req._id, "approve")}
                                    className="h-6 w-6 rounded-lg bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-200 active:scale-95 transition-all shadow"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleResolveRequest(req._id, "reject")}
                                    className="h-6 w-6 rounded-lg bg-zinc-850 text-zinc-300 flex items-center justify-center hover:bg-zinc-850 active:scale-95 transition-all border border-zinc-800"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Group Members List */}
                      {isGroupMember && (
                        <div className="space-y-3 pt-3 border-t border-zinc-900/60">
                          <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Members</h4>
                          
                          <div className="space-y-2.5 max-h-64 overflow-y-auto no-scrollbar">
                            {activeGroupMembers.map((member) => {
                              const name = member.userId?.displayName || "Member";
                              const email = member.userId?.email || "";
                              const avatar = member.userId?.avatarUrl;
                              const role = member.role;
                              
                              return (
                                <div key={member._id} className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {avatar ? (
                                      <img src={avatar} alt={name} className="w-6 h-6 rounded-full shrink-0 object-cover border border-zinc-800" />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-750 flex items-center justify-center text-[10px] font-bold text-zinc-350 shrink-0 capitalize">
                                        {name[0]}
                                      </div>
                                    )}
                                    <div className="min-w-0 flex flex-col">
                                      <span className="text-xs font-medium text-zinc-300 truncate leading-tight">{name}</span>
                                      <span className="text-[8px] text-zinc-500 truncate leading-tight mt-0.5">{email}</span>
                                    </div>
                                  </div>
                                  
                                  {role !== "member" && (
                                    <span className={cn(
                                      "text-[7px] font-black uppercase tracking-wider px-1 py-0.5 rounded border shrink-0",
                                      role === "owner" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                                      role === "admin" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                                      "text-zinc-400 bg-zinc-800 border-zinc-750"
                                    )}>
                                      {role}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </aside>
                )}
              </div>
            )}
          </main>
        </section>
      </div>

      {/* ── Create Group Dialog ─────────────────────────────────────────── */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="border-zinc-850 bg-zinc-950 text-zinc-100 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-base">Create Group Channel</DialogTitle>
            <DialogDescription className="text-zinc-450 text-xs">Add a new channel/group for specific discussions.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-xs">Group Name</Label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. general-chat"
                className="bg-zinc-900/50 border-zinc-850 rounded-xl text-white text-xs h-9 focus-visible:ring-1 focus-visible:ring-zinc-700"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-xs">Description</Label>
              <Input
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                placeholder="What is this channel about?"
                className="bg-zinc-900/50 border-zinc-850 rounded-xl text-white text-xs h-9 focus-visible:ring-1 focus-visible:ring-zinc-700"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-xs">Channel Type</Label>
              <Select value={groupType} onValueChange={(v: any) => setGroupType(v)}>
                <SelectTrigger className="bg-zinc-900/50 border-zinc-850 rounded-xl h-9 text-xs text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-850 rounded-xl text-white">
                  <SelectItem value="text" className="rounded-lg focus:bg-zinc-800 focus:text-white text-xs">Text Chat</SelectItem>
                  <SelectItem value="announcement" className="rounded-lg focus:bg-zinc-800 focus:text-white text-xs">Announcement Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2.5 pt-1">
              <label className="flex items-center justify-between cursor-pointer group/label">
                <span className="text-xs text-zinc-300 font-medium group-hover/label:text-white transition-colors">Require Admin Approval to Join</span>
                <input
                  type="checkbox"
                  checked={groupRequireApproval}
                  onChange={(e) => setGroupRequireApproval(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-400 after:border-zinc-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-white peer-checked:after:bg-zinc-950"></div>
              </label>
              
              <label className="flex items-center justify-between cursor-pointer group/label">
                <span className="text-xs text-zinc-300 font-medium group-hover/label:text-white transition-colors">Allow Members to Send Messages</span>
                <input
                  type="checkbox"
                  checked={groupAllowChat}
                  onChange={(e) => setGroupAllowChat(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-400 after:border-zinc-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-white peer-checked:after:bg-zinc-950"></div>
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

      {/* ── Leave Dialog ──────────────────────────────────────────── */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-base">Leave Community?</DialogTitle>
            <DialogDescription className="text-zinc-450 text-xs">
              You will lose access to member-only chat, tests, and rankings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsLeaveDialogOpen(false)} className="hover:bg-zinc-800 text-zinc-400 rounded-xl text-xs h-9">
              Cancel
            </Button>
            <Button
              onClick={handleLeaveCommunity}
              disabled={actionLoading}
              className="bg-red-500 hover:bg-red-600 border-0 shadow-none text-white rounded-xl text-xs h-9"
            >
              {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
              Confirm Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
