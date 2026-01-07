'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { communityApi, Community } from '@/lib/api-modules';
import MainLayout from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Search, 
  Loader2, 
  Users, 
  Globe, 
  Lock, 
  Plus, 
  Building2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CommunitiesPage() {
  const router = useRouter();
  const { initialized, isAuthenticated } = useAuthStore();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Create State
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
      toast.error('Please specify a domain (e.g. university.edu)');
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

  const filteredData = useMemo(() => {
    return communities.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [communities, search]);

  if (!initialized) return null;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900/50 border border-zinc-800 p-8 md:p-10">
           <div className="absolute top-0 right-0 p-8 opacity-5"><Building2 className="w-64 h-64 text-emerald-500" /></div>
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Communities</h1>
                <p className="text-zinc-400 max-w-xl">
                  Join forces with developers from your university or organization. 
                  Compete on local leaderboards and grow together.
                </p>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
                    <Plus className="mr-2 h-5 w-5" /> Create Community
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Create a New Community</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Establish a new space for your group.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-5 py-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Name</Label>
                      <Input 
                        placeholder="e.g. MIT Coders" 
                        value={newCommunity.name}
                        onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Description</Label>
                      <Textarea 
                        placeholder="What is this community about?"
                        value={newCommunity.description}
                        onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                        className="bg-zinc-900 border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20 resize-none h-24"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Access Type</Label>
                        <Select value={newCommunity.type} onValueChange={(val: any) => setNewCommunity({...newCommunity, type: val})}>
                          <SelectTrigger className="bg-zinc-900 border-zinc-800">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                            <SelectItem value="open">Public (Open)</SelectItem>
                            <SelectItem value="domain_restricted">Domain Locked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {newCommunity.type === 'domain_restricted' && (
                        <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                          <Label className="text-zinc-300">Required Domain</Label>
                          <Input 
                            placeholder="university.edu" 
                            value={newCommunity.domain}
                            onChange={(e) => setNewCommunity({ ...newCommunity, domain: e.target.value })}
                            className="bg-zinc-900 border-zinc-800 focus:border-emerald-500/50"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="hover:bg-zinc-800 text-zinc-400">Cancel</Button>
                    <Button onClick={handleCreateCommunity} disabled={createLoading} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      {createLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Create Community'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
           </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <Input 
            placeholder="Search communities by name or description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 bg-zinc-900/50 border-zinc-800 text-lg rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20"
          />
        </div>

        {/* Community Grid */}
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
        ) : filteredData.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-2xl">
            <Users className="h-12 w-12 mx-auto text-zinc-600 mb-3" />
            <p className="text-zinc-500">No communities found matching "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((c) => (
              <Link key={c._id} href={`/communities/${c._id}`} className="group">
                <div className="h-full bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 flex flex-col">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border", 
                      c.type === 'domain_restricted' 
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    )}>
                      {c.type === 'domain_restricted' ? <Lock className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
                    </div>
                    
                    {c.type === 'domain_restricted' && (
                      <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/20 text-[10px] uppercase tracking-wider">
                        {c.domain} Only
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{c.name}</h3>
                  <p className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-1">{c.description}</p>

                  <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Users className="h-4 w-4" />
                      <span className="text-zinc-200 font-medium">{c.memberCount}</span> Members
                    </div>
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                      View Details <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}