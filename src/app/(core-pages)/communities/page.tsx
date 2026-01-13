"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { communityApi, Community } from "@/lib/api-modules";
import MainLayout from "@/components/layouts/main-layout";
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
  Building2,
  ArrowRight,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CommunitiesPage() {
  const router = useRouter();
  const { initialized, isAuthenticated } = useAuthStore();

  /* -------------------- DATA STATE -------------------- */
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------- SEARCH -------------------- */
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
    if (!initialized) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchCommunities();
  }, [initialized, isAuthenticated]);

  /* -------------------- LOCAL SEARCH FILTER -------------------- */
  useEffect(() => {
    if (!debouncedSearch) {
      setCommunities(allCommunities);
      return;
    }

    const filtered = allCommunities.filter((c) =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    setCommunities(filtered);
  }, [debouncedSearch, allCommunities]);

  /* -------------------- FETCH ONCE -------------------- */
  const fetchCommunities = async () => {
    try {
      setLoading(true);

      const list = await communityApi.getCommunities();
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

    setCreateLoading(true);
    try {
      await communityApi.createCommunity({
        name: newCommunity.name,
        description: newCommunity.description,
        type: newCommunity.type,
        domain:
          newCommunity.type === "domain_restricted"
            ? newCommunity.domain
            : undefined,
      });

      toast.success("Community created");
      setIsCreateDialogOpen(false);
      setNewCommunity({
        name: "",
        description: "",
        type: "open",
        domain: "",
      });

      fetchCommunities();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Create failed");
    } finally {
      setCreateLoading(false);
    }
  };

  if (!initialized) return null;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* -------------------- HERO -------------------- */}
        <div className="relative rounded-3xl bg-zinc-900/50 border border-zinc-800 p-8 overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5 p-6">
            <Building2 className="w-60 h-60 text-emerald-500" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Communities
              </h1>
              <p className="text-zinc-400 max-w-xl">
                Join developers from your university or organization and grow
                together.
              </p>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Plus className="mr-2 h-5 w-5" /> Create Community
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
                      />
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

        {/* -------------------- SEARCH -------------------- */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities..."
            className="pl-12 h-12 bg-zinc-900 border-zinc-800"
          />
        </div>

        {/* -------------------- GRID -------------------- */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : communities.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((c) => {
              // Helper to check if owner is an object (populated)
              const owner = typeof c.ownerId === 'object' ? c.ownerId : null;

              return (
                <Link key={c._id} href={`/communities/${c._id}`}>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-emerald-500/30 transition h-full flex flex-col">
                    <div className="flex justify-between mb-4">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-lg flex items-center justify-center",
                          c.type === "domain_restricted"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-emerald-500/10 text-emerald-500"
                        )}
                      >
                        {c.type === "domain_restricted" ? (
                          <Lock className="h-6 w-6" />
                        ) : (
                          <Globe className="h-6 w-6" />
                        )}
                      </div>

                      {c.type === "domain_restricted" && (
                        <Badge className="bg-amber-500/10 text-amber-500">
                          {c.domain}
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">
                      {c.name}
                    </h3>

                    <p className="text-sm text-zinc-400 line-clamp-2 mb-4 flex-1">
                      {c.description}
                    </p>

                    {/* NEW: Created By Section */}
                    {owner && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4 border-t border-zinc-800/50 pt-3">
                        <span>Created by</span>
                        <div
                          key={c._id}
                          onClick={(e) => {
                            router.push(`/communities/${c._id}`)
                            e.stopPropagation()
                          }}
                          // onClick={(e) => e.stopPropagation()} // Prevents clicking the whole card
                          className="flex items-center gap-1 text-zinc-300 hover:text-emerald-400 transition-colors font-medium"
                        >
                          <User className="w-3 h-3" />
                          {owner.displayName || 'User'}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-sm mt-auto pt-2">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Users className="h-4 w-4" />
                        {c.memberCount} Members
                      </div>
                      <span className="text-emerald-500 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
                        View <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-xl">
            <Users className="h-10 w-10 mx-auto text-zinc-600 mb-2" />
            <p className="text-zinc-500">No communities found for "{search}"</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}