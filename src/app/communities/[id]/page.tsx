"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { communityApi, Community, CommunityMember } from "@/lib/api-modules";
import MainLayout from "@/components/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import {
  Loader2,
  Users,
  Lock,
  Globe,
  Settings,
  LogOut,
  ShieldAlert,
  UserX,
  Crown
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
  
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

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
      setIsMember(communityData.isMember);
      setMyRole(communityData.userRole);

      // Only fetch members if we have access or it's public
      try {
        const membersData = await communityApi.getMembers(communityId);
        setMembers(membersData);
      } catch (e) {
        // If not member, might fail depending on API rules, handle gracefully
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
      // Refresh to get updated member list and state
      fetchCommunityData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to join. Check domain requirements.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!community) return;
    setActionLoading(true);
    try {
      await communityApi.leaveCommunity(communityId);
      toast.success("You have left the community.");
      setIsLeaveDialogOpen(false);
      router.push("/communities");
    } catch (error: any) {
      toast.error("Failed to leave community");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setActionLoading(true);
    try {
      await communityApi.removeMember(communityId, memberToRemove);
      toast.success("Member removed.");
      setIsRemoveDialogOpen(false);
      fetchCommunityData(); // Refresh list
    } catch (error: any) {
      toast.error("Failed to remove member");
    } finally {
      setActionLoading(false);
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

        {/* --- HERO SECTION --- */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 md:p-12 mb-10">
           {/* Background Decoration */}
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

              {/* Actions Card */}
              <div className="w-full md:w-auto flex flex-col gap-3 min-w-[200px] bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
                 {isMember ? (
                    <>
                       {isAdmin && (
                          <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                             <Settings className="w-4 h-4 mr-2" /> Settings
                          </Button>
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

        {/* --- MEMBERS SECTION --- */}
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
                    const canRemove = isAdmin && member.role !== 'owner' && userData._id !== user?.id;
                    const isUserOwner = member.role === 'owner';
                    const isUserAdmin = member.role === 'admin';

                    return (
                       <div key={member._id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors group">
                          <div className="flex items-center gap-4">
                             <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border",
                                isUserOwner ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                isUserAdmin ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                "bg-zinc-800 text-zinc-400 border-zinc-700"
                             )}>
                                {(userData?.displayName?.[0] || userData?.email?.[0] || '?').toUpperCase()}
                             </div>
                             <div>
                                <div className="flex items-center gap-2">
                                   <p className="text-zinc-200 font-medium truncate max-w-[150px]">{userData?.displayName || "Unknown"}</p>
                                   {isUserOwner && <Crown className="w-3 h-3 text-amber-500" />}
                                </div>
                                <p className="text-xs text-zinc-500 capitalize">{member.role}</p>
                             </div>
                          </div>

                          {canRemove && (
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => { setMemberToRemove(userData._id || member.userId); setIsRemoveDialogOpen(true); }}
                                className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                             >
                                <UserX className="w-4 h-4" />
                             </Button>
                          )}
                       </div>
                    );
                 })}
              </div>
           )}
        </div>

        {/* Remove Member Dialog */}
        <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
           <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
              <DialogHeader>
                 <DialogTitle>Remove Member</DialogTitle>
                 <DialogDescription>Are you sure you want to remove this user from the community?</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                 <Button variant="ghost" onClick={() => setIsRemoveDialogOpen(false)}>Cancel</Button>
                 <Button onClick={handleRemoveMember} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
                    {actionLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Remove"}
                 </Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>

      </div>
    </MainLayout>
  );
}