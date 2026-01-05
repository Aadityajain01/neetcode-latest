'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { communityApi, Community } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Search, 
  Loader2, 
  ChevronRight, 
  Lock, 
  Globe, 
  ChevronLeft,
  Plus,
  Info,
  Users
} from 'lucide-react';

const ITEMS_PER_PAGE = 5;

export default function CommunitiesPage() {
  const router = useRouter();
  const { initialized, isAuthenticated } = useAuthStore();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Create Community State
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
  }, [initialized, isAuthenticated]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const data = await communityApi.getCommunities();
      setCommunities(data || []);
    } catch (error) {
      toast.error('Failed to load communities');
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommunity.name || !newCommunity.description) {
      toast.error('Please fill in name and description');
      return;
    }
    if (newCommunity.type === 'domain_restricted' && !newCommunity.domain) {
      toast.error('Please specify a domain (e.g. tmu.ac.in)');
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
      fetchCommunities(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create community');
    } finally {
      setCreateLoading(false);
    }
  };

  // --- Filtering & Pagination ---
  const filteredData = useMemo(() => {
    return communities.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [communities, search]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return (
    <MainLayout>
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#22C55E]" />
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Communities</h1>
          <p className="text-[#9CA3AF] text-sm">Find your peers and start competing.</p>
        </div>

        <div className="flex gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
            <Input 
              placeholder="Search..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-9 bg-[#0F172A] border-[#334155] h-10"
            />
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#22C55E] hover:bg-[#1da850] h-10 font-bold">
                <Plus className="mr-1 h-4 w-4" /> Create
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1E293B] border-[#334155] text-white">
              <DialogHeader>
                <DialogTitle>Start a New Community</DialogTitle>
                <DialogDescription>Create a space for your college or coding group.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Community Name</label>
                  <Input 
                    placeholder="e.g. TMU Coders" 
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                    className="bg-[#0F172A] border-[#334155]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Briefly describe the group..."
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                    className="w-full bg-[#0F172A] border-[#334155] rounded-md p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select value={newCommunity.type} onValueChange={(val: any) => setNewCommunity({...newCommunity, type: val})}>
                      <SelectTrigger className="bg-[#0F172A] border-[#334155]"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1E293B] border-[#334155] text-white">
                        <SelectItem value="open">Public (Open)</SelectItem>
                        <SelectItem value="domain_restricted">Restricted (Lock)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newCommunity.type === 'domain_restricted' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Allowed Domain</label>
                      <Input 
                        placeholder="tmu.ac.in" 
                        value={newCommunity.domain}
                        onChange={(e) => setNewCommunity({ ...newCommunity, domain: e.target.value })}
                        className="bg-[#0F172A] border-[#334155]"
                      />
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleCreateCommunity} 
                  disabled={createLoading} 
                  className="w-full bg-[#22C55E] hover:bg-[#1da850]"
                >
                  {createLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Establish Community'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Slim-List Layout */}
      <div className="m-4">
        {paginatedData.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-[#334155] rounded-xl text-[#9CA3AF]">
            No communities found matching your search.
          </div>
        ) : (
          paginatedData.map((c) => (
            <Link key={c._id} href={`/communities/${c._id}`}>
              <Card className="group bg-[#1E293B] border-[#334155] hover:border-[#22C55E]/40 transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border border-[#334155] bg-[#0F172A]">
                      {c.type === 'domain_restricted' ? (
                        <Lock className="h-5 w-5 text-[#F59E0B]" />
                      ) : (
                        <Globe className="h-5 w-5 text-[#22C55E]" />
                      )}
                    </div>
                    <div className="min-w-0 ">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-white font-semibold truncate group-hover:text-[#22C55E] transition-colors text-sm">
                          {c.name}
                        </h3>
                        {c.type === 'domain_restricted' && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-[#F59E0B]/30 text-[#F59E0B]">
                            @{c.domain}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[#9CA3AF] text-xs truncate max-w-sm">
                        {c.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                        <Users className="h-3.5 w-3.5 text-[#9CA3AF]" />
                        {c.memberCount}
                      </div>
                      <span className="text-[10px] text-[#4B5563] uppercase font-medium">Joined</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#334155] group-hover:text-white transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Pagination Controls - Strictly after 5 items */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="text-[#9CA3AF] hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`h-8 w-8 rounded text-xs font-bold transition-all ${
                  currentPage === i + 1 
                  ? 'bg-[#22C55E] text-white shadow-lg' 
                  : 'text-[#9CA3AF] hover:bg-[#334155]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="text-[#9CA3AF] hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </MainLayout>
  );
}