"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { communityApi, Community, userApi } from "@/lib/api-modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  Users,
  Globe,
  Lock,
  Plus,
  ArrowRight,
  UserPlus,
  Sparkles,
  Shield,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";

function normalizeDomainInput(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";

  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
  const withoutPath = withoutProtocol.split("/")[0];
  const withoutAt = withoutPath.startsWith("@")
    ? withoutPath.slice(1)
    : withoutPath;

  return withoutAt.includes("@")
    ? withoutAt.split("@").pop() || ""
    : withoutAt;
}

export default function CommunitiesPage() {
  const router = useRouter();
  const { initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();

  /* -------------------- DATA STATE -------------------- */
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [joiningCommunityId, setJoiningCommunityId] = useState<string | null>(null);
  const joinRequestLockRef = useRef<Set<string>>(new Set());

  /* -------------------- PAGINATION & SEARCH -------------------- */
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  /* -------------------- CREATE -------------------- */
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    type: "open" as "open" | "domain_restricted",
    domain: "",
  });

  /* -------------------- DEBOUNCE -------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  /* -------------------- AUTH GUARD -------------------- */
  useEffect(() => {
    if (!initialized || authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchCommunities();
  }, [initialized, isAuthenticated, authLoading, router]);

  /* -------------------- LOCAL SEARCH FILTER -------------------- */
  useEffect(() => {
    if (!debouncedSearch) {
      setCommunities(allCommunities);
      setCurrentPage(1);
      return;
    }

    const filtered = allCommunities.filter((c) =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    setCommunities(filtered);
    setCurrentPage(1);
  }, [debouncedSearch, allCommunities]);

  /* -------------------- DERIVED PAGINATION -------------------- */
  const totalPages = Math.ceil(communities.length / itemsPerPage);
  const paginatedCommunities = communities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* -------------------- FETCH ONCE -------------------- */
  const fetchCommunities = async () => {
    try {
      setLoading(true);

      const [list, mine] = await Promise.all([
        communityApi.getCommunities(),
        userApi.getCommunities(),
      ]);

      setJoinedCommunityIds(
        new Set(
          (mine || [])
            .map((community: any) => community._id || community.id)
            .filter(Boolean)
        )
      );
      setAllCommunities(list);
      setCommunities(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- CREATE COMMUNITY -------------------- */
  const handleCreateCommunity = async () => {
    if (!newCommunity.name || !newCommunity.description) {
      toast.error("Name and description are required");
      return;
    }

    if (newCommunity.type === "domain_restricted" && !newCommunity.domain) {
      toast.error("Domain is required");
      return;
    }

    const normalizedDomain =
      newCommunity.type === "domain_restricted"
        ? normalizeDomainInput(newCommunity.domain)
        : "";

    if (newCommunity.type === "domain_restricted" && !normalizedDomain) {
      toast.error("Enter a valid domain, e.g. company.com or user@company.com");
      return;
    }

    setCreateLoading(true);
    try {
      const created = await communityApi.createCommunity({
        name: newCommunity.name,
        description: newCommunity.description,
        type: newCommunity.type,
        domain:
          newCommunity.type === "domain_restricted"
            ? normalizedDomain
            : undefined,
      });

      toast.success("Community created successfully");
      setIsCreateDialogOpen(false);
      setNewCommunity({
        name: "",
        description: "",
        type: "open",
        domain: "",
      });

      await fetchCommunities();
      router.push(`/communities/${created._id}/chat`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Create failed");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (joinRequestLockRef.current.has(communityId)) return;

    joinRequestLockRef.current.add(communityId);
    setJoiningCommunityId(communityId);
    try {
      await communityApi.joinCommunity(communityId);
      toast.success("Joined community successfully", {
        id: `community-join-success-${communityId}`,
      });

      setJoinedCommunityIds((prev) => new Set(prev).add(communityId));
      setAllCommunities((prev) =>
        prev.map((community) =>
          community._id === communityId
            ? { ...community, memberCount: (community.memberCount || 0) + 1 }
            : community
        )
      );
      setCommunities((prev) =>
        prev.map((community) =>
          community._id === communityId
            ? { ...community, memberCount: (community.memberCount || 0) + 1 }
            : community
        )
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to join community", {
        id: `community-join-error-${communityId}`,
      });
    } finally {
      joinRequestLockRef.current.delete(communityId);
      setJoiningCommunityId(null);
    }
  };

  if (!initialized) return null;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-sans">
      {/* -------------------- HEADER -------------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium mb-2 border border-emerald-500/20">
            <Sparkles className="h-3 w-3" />
            <span>Discover Communities</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Communities</h1>
          <p className="text-zinc-400 text-sm max-w-md">
            Join groups of like-minded developers, share knowledge, and collaborate on projects.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* SEARCH */}
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search communities..."
              className="pl-10 h-11 bg-zinc-900/50 border-zinc-800 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500 transition-all"
            />
          </div>

          {/* CREATE COMMUNITY */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-zinc-950 hover:bg-zinc-200 shrink-0 h-11 px-5 rounded-xl font-medium w-full sm:w-auto transition-all active:scale-95 border-0">
                <Plus className="mr-2 h-4 w-4" /> Create
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-zinc-950 border border-zinc-800 rounded-2xl sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl text-white">Create Community</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Build a space for developers to connect.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-2">
                <div className="space-y-1.5">
                  <Label className="text-zinc-300">Name</Label>
                  <Input
                    value={newCommunity.name}
                    onChange={(e) =>
                      setNewCommunity({
                        ...newCommunity,
                        name: e.target.value,
                      })
                    }
                    className="bg-zinc-900/50 border-zinc-800 rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500 text-white"
                    placeholder="e.g. Next.js Masters"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-zinc-300">Description</Label>
                  <Textarea
                    value={newCommunity.description}
                    onChange={(e) =>
                      setNewCommunity({
                        ...newCommunity,
                        description: e.target.value,
                      })
                    }
                    className="bg-zinc-900/50 border-zinc-800 h-24 rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500 resize-none text-white"
                    placeholder="What is this community about?"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-zinc-300">Access Type</Label>
                  <Select
                    value={newCommunity.type}
                    onValueChange={(v: any) =>
                      setNewCommunity({ ...newCommunity, type: v })
                    }
                  >
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 rounded-xl text-white">
                      <SelectItem value="open" className="rounded-lg focus:bg-zinc-800 focus:text-white">Open</SelectItem>
                      <SelectItem value="domain_restricted" className="rounded-lg focus:bg-zinc-800 focus:text-white">
                        Domain Restricted
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newCommunity.type === "domain_restricted" && (
                  <div className="space-y-1.5">
                    <Label className="text-zinc-300">Domain</Label>
                    <Input
                      value={newCommunity.domain}
                      onChange={(e) =>
                        setNewCommunity({
                          ...newCommunity,
                          domain: e.target.value,
                        })
                      }
                      className="bg-zinc-900/50 border-zinc-800 rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500 text-white"
                      placeholder="company.com or user@company.com"
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                      Domain will be normalized automatically.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="rounded-xl hover:bg-zinc-900 text-zinc-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCommunity}
                  disabled={createLoading}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 min-w-[100px] border-0"
                >
                  {createLoading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* -------------------- LIST -------------------- */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: itemsPerPage }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-zinc-800/40 bg-zinc-950/30 gap-4"
              >
                <div className="flex items-center gap-4 w-full">
                  <Skeleton className="h-12 w-12 rounded-xl bg-zinc-800/50 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48 bg-zinc-800/50" />
                    <Skeleton className="h-4 w-3/4 max-w-[300px] bg-zinc-800/30" />
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <Skeleton className="h-4 w-16 bg-zinc-800/50 hidden sm:block" />
                  <Skeleton className="h-10 w-full sm:w-28 rounded-xl bg-zinc-800/50" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedCommunities.length > 0 ? (
          <div className="space-y-3">
            {paginatedCommunities.map((c) => {
              const isJoined = joinedCommunityIds.has(c._id);
              const isJoining = joiningCommunityId === c._id;
              
              return (
                <div 
                  key={c._id} 
                  className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl border border-zinc-800/50 bg-zinc-950/40 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all duration-300 gap-4 overflow-hidden"
                >
                  {/* Subtle gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Community Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1 relative z-10 w-full">
                    <div
                      className={cn(
                        "h-12 w-12 shrink-0 rounded-xl flex items-center justify-center shadow-inner",
                        c.type === "domain_restricted"
                          ? "bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-500 border border-amber-500/20"
                          : "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-500 border border-emerald-500/20"
                      )}
                    >
                      {c.type === "domain_restricted" ? <Shield className="h-5 w-5" /> : <Hash className="h-5 w-5" />}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-zinc-100 truncate group-hover:text-white transition-colors">
                          {c.name}
                        </h3>
                        {c.type === "domain_restricted" && (
                          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                            Private
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 truncate mt-0.5 group-hover:text-zinc-300 transition-colors">
                        {c.description}
                      </p>
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto relative z-10 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-zinc-800/50 sm:border-0">
                    <div className="flex items-center gap-1.5 text-sm text-zinc-400 shrink-0 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800/50">
                      <Users className="h-4 w-4 text-zinc-500" />
                      <span className="font-medium text-zinc-300">{c.memberCount}</span>
                    </div>

                    {isJoined ? (
                      <Button
                        className="w-full sm:w-auto h-10 px-5 rounded-xl shadow-none bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 hover:border-zinc-600 transition-all active:scale-95"
                        onClick={() => router.push(`/communities/${c._id}/chat`)}
                      >
                        Open <ArrowRight className="ml-2 h-4 w-4 opacity-70" />
                      </Button>
                    ) : (
                      <Button
                        disabled={isJoining}
                        className="w-full sm:w-auto h-10 px-5 rounded-xl shadow-none bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 border border-emerald-500/20 transition-all active:scale-95 group/btn"
                        onClick={() => handleJoinCommunity(c._id)}
                      >
                        {isJoining ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Join <UserPlus className="ml-2 h-4 w-4 opacity-70 group-hover/btn:opacity-100" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/30 flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-zinc-900/50 flex items-center justify-center mb-4 border border-zinc-800">
              <Search className="h-8 w-8 text-zinc-600" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200">No communities found</h3>
            <p className="text-zinc-500 mt-1 max-w-sm mx-auto">We couldn't find any communities matching "{search}". Try searching for something else or create your own.</p>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50 mt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-950/50 text-white hover:bg-zinc-900 px-5 disabled:opacity-50 transition-all"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                if (
                  totalPages > 5 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages &&
                  Math.abs(currentPage - pageNum) > 1
                ) {
                  if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="text-zinc-600 px-1">...</span>;
                  return null;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all",
                      currentPage === pageNum 
                        ? "bg-zinc-800 text-white border border-zinc-700" 
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-950/50 text-white hover:bg-zinc-900 px-5 disabled:opacity-50 transition-all"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}