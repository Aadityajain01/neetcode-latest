"use client";

import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import {
  Search,
  Loader2,
  Users,
  Globe,
  Lock,
  Plus,
  ArrowRight,
  UserPlus
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
    if (joiningCommunityId) return;

    setJoiningCommunityId(communityId);
    try {
      await communityApi.joinCommunity(communityId);
      toast.success("Joined community successfully");

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
      toast.error(err?.response?.data?.error || "Failed to join community");
    } finally {
      setJoiningCommunityId(null);
    }
  };

  if (!initialized) return null;

  return (
    <div className="w-full mx-auto p-4 md:p-8 space-y-6">
      {/* -------------------- HEADER -------------------- */}
      <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-xl font-bold text-white">Communities</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* SEARCH */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search communities..."
              className="pl-9 h-10 bg-zinc-900/50 border-zinc-800 text-sm"
            />
          </div>

          {/* CREATE COMMUNITY */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0 h-10 w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Create Community
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-zinc-950 border-zinc-800">
              <DialogHeader>
                <DialogTitle>Create Community</DialogTitle>
                <DialogDescription>
                  Create a new developer community
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newCommunity.name}
                    onChange={(e) =>
                      setNewCommunity({
                        ...newCommunity,
                        name: e.target.value,
                      })
                    }
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newCommunity.description}
                    onChange={(e) =>
                      setNewCommunity({
                        ...newCommunity,
                        description: e.target.value,
                      })
                    }
                    className="bg-zinc-900 border-zinc-800 h-24"
                  />
                </div>

                <div>
                  <Label>Access Type</Label>
                  <Select
                    value={newCommunity.type}
                    onValueChange={(v: any) =>
                      setNewCommunity({ ...newCommunity, type: v })
                    }
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="domain_restricted">
                        Domain Restricted
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newCommunity.type === "domain_restricted" && (
                  <div>
                    <Label>Domain</Label>
                    <Input
                      value={newCommunity.domain}
                      onChange={(e) =>
                        setNewCommunity({
                          ...newCommunity,
                          domain: e.target.value,
                        })
                      }
                      className="bg-zinc-900 border-zinc-800"
                      placeholder="company.com or user@company.com"
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                      Domain will be normalized automatically.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCommunity}
                  disabled={createLoading}
                  className="bg-emerald-500 text-white"
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

      {/* -------------------- LIST/TABLE -------------------- */}
      <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-800 text-sm font-semibold text-zinc-400 capitalize">
          <div className="col-span-5">Community Name</div>
          <div className="col-span-3">Type</div>
          <div className="col-span-2">Member count</div>
          <div className="col-span-2 text-right pr-4">Action</div>
        </div>

        {/* List */}
        {loading ? (
          <div className="py-20 flex justify-center border-b border-zinc-800">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : paginatedCommunities.length > 0 ? (
          <div className="flex flex-col">
            {paginatedCommunities.map((c) => {
              const isJoined = joinedCommunityIds.has(c._id);
              const isJoining = joiningCommunityId === c._id;
              return (
                <div key={c._id} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-zinc-800/50 hover:bg-zinc-800/20 transition items-center">
                  {/* Community Name Column */}
                  <div className="col-span-12 md:col-span-5 flex items-center gap-4 min-w-0">
                    <div
                      className={cn(
                        "h-10 w-10 shrink-0 rounded-lg flex flex-col items-center justify-center",
                        c.type === "domain_restricted"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-emerald-500/10 text-emerald-500"
                      )}
                    >
                      {c.type === "domain_restricted" ? <Lock className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-white truncate">{c.name}</h3>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{c.description}</p>
                      {/* {owner && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1">
                          <span>By {owner.displayName || 'User'}</span>
                        </div>
                      )} */}
                    </div>
                  </div>

                  {/* Type Column */}
                  <div className="col-span-12 md:col-span-3 flex items-center">
                    <span className="text-sm text-zinc-300">
                      {c.type === "domain_restricted" ? "Locked" : "Public"}
                    </span>
                  </div>

                  {/* Member Count Column */}
                  <div className="col-span-12 md:col-span-2 flex items-center text-sm text-zinc-300 gap-2">
                    <Users className="h-4 w-4 text-zinc-500" />
                    {c.memberCount}
                  </div>

                  {/* View Column */}
                  <div className="col-span-12 md:col-span-2 flex md:justify-end items-center mt-2 md:mt-0">
                    {isJoined ? (
                      <Button
                        className="w-full md:w-24 h-9 shadow-none bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={() => router.push(`/communities/${c._id}/chat`)}
                      >
                        Enter <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        disabled={isJoining}
                        className="border-zinc-700 hover:bg-zinc-800 text-zinc-200 hover:text-white w-full md:w-24 h-9 shadow-none bg-transparent"
                        onClick={() => handleJoinCommunity(c._id)}
                      >
                        {isJoining ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            Join <UserPlus className="ml-1 h-3 w-3" />
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
          <div className="py-20 text-center border-b border-zinc-800 bg-zinc-900/10">
            <Users className="h-10 w-10 mx-auto text-zinc-600 mb-2" />
            <p className="text-zinc-500">No communities found for "{search}"</p>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && (
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-950/30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-zinc-800 bg-transparent text-white hover:bg-zinc-800 px-6 disabled:opacity-50"
            >
              Prev
            </Button>
            <span className="text-sm text-zinc-500">
              {currentPage} of {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="border-zinc-800 bg-transparent text-white hover:bg-zinc-800 px-6 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}