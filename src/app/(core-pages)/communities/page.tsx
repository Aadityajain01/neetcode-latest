"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { communityApi, Community, userApi } from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Search, Loader2, Users, Plus, ArrowRight, UserPlus, Sparkles, Shield, Hash, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import MainLayout from "@/components/layouts/main-layout";

function normalizeDomainInput(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
  const withoutPath = withoutProtocol.split("/")[0];
  const withoutAt = withoutPath.startsWith("@") ? withoutPath.slice(1) : withoutPath;
  return withoutAt.includes("@") ? withoutAt.split("@").pop() || "" : withoutAt;
}

export default function CommunitiesPage() {
  const router = useRouter();
  const { initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();

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

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search.trim()); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!initialized || authLoading) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    fetchCommunities();
  }, [initialized, isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!debouncedSearch) { setCommunities(allCommunities); setCurrentPage(1); return; }
    const filtered = allCommunities.filter((c) => c.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
    setCommunities(filtered);
    setCurrentPage(1);
  }, [debouncedSearch, allCommunities]);

  const totalPages = Math.ceil(communities.length / itemsPerPage);
  const paginatedCommunities = communities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const [list, mine] = await Promise.all([communityApi.getCommunities(), userApi.getCommunities()]);
      setJoinedCommunityIds(new Set((mine || []).map((community: any) => community._id || community.id).filter(Boolean)));
      setAllCommunities(list);
      setCommunities(list);
    } catch (err) { console.error(err); toast.error("Failed to load communities"); }
    finally { setLoading(false); }
  };

  const handleCreateCommunity = async () => {
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
      router.push(`/communities/${created._id}/chat`);
    } catch (err: any) { toast.error(err?.response?.data?.error || "Create failed"); }
    finally { setCreateLoading(false); }
  };

  const handleJoinCommunity = async (communityId: string) => {
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
    } catch (err: any) { toast.error(err?.response?.data?.error || "Failed to join community", { id: `community-join-error-${communityId}` }); }
    finally { joinRequestLockRef.current.delete(communityId); setJoiningCommunityId(null); }
  };

  if (!initialized) return null;

  return (
    <MainLayout>
      <div className="h-full flex flex-col font-sans px-4 sm:px-6 md:px-8 py-4 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 animate-in fade-in duration-500">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 shrink-0 mb-3 z-10 relative">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-widest mb-1 border border-emerald-500/20 shadow-sm">
              <Sparkles className="h-2.5 w-2.5" /><span>Discover Communities</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">Communities</h1>
            <p className="text-zinc-400 text-xs max-w-sm leading-tight mt-0.5">Join groups of like-minded developers, share knowledge, and collaborate.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search communities..." className="pl-9 h-9 bg-zinc-900/40 backdrop-blur-md border-zinc-800/80 text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-emerald-500 transition-all text-zinc-200" />
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0 h-9 px-4 rounded-lg font-bold text-xs w-full sm:w-auto transition-all shadow-sm border-0">
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Create
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border border-zinc-800 rounded-2xl sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-xl text-white">Create Community</DialogTitle>
                  <DialogDescription className="text-zinc-400">Build a space for developers to connect.</DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-2">
                  <div className="space-y-1.5">
                    <Label className="text-zinc-300">Name</Label>
                    <Input value={newCommunity.name} onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })} className="bg-zinc-900/50 border-zinc-800 rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500 text-white" placeholder="e.g. Next.js Masters" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-zinc-300">Description</Label>
                    <Textarea value={newCommunity.description} onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })} className="bg-zinc-900/50 border-zinc-800 h-24 rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500 resize-none text-white" placeholder="What is this community about?" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-zinc-300">Access Type</Label>
                    <Select value={newCommunity.type} onValueChange={(v: any) => setNewCommunity({ ...newCommunity, type: v })}>
                      <SelectTrigger className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl text-white">
                        <SelectItem value="open" className="rounded-lg focus:bg-zinc-800 focus:text-white">Open</SelectItem>
                        <SelectItem value="domain_restricted" className="rounded-lg focus:bg-zinc-800 focus:text-white">Domain Restricted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newCommunity.type === "domain_restricted" && (
                    <div className="space-y-1.5">
                      <Label className="text-zinc-300">Domain</Label>
                      <Input value={newCommunity.domain} onChange={(e) => setNewCommunity({ ...newCommunity, domain: e.target.value })} className="bg-zinc-900/50 border-zinc-800 rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500 text-white" placeholder="company.com or user@company.com" />
                      <p className="mt-1 text-xs text-zinc-500">Domain will be normalized automatically.</p>
                    </div>
                  )}
                </div>
                <DialogFooter className="pt-2">
                  <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl hover:bg-zinc-900 text-zinc-300">Cancel</Button>
                  <Button onClick={handleCreateCommunity} disabled={createLoading} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 min-w-[100px] border-0">
                    {createLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Table — fills remaining viewport */}
        <div className="flex-1 min-h-0 flex flex-col bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-[1.5rem] shadow-xl overflow-hidden relative z-10 w-full">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-4 md:px-6 py-3 text-[10px] md:text-xs font-black text-zinc-500 uppercase tracking-widest bg-zinc-950/80 border-b border-zinc-800/60 shrink-0 z-20">
            <div className="col-span-6 flex items-center">Community Name</div>
            <div className="col-span-2 flex items-center justify-center">Access</div>
            <div className="col-span-2 flex items-center justify-center">Members</div>
            <div className="col-span-2 flex items-center justify-end pr-1">Actions</div>
          </div>

          {/* List Body — scrollable if needed */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <div className="divide-y divide-zinc-800/40">
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-4 md:px-6 py-3.5 items-center">
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-zinc-800/50 shrink-0 skeleton-shimmer" />
                      <div className="space-y-2 flex-1 w-full max-w-[250px]">
                        <div className="h-4 w-3/4 bg-zinc-800/50 rounded skeleton-shimmer" />
                        <div className="h-3 w-full bg-zinc-800/30 rounded skeleton-shimmer" />
                      </div>
                    </div>
                    <div className="hidden sm:flex col-span-2 justify-center"><div className="h-5 w-16 bg-zinc-800/40 rounded skeleton-shimmer" /></div>
                    <div className="hidden sm:flex col-span-2 justify-center"><div className="h-4 w-10 bg-zinc-800/40 rounded skeleton-shimmer" /></div>
                    <div className="col-span-12 sm:col-span-2 flex justify-end"><div className="h-9 w-20 rounded-lg bg-zinc-800/50 skeleton-shimmer" /></div>
                  </div>
                ))
              ) : paginatedCommunities.length > 0 ? (
                paginatedCommunities.map((c) => {
                  const isJoined = joinedCommunityIds.has(c._id);
                  const isJoining = joiningCommunityId === c._id;
                  return (
                    <div key={c._id} className="group relative grid grid-cols-1 sm:grid-cols-12 gap-4 px-4 md:px-6 py-3 hover:bg-zinc-800/40 transition-all duration-300 items-center overflow-hidden">
                      <div className={cn("absolute inset-y-0 left-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none", c.type === "domain_restricted" ? "bg-amber-500" : "bg-emerald-500")} />
                      <div className="col-span-6 flex items-center gap-4 min-w-0">
                        <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform", c.type === "domain_restricted" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20")}>
                          {c.type === "domain_restricted" ? <Shield className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                          <h3 className="text-base font-bold text-zinc-100 truncate leading-tight group-hover:text-white transition-colors">{c.name}</h3>
                          <p className="text-xs text-zinc-400 truncate leading-tight mt-0.5 group-hover:text-zinc-300 transition-colors">{c.description}</p>
                        </div>
                      </div>
                      <div className="hidden sm:flex col-span-2 items-center justify-center mt-3 sm:mt-0">
                        {c.type === "domain_restricted" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 tracking-widest uppercase shadow-[0_0_10px_rgba(245,158,11,0.1)]">Private</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 tracking-widest uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]">Open</span>
                        )}
                      </div>
                      <div className="hidden sm:flex col-span-2 items-center justify-center gap-2 text-sm text-zinc-400 mt-3 sm:mt-0">
                        <Users className="h-4 w-4 text-zinc-500" />
                        <span className="font-semibold text-zinc-300 text-sm">{c.memberCount}</span>
                      </div>
                      <div className="col-span-12 sm:col-span-2 flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-zinc-800/30 sm:border-0 relative z-10">
                        <div className="sm:hidden flex items-center gap-1.5 text-sm text-zinc-400 shrink-0">
                          <Users className="h-4 w-4 text-zinc-500" />
                          <span className="font-semibold text-zinc-300 text-sm">{c.memberCount}</span>
                        </div>
                        {isJoined ? (
                          <Button className="h-9 px-4 rounded-lg shadow-none bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 transition-all active:scale-95 shrink-0" onClick={() => router.push(`/communities/${c._id}/chat`)}>
                            Open <ArrowRight className="ml-1.5 h-3.5 w-3.5 opacity-70" />
                          </Button>
                        ) : (
                          <Button disabled={isJoining} className="h-9 px-4 rounded-lg shadow-sm bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 text-xs font-bold border border-emerald-500/20 transition-all active:scale-95 group/btn shrink-0" onClick={() => handleJoinCommunity(c._id)}>
                            {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Join <UserPlus className="ml-1.5 h-4 w-4 opacity-70 group-hover/btn:opacity-100" /></>}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-24 text-center flex flex-col items-center justify-center h-full w-full">
                  <div className="h-16 w-16 rounded-3xl bg-zinc-900/80 flex items-center justify-center mb-4 border border-zinc-800/80 shadow-inner"><Search className="h-8 w-8 text-zinc-600" /></div>
                  <h3 className="text-base font-bold text-zinc-300">No communities found</h3>
                  <p className="text-xs text-zinc-500 mt-1.5 max-w-[300px] mx-auto">Try searching for something else or create your own.</p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination Footer */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 md:px-8 py-3 bg-zinc-950/80 border-t border-zinc-800/60 shrink-0 z-20 backdrop-blur-md">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center justify-center h-9 px-4 rounded-lg border border-zinc-800/60 bg-zinc-900/80 text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed gap-1.5 group shadow-sm">
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Prev
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  if (totalPages > 5 && pageNum !== 1 && pageNum !== totalPages && Math.abs(currentPage - pageNum) > 1) {
                    if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="text-zinc-600 text-xs font-bold tracking-widest px-1">...</span>;
                    return null;
                  }
                  return (
                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={cn("h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm", currentPage === pageNum ? "bg-zinc-800 text-white border border-zinc-700 shadow-inner" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent")}>{pageNum}</button>
                  );
                })}
              </div>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center justify-center h-9 px-4 rounded-lg border border-zinc-800/60 bg-zinc-900/80 text-xs font-bold text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed gap-1.5 group shadow-sm">
                Next <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}