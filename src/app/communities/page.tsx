'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { communityApi, Community } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Search, Filter, Loader2, ChevronRight, Users, Lock, Globe } from 'lucide-react';

export default function CommunitiesPage() {
  const router = useRouter();
  const { initialized, isAuthenticated } = useAuthStore();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    type: 'open' as 'open' | 'domain_restricted',
    domain: '',
  });

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchCommunities();
  }, [initialized, isAuthenticated, router]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      // 🛡️ Safety: Ensure we get an array even if API fails
      const data = await communityApi.getCommunities({ search: search || undefined });
      const safeData = data || []; // Fallback

      if (typeFilter) {
        const filtered = safeData.filter((c: Community) => c.type === typeFilter);
        setCommunities(filtered);
      } else {
        setCommunities(safeData);
      }
    } catch (error: any) {
      toast.error('Failed to load communities');
      setCommunities([]); // Prevent crash
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommunity.name || !newCommunity.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (newCommunity.type === 'domain_restricted' && !newCommunity.domain) {
      toast.error('Please enter a domain for domain-restricted communities');
      return;
    }

    setCreateLoading(true);
    try {
      await communityApi.createCommunity({
        name: newCommunity.name,
        description: newCommunity.description,
        type: newCommunity.type,
        domain: newCommunity.type === 'domain_restricted' ? newCommunity.domain : undefined,
      });

      toast.success('Community created successfully!');
      setIsCreateDialogOpen(false);
      setNewCommunity({ name: '', description: '', type: 'open', domain: '' });
      fetchCommunities();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create community');
    } finally {
      setCreateLoading(false);
    }
  };

  if (!initialized) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0F172A]"><Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" /></div>;
  }

  return (
    <MainLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#E5E7EB] mb-2">Communities</h1>
          <p className="text-[#9CA3AF]">Join or create communities to compete locally</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white"><Plus className="mr-2 h-4 w-4" /> Create Community</Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1E293B] border-[#334155] text-[#E5E7EB]">
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
              <DialogDescription>Create a community to compete with others.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Name</label>
                <Input placeholder="e.g., TMU Coders" value={newCommunity.name} onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })} className="bg-[#0F172A] border-[#334155] text-[#E5E7EB]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Description</label>
                <textarea placeholder="Describe your community..." value={newCommunity.description} onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })} rows={3} className="w-full bg-[#0F172A] border-[#334155] text-[#E5E7EB] rounded-md p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Type</label>
                <Select value={newCommunity.type} onValueChange={(value: 'open' | 'domain_restricted') => setNewCommunity({ ...newCommunity, type: value })}>
                  <SelectTrigger className="bg-[#0F172A] border-[#334155] text-[#E5E7EB]"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-[#334155]">
                    <SelectItem value="open">Open (Public)</SelectItem>
                    <SelectItem value="domain_restricted">Domain Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newCommunity.type === 'domain_restricted' && (
                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-2">Allowed Domain (e.g., tmu.ac.in)</label>
                  <Input placeholder="tmu.ac.in" value={newCommunity.domain} onChange={(e) => setNewCommunity({ ...newCommunity, domain: e.target.value })} className="bg-[#0F172A] border-[#334155] text-[#E5E7EB]" />
                </div>
              )}
              <Button onClick={handleCreateCommunity} disabled={createLoading} className="w-full bg-[#22C55E] text-white">{createLoading ? <Loader2 className="animate-spin" /> : 'Create'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" /></div>
      ) : communities.length === 0 ? (
        <Card className="bg-[#1E293B] border-[#334155]"><CardContent className="py-12 text-center text-[#9CA3AF]">No communities found.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((community) => (
            <Card key={community._id} className="bg-[#1E293B] border-[#334155] hover:border-[#22C55E] transition-colors">
              <CardHeader>
                <div className="flex justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-[#E5E7EB] text-lg mb-1">{community.name}</CardTitle>
                    <CardDescription className="text-[#9CA3AF] line-clamp-2">{community.description}</CardDescription>
                  </div>
                  {community.type === 'domain_restricted' && <Lock className="h-5 w-5 text-[#F59E0B] ml-2" />}
                </div>
                <div className="flex gap-2">
                   <Badge variant="outline" className="bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20">{community.memberCount} Members</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={`/communities/${community._id}`}>
                  <Button variant="outline" className="w-full bg-[#0F172A] border-[#334155] text-[#E5E7EB]">View Details <ChevronRight className="ml-2 h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
}