'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { userApi, submissionApi } from '@/lib/api-modules';
import { User, UserStats, Submission, Community } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2,
  User as UserIcon,
  Mail,
  Settings,
  Code2,
  Trophy,
  Clock,
  Target,
  Users,
  Edit,
  Save,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { initialized, isAuthenticated, user } = useAuthStore();

  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editName, setEditName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchProfileData();
  }, [initialized, isAuthenticated]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileData, statsData, communitiesData, submissionsData] = await Promise.all([
        userApi.getMe(),
        userApi.getStats(),
        userApi.getCommunities(),
        submissionApi.getMySubmissions({ limit: 10, offset: 0 }),
      ]);

      setProfile(profileData);
      setStats(statsData);
      setCommunities(communitiesData);
      setRecentSubmissions(submissionsData.submissions);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    if (!editName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setEditLoading(true);

    try {
      const updatedProfile = await userApi.updateMe({ displayName: editName });
      setProfile(updatedProfile);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const openEditDialog = () => {
    setEditName(profile?.displayName || '');
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-[#22C55E]/10 text-[#22C55E]';
      case 'wrong_answer':
        return 'bg-[#EF4444]/10 text-[#EF4444]';
      case 'runtime_error':
      case 'compile_error':
        return 'bg-[#F59E0B]/10 text-[#F59E0B]';
      case 'time_limit_exceeded':
        return 'bg-[#A855F7]/10 text-[#A855F7]';
      default:
        return 'bg-[#9CA3AF]/10 text-[#9CA3AF]';
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#E5E7EB] mb-2">
          Profile
        </h1>
        <p className="text-[#9CA3AF]">
          Manage your account settings and view your statistics
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Info Card */}
            <Card className="bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#E5E7EB]">User Information</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openEditDialog}
                    className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#22C55E]/10 p-3 rounded-full">
                      <UserIcon className="h-6 w-6 text-[#22C55E]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#9CA3AF]">Display Name</p>
                      <p className="text-lg font-semibold text-[#E5E7EB]">
                        {profile?.displayName || 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#38BDF8]/10 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-[#38BDF8]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#9CA3AF]">Email</p>
                      <p className="text-lg font-semibold text-[#E5E7EB]">
                        {profile?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#A855F7]/10 p-3 rounded-full">
                      <Settings className="h-6 w-6 text-[#A855F7]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#9CA3AF]">Role</p>
                      <Badge
                        variant="outline"
                        className={`ml-2 ${
                          profile?.role === 'admin'
                            ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
                            : 'bg-[#9CA3AF]/10 text-[#9CA3AF] border-[#9CA3AF]/20'
                        }`}
                      >
                        {profile?.role?.toUpperCase() || 'USER'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-[#1E293B] border-[#334155]">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center">
                      <Target className="h-8 w-8 text-[#22C55E] mb-2" />
                      <p className="text-3xl font-bold text-[#E5E7EB]">
                        {stats.problemsSolved}
                      </p>
                      <p className="text-sm text-[#9CA3AF] mt-1">
                        Problems Solved
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1E293B] border-[#334155]">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center">
                      <Code2 className="h-8 w-8 text-[#38BDF8] mb-2" />
                      <p className="text-3xl font-bold text-[#E5E7EB]">
                        {stats.totalSubmissions}
                      </p>
                      <p className="text-sm text-[#9CA3AF] mt-1">
                        Total Submissions
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1E293B] border-[#334155]">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center">
                      <Trophy className="h-8 w-8 text-[#F59E0B] mb-2" />
                      <p className="text-3xl font-bold text-[#E5E7EB]">
                        {stats.score}
                      </p>
                      <p className="text-sm text-[#9CA3AF] mt-1">
                        Total Score
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-[#1E293B] border-[#334155]">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="h-8 w-8 text-[#A855F7] mb-2" />
                      <p className="text-3xl font-bold text-[#E5E7EB]">
                        #{stats.rank}
                      </p>
                      <p className="text-sm text-[#9CA3AF] mt-1">
                        Global Rank
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Detailed Stats */}
            {stats && (
              <Card className="bg-[#1E293B] border-[#334155]">
                <CardHeader>
                  <CardTitle className="text-[#E5E7EB]">Statistics Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg">
                      <span className="text-[#9CA3AF]">DSA Submissions</span>
                      <span className="font-semibold text-[#E5E7EB]">{stats.dsaSubmissions}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg">
                      <span className="text-[#9CA3AF]">Practice Submissions</span>
                      <span className="font-semibold text-[#E5E7EB]">{stats.practiceSubmissions}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg">
                      <span className="text-[#9CA3AF]">MCQ Attempts</span>
                      <span className="font-semibold text-[#E5E7EB]">{stats.mcqAttempts}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Submissions */}
            <Card className="bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#E5E7EB]">Recent Submissions</CardTitle>
                  <Link href="/submissions">
                    <Button variant="outline" size="sm" className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentSubmissions.length === 0 ? (
                  <p className="text-center text-[#9CA3AF] py-8">
                    No submissions yet. Start solving problems!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentSubmissions.map((submission) => (
                      <Link
                        key={submission._id}
                        href={`/submissions/${submission._id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-3 bg-[#0F172A] rounded-lg hover:bg-[#1E293B] transition-colors">
                          <div className="flex-1">
                            <p className="text-sm text-[#9CA3AF]">
                              {submission.problemId ? 'Problem' : 'MCQ'} • {new Date(submission.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-[#6B7280]">
                              ID: {submission._id.substring(0, 8)}...
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={getStatusColor(submission.status)}
                          >
                            {submission.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Communities */}
          <div className="lg:col-span-1">
            <Card className="bg-[#1E293B] border-[#334155]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#E5E7EB]">My Communities</CardTitle>
                  <Link href="/communities">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]"
                    >
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {communities.length === 0 ? (
                  <p className="text-center text-[#9CA3AF] py-8">
                    <Users className="h-12 w-12 text-[#9CA3AF] mx-auto mb-4" />
                    No communities joined yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {communities.map((community) => (
                      <Link
                        key={community._id}
                        href={`/communities/${community._id}`}
                        className="block"
                      >
                        <div className="p-3 bg-[#0F172A] rounded-lg hover:bg-[#1E293B] transition-colors">
                          <p className="font-semibold text-[#E5E7EB] mb-1">
                            {community.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                            <Users className="h-4 w-4" />
                            <span>{community.memberCount} members</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1E293B] border-[#334155] text-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your display name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName" className="text-[#E5E7EB]">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] placeholder:text-[#6B7280]"
                placeholder="Enter your display name"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-[#0F172A] border-[#334155] text-[#E5E7EB] hover:bg-[#1E293B]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditProfile}
                disabled={editLoading}
                className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"
              >
                {editLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
