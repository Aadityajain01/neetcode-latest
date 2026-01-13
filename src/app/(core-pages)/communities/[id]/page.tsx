"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link"; // ✅ 1. Import Link
import { useAuthStore } from "@/store/auth-store";
import { communityApi, Community, CommunityMember } from "@/lib/api-modules";
import MainLayout from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BackButton } from "@/components/BackButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Loader2,
  Users,
  Lock,
  Globe,
  Settings,
  LogOut,
  ShieldAlert,
  MoreVertical,
  Crown,
  Shield,
  UserX,
  ArrowRightLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CommunityDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;
  const { user, initialized, isAuthenticated } = useAuthStore();

  const [community, setCommunity] = useState<Community | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dialog States
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (!initialized || !communityId) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchCommunityData();
  }, [initialized, isAuthenticated, communityId]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const communityData = await communityApi.getCommunityById(communityId);
      setCommunity(communityData.community);
      setEditForm({ 
        name: communityData.community.name, 
        description: communityData.community.description 
      });
      setIsMember(communityData.isMember);
      setMyRole(communityData.userRole || null);

      try {
        const membersList = await communityApi.getMembers(communityId);
        setMembers(Array.isArray(membersList) ? membersList : []);
      } catch (e) {
        setMembers([]); 
      }
    } catch (error: any) {
      toast.error("Failed to load community details");
      router.push("/communities");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    if (!community) return;
    setActionLoading(true);
    try {
      await communityApi.joinCommunity(communityId);
      toast.success(`Welcome to ${community.name}!`);
      fetchCommunityData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to join.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveCommunity = async () => {
    setActionLoading(true);
    try {
      await communityApi.leaveCommunity(communityId);
      toast.success("You have left the community.");
      router.push("/communities");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to leave");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    setActionLoading(true);
    try {
      await communityApi.updateSettings(communityId, editForm);
      toast.success("Settings updated");
      setIsSettingsOpen(false);
      fetchCommunityData();
    } catch (error: any) {
      toast.error("Failed to update settings");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCommunity = async () => {
    setActionLoading(true);
    try {
      await communityApi.deleteCommunity(communityId);
      toast.success("Community deleted");
      router.push("/communities");
    } catch (error: any) {
      toast.error("Failed to delete community");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if(!confirm("Remove this user?")) return;
    try {
      await communityApi.removeMember(communityId, userId);
      toast.success("Member removed");
      fetchCommunityData();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handlePromoteMember = async (userId: string) => {
    try {
      await communityApi.promoteMember(communityId, userId);
      toast.success("Member promoted to Admin");
      fetchCommunityData();
    } catch (error) {
      toast.error("Failed to promote member");
    }
  };

  const handleTransferOwnership = async (userId: string) => {
    if(!confirm("Transfer ownership? You will become a regular member.")) return;
    try {
      await communityApi.transferOwnership(communityId, userId);
      toast.success("Ownership transferred");
      fetchCommunityData();
    } catch (error) {
      toast.error("Failed to transfer ownership");
    }
  };

  const isAdmin = myRole === "owner" || myRole === "admin";
  const isOwner = myRole === "owner";

  if (loading) return (
    <MainLayout>
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    </MainLayout>
  );

  if (!community) return null;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
        <BackButton href="/communities" className="mb-6" />

        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 md:p-12 mb-10">
           <div className={cn("absolute top-0 right-0 w-96 h-96 blur-[100px] rounded-full opacity-20 pointer-events-none",
              community.type === 'domain_restricted' ? "bg-amber-500" : "bg-emerald-500"
           )} />

           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-4">
                    {community.type === 'domain_restricted' ? (
                       <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase tracking-wide px-3 py-1">
                          <Lock className="w-3 h-3 mr-1" /> Private Group
                       </Badge>
                    ) : (
                       <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-wide px-3 py-1">
                          <Globe className="w-3 h-3 mr-1" /> Public Group
                       </Badge>
                    )}
                    {isMember && <Badge className="bg-zinc-100 text-zinc-900 hover:bg-white">Member</Badge>}
                 </div>
                 
                 <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">{community.name}</h1>
                 <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">{community.description}</p>
                 
                 {community.type === 'domain_restricted' && (
                    <div className="mt-6 flex items-center gap-2 text-sm text-amber-500/80 bg-amber-950/30 w-fit px-4 py-2 rounded-lg border border-amber-900/50">
                       <ShieldAlert className="w-4 h-4" />
                       <span>Only accessible to users with <strong>@{community.domain}</strong> email</span>
                    </div>
                 )}
              </div>

              <div className="w-full md:w-auto flex flex-col gap-3 min-w-[200px] bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
                 {isMember ? (
                    <>
                       {isOwner && (
                          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                                <Settings className="w-4 h-4 mr-2" /> Settings
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                              <DialogHeader>
                                <DialogTitle>Community Settings</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Name</Label>
                                  <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="bg-zinc-900 border-zinc-800" />
                                </div>
                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="bg-zinc-900 border-zinc-800" />
                                </div>
                              </div>
                              <DialogFooter className="flex-col sm:flex-row gap-2">
                                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="destructive" type="button" className="sm:mr-auto">Delete Community</Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                                    <DialogHeader><DialogTitle>Are you sure?</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
                                    <DialogFooter><Button onClick={handleDeleteCommunity} className="bg-red-600">Yes, Delete</Button></DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Button onClick={handleUpdateSettings} className="bg-emerald-500">Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                       )}
                       
                       <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                          <DialogTrigger asChild>
                             <Button variant="destructive" disabled={isOwner || actionLoading} className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20">
                                <LogOut className="w-4 h-4 mr-2" /> Leave
                             </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                             <DialogHeader>
                                <DialogTitle>Leave Community?</DialogTitle>
                                <DialogDescription>You will lose access to member-only channels and leaderboards.</DialogDescription>
                             </DialogHeader>
                             <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsLeaveDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleLeaveCommunity} className="bg-red-600 hover:bg-red-700">Confirm Leave</Button>
                             </DialogFooter>
                          </DialogContent>
                       </Dialog>
                    </>
                 ) : (
                    <Button size="lg" onClick={handleJoinCommunity} disabled={actionLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">
                       {actionLoading ? <Loader2 className="animate-spin" /> : "Join Community"}
                    </Button>
                 )}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-800 rounded-lg"><Users className="w-5 h-5 text-white" /></div>
              <h2 className="text-2xl font-bold text-white">Members <span className="text-zinc-500 ml-2 text-lg font-normal">{members.length}</span></h2>
           </div>

           {members.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
                 No members found. (Try refreshing or joining)
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {members.map((member) => {
                    const userData = member.userId as any;
                    const isUserOwner = member.role === 'owner';
                    const isUserAdmin = member.role === 'admin';
                    const isMe = userData._id === user?.id;
                    const canManage = (isAdmin && !isUserOwner && !isMe) || (isOwner && !isMe);

                    return (
                       <div key={member._id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors group">
                          
                          {/* ✅ 1. USER PROFILE LINK (Left Side) */}
                          {/* We wrap ONLY the user info in the Link, not the whole row */}
                          <Link 
                            href={`/profile/${userData._id}`} 
                            className="flex-1 flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                          >
                             <div className={cn("h-10 w-10 rounded-full flex shrink-0 items-center justify-center text-sm font-bold border",
                                isUserOwner ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                isUserAdmin ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                "bg-zinc-800 text-zinc-400 border-zinc-700"
                             )}>
                                {(userData?.displayName?.[0] || userData?.email?.[0] || '?').toUpperCase()}
                             </div>
                             <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                   <p className="text-zinc-200 font-medium truncate">{userData?.displayName || "Unknown"}</p>
                                   {isUserOwner && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                                   {isUserAdmin && <Shield className="w-3 h-3 text-purple-500 shrink-0" />}
                                </div>
                                <p className="text-xs text-zinc-500 capitalize">{member.role}</p>
                             </div>
                          </Link>

                          {/* ✅ 2. ADMIN ACTIONS (Right Side) */}
                          {/* This Dropdown is OUTSIDE the Link component, so clicking it doesn't redirect */}
                          {canManage && (
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white shrink-0 ml-2">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-200 z-50">
                                  <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-zinc-800" />
                                  
                                  {isOwner && member.role !== 'admin' && (
                                    <DropdownMenuItem onClick={() => handlePromoteMember(userData._id)} className="focus:bg-emerald-500/10 focus:text-emerald-500 cursor-pointer">
                                      <Shield className="w-4 h-4 mr-2" /> Promote to Admin
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {isOwner && (
                                    <DropdownMenuItem onClick={() => handleTransferOwnership(userData._id)} className="focus:bg-amber-500/10 focus:text-amber-500 cursor-pointer">
                                      <ArrowRightLeft className="w-4 h-4 mr-2" /> Transfer Ownership
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuItem onClick={() => handleRemoveMember(userData._id)} className="focus:bg-red-500/10 focus:text-red-500 text-red-400 cursor-pointer">
                                    <UserX className="w-4 h-4 mr-2" /> Remove Member
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                          )}
                       </div>
                    );
                 })}
              </div>
           )}
        </div>
      </div>
    </MainLayout>
  );
}