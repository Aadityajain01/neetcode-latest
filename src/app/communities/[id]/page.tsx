"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { communityApi } from "@/lib/api-modules";
import { Community, CommunityMember } from "@/lib/api-modules";
import MainLayout from "@/components/layouts/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  Users,
  ChevronLeft,
  Lock,
  Globe,
  Settings,
  UserMinus,
  LogOut,
} from "lucide-react";

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
  const [memberLoading, setMemberLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
      // Essential data call
      const communityData = await communityApi.getCommunityById(communityId);
      
      // Secondary data calls (Safe-wrapped to prevent rerouting on partial failure)
      const membersData = await communityApi.getMembers(communityId).catch(() => []);
      const myRoleData = await communityApi.getMyRole(communityId).catch(() => null);

      setCommunity(communityData.community);
      setIsMember(communityData.isMember);
      setMyRole(communityData.userRole || myRoleData);
      setMembers(membersData);
    } catch (error: any) {
      toast.error("Failed to load community details");
      router.push("/communities");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    if (!community) return;
    setMemberLoading(true);
    try {
      await communityApi.joinCommunity(communityId);
      
      // Optimistic Update
      setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount + 1 } : null);
      setIsMember(true);
      
      toast.success("Joined community successfully!");
      fetchCommunityData(); 
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Domain mismatch or join error");
    } finally {
      setMemberLoading(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!community) return;
    setMemberLoading(true);
    try {
      await communityApi.leaveCommunity(communityId);
      
      // Optimistic Update with Floor at 0
      setCommunity(prev => prev ? { ...prev, memberCount: Math.max(0, prev.memberCount - 1) } : null);
      setIsMember(false);
      setMyRole(null);
      
      toast.success("Left community successfully!");
      setIsLeaveDialogOpen(false);
      router.push("/communities");
    } catch (error: any) {
      toast.error("Failed to leave community");
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (targetId: string) => {
    if (!community) return;
    setMemberLoading(true);
    try {
      await communityApi.removeMember(communityId, targetId);
      toast.success("Member removed successfully!");
      setIsRemoveDialogOpen(false);
      setMemberToRemove(null);
      fetchCommunityData();
    } catch (error: any) {
      toast.error("Failed to remove member");
    } finally {
      setMemberLoading(false);
    }
  };

  const isAdmin = myRole === "owner" || myRole === "admin";
  const isOwner = myRole === "owner";

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[#22C55E]" />
      </div>
    </MainLayout>
  );

  if (!community) return null;

  return (
    <MainLayout>
      <Link href="/communities">
        <Button variant="ghost" className="text-[#9CA3AF] hover:text-[#E5E7EB] mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Communities
        </Button>
      </Link>

      <Card className="bg-[#1E293B] border-[#334155] mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl text-[#E5E7EB]">{community.name}</CardTitle>
                {community.type === "domain_restricted" && <Lock className="h-5 w-5 text-[#F59E0B]" />}
                {isOwner && <Badge className="bg-[#F59E0B]/10 text-[#F59E0B]">Owner</Badge>}
              </div>
              <CardDescription className="text-[#9CA3AF] text-lg">{community.description}</CardDescription>
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#9CA3AF]" />
                  <span className="text-[#E5E7EB] font-medium">{community.memberCount} Members</span>
                </div>
                <div className="flex items-center gap-2">
                  {community.type === "open" ? (
                    <><Globe className="h-5 w-5 text-[#22C55E]" /><span className="text-[#E5E7EB]">Public</span></>
                  ) : (
                    <><Lock className="h-5 w-5 text-[#F59E0B]" /><span className="text-[#E5E7EB]">Requires @{community.domain}</span></>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} className="bg-[#0F172A] border-[#334155]">
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </Button>
              )}
              {isMember ? (
                <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={memberLoading || isOwner} className="text-red-400 hover:text-red-500 hover:bg-red-500/10">
                      <LogOut className="h-4 w-4 mr-2" /> Leave
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1E293B] border-[#334155] text-white">
                    <DialogHeader>
                      <DialogTitle>Leave Community?</DialogTitle>
                      <DialogDescription>You will lose access to local rankings for {community.name}.</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                      <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleLeaveCommunity} className="bg-red-500 hover:bg-red-600">Leave</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button onClick={handleJoinCommunity} disabled={memberLoading} className="bg-[#22C55E] hover:bg-[#22C55E]/90">
                  {memberLoading ? "Joining..." : "Join Community"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader><CardTitle className="text-xl text-white">Members</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.length === 0 ? (
              <p className="col-span-full text-center text-[#9CA3AF] py-10">No members found.</p>
            ) : (
              members.map((member) => {
                const userData = member.userId as any;
                const canRemove = isAdmin && member.role !== "owner" && member.userId !== user?.id;

                return (
                  <div key={member._id} className="flex items-center justify-between p-4 bg-[#0F172A] rounded-xl border border-[#334155]">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E] font-bold">
                        {(userData?.displayName || userData?.email || "??").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{userData?.displayName || userData?.email}</p>
                        <p className="text-xs text-[#9CA3AF] capitalize">{member.role}</p>
                      </div>
                    </div>
                    {canRemove && (
                      <Button variant="ghost" size="sm" onClick={() => { setMemberToRemove(member.userId); setIsRemoveDialogOpen(true); }} className="text-red-400 hover:bg-red-400/10">
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remove Member Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-white">
          <DialogHeader><DialogTitle>Remove Member</DialogTitle></DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => memberToRemove && handleRemoveMember(memberToRemove)} className="bg-red-500">Confirm Removal</Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}