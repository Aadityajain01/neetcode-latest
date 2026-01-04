'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { communityApi, leaderboardApi, submissionApi, problemApi } from '@/lib/api-modules';
import { Community, CommunityMember, LeaderboardEntry, Submission } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Loader2,
  Users,
  Trophy,
  ChevronLeft,
  Lock,
  Globe,
  Settings,
  UserMinus,
  LogOut,
  Crown,
  Shield,
} from 'lucide-react';

export default function CommunityDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;
  const { user, initialized, isAuthenticated } = useAuthStore();

  const [community, setCommunity] = useState<Community | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberLoading, setMemberLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized || !communityId) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchCommunityData();
  }, [initialized, isAuthenticated, communityId]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);

      const [communityData, membersData, leaderboardData, myRoleData] = await Promise.all([
        communityApi.getCommunityById(communityId),
        communityApi.getMembers(communityId, { limit: 50, offset: 0 }),
        leaderboardApi.getCommunity(communityId, { limit: 50, offset: 0 }),
        communityApi.getMyRole(communityId),
      ]);

      setCommunity(communityData.community);
      setIsMember(communityData.isMember);
      setMyRole(communityData.userRole);
      setMembers(membersData);
      setLeaderboard(leaderboardData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load community');
      router.push('/communities');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async () => {
    if (!community) return;

    setMemberLoading(true);

    try {
      await communityApi.joinCommunity(communityId);
      setIsMember(true);
      toast.success('Joined community successfully!');
      fetchCommunityData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to join community');
    } finally {
      setMemberLoading(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!community) return;

    setMemberLoading(true);

    try {
      await communityApi.leaveCommunity(communityId);
      setIsMember(false);
      setMyRole(null);
      toast.success('Left community successfully!');
      setIsLeaveDialogOpen(false);
      router.push('/communities');
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave community');
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!community) return;

    setMemberLoading(true);

    try {
      await communityApi.removeMember(communityId, userId);
      toast.success('Member removed successfully!');
      setIsRemoveDialogOpen(false);
      setMemberToRemove(null);
      fetchCommunityData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    } finally {
      setMemberLoading(false);
    }
  };

  const isOwner = myRole === 'owner';
  const isAdmin = myRole === 'admin' || myRole === 'owner';

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      </MainLayout>
    );
  }

  if (!community) {
    return (
      <MainLayout>
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="py-12 text-center">
            <p className="text-[#9CA3AF]">Community not found</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Back Button */}
      <Link href="/communities">
        <Button
          variant="ghost"
          className="text-[#9CA3AF] hover:text-[#E5E7EB] mb-6"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Communities
        </Button>
      </Link>

      {/* Community Header */}
      <Card className="bg-[#1E293B] border-[#334155] mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl text-[#E5E7EB]">
                  {community.name}
                </CardTitle>
                {community.type === 'domain_restricted' && (
                  <Lock className="h-5 w-5 text-[#F59E0B]" />
                )}
                {isOwner && (
                  <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20">
                    Owner
                  </Badge>
                )}
                {isAdmin && !isOwner && (
                  <Badge className="bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20">
                    Admin
                  </Badge>
                )}
              </div>
              <CardDescription className="text-[#9CA3AF]">
                {community.description}
              </CardDescription>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#9CA3AF]" />
                  <span className="text-[#E5E7EB]">{community.memberCount} Members</span>
                </div>
                {community.type === 'open' && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#22C55E]" />
                    <span className="text-[#E5E7EB]">Public Community</span>
                  </div>
                )}
                {community.type === 'domain_restricted' && (
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-[#F59E0B]" />
                    <span className="text-[#E5E7EB]">Domain Restricted</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSettingsOpen(true)}
                  className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              {isMember ? (
                <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={memberLoading || isOwner}
                      className="text-[#EF4444] hover:text-[#DC2626] hover:bg-[#7F1D1D]/20"
                    >
                      {memberLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <LogOut className="h-4 w-4" />
                          Leave
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1E293B] border-[#334155] text-[#E5E7EB]">
                    <DialogHeader>
                      <DialogTitle>Leave Community</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to leave {community.name}? You'll need to be re-invited if you want to join again.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsLeaveDialogOpen(false)}
                        className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleLeaveCommunity}
                        disabled={memberLoading}
                        className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white"
                      >
                        {memberLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Leaving...
                          </>
                        ) : (
                          'Yes, Leave'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button
                  onClick={handleJoinCommunity}
                  disabled={memberLoading}
                  className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
                >
                  {memberLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Community'
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader>
            <CardTitle className="text-[#E5E7EB] flex items-center gap-2">
              <Users className="h-5 w-5" />
              Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {members.length === 0 ? (
                <p className="text-center text-[#9CA3AF] py-8">
                  No members yet. Be the first to join!
                </p>
              ) : (
                members.map((member) => {
                  const canRemove = isAdmin && member.role !== 'owner' && member.userId !== user?.id;

                  return (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-[#22C55E]/10 p-2 rounded-full">
                          <UserMinus className="h-4 w-4 text-[#22C55E]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#E5E7EB]">
                            Member #{members.indexOf(member) + 1}
                          </p>
                          <p className="text-xs text-[#9CA3AF]">
                            Joined: {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${
                            member.role === 'owner'
                              ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
                              : member.role === 'admin'
                              ? 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20'
                              : 'bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20'
                          }`}
                        >
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                      </div>
                      {canRemove && (
                        <Dialog open={isRemoveDialogOpen && memberToRemove === member.userId} onOpenChange={(open) => {
                          setIsRemoveDialogOpen(open);
                          if (!open) setMemberToRemove(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setMemberToRemove(member.userId)}
                              className="text-[#EF4444] hover:text-[#DC2626] hover:bg-[#7F1D1D]/20"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#1E293B] border-[#334155] text-[#E5E7EB]">
                            <DialogHeader>
                              <DialogTitle>Remove Member</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to remove this member from {community.name}?
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-3 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => setMemberToRemove(null)}
                                className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleRemoveMember(member.userId)}
                                disabled={memberLoading}
                                className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white"
                              >
                                {memberLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Removing...
                                  </>
                                ) : (
                                  'Yes, Remove'
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  )}))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader>
            <CardTitle className="text-[#E5E7EB] flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Community Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/leaderboard/community/${communityId}`}>
              <Button variant="outline" className="w-full bg-[#0F172A] border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]">
                View Full Leaderboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
