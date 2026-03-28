"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCommunity } from "./CommunityContext";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { communityApi } from "@/lib/api-modules";
import { toast } from "sonner";
import {
  BarChart3, FileText, Loader2, Lock, LogOut, MessageSquare,
  MoreVertical, Settings, Trophy, ArrowLeft, Users, Shield, Hash,
} from "lucide-react";

export function CommunityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { community, isMember, userRole, refreshCommunity } = useCommunity();

  const [actionLoading, setActionLoading] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  if (!community) return null;

  const basePath = `/communities/${community._id}`;
  const isAdmin = userRole === "admin" || userRole === "owner";
  const roleLabel =
    userRole === "owner" ? "Owner"
    : userRole === "admin" ? "Admin"
    : userRole === "subadmin" ? "Subadmin"
    : "Member";

  const navItems = [
    { name: "Chat", path: `${basePath}/chat`, icon: MessageSquare, show: true },
    { name: "Leaderboard", path: `${basePath}/leaderboard`, icon: Trophy, show: true },
    { name: "Tests", path: `${basePath}/tests`, icon: FileText, show: true },
    { name: "Members", path: `${basePath}/members`, icon: Users, show: isMember },
    { name: "Analytics", path: `${basePath}/analytics`, icon: BarChart3, show: isAdmin },
    { name: "Settings", path: `${basePath}/settings`, icon: Settings, show: true },
  ].filter((item) => item.show);

  const handleJoinCommunity = async () => {
    setActionLoading(true);
    try {
      await communityApi.joinCommunity(community._id);
      toast.success(`Welcome to ${community.name}!`);
      await refreshCommunity();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to join.");
    } finally { setActionLoading(false); }
  };

  const handleLeaveCommunity = async () => {
    setActionLoading(true);
    try {
      await communityApi.leaveCommunity(community._id);
      toast.success("You have left the community.");
      router.push("/communities");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to leave");
    } finally { setActionLoading(false); }
  };

  return (
    <div className="relative flex h-full w-full min-h-0 flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 text-zinc-100 font-sans">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[1500px] flex-col px-3 py-3 sm:px-4 sm:py-4 lg:w-[90%]">
        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-zinc-800/60 bg-zinc-900/35 backdrop-blur-xl shadow-xl">
      {/* ── Top Header Bar ─────────────────────────────────────── */}
      <header className="h-[60px] shrink-0 flex items-center justify-between px-4 md:px-6 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 z-30">
        {/* Left: back + community info */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/communities")}
            className="flex items-center justify-center h-9 w-9 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className={cn(
            "h-9 w-9 rounded-xl flex shrink-0 items-center justify-center font-black text-base shadow-sm border",
            community.type === "domain_restricted"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          )}>
            {community.type === "domain_restricted"
              ? <Shield className="h-4 w-4" />
              : <Hash className="h-4 w-4" />
            }
          </div>

          <div className="flex flex-col min-w-0">
            <h1 className="text-[15px] font-bold text-zinc-100 leading-tight truncate">
              {community.name}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
              {community.type === "domain_restricted" && <Lock className="h-2.5 w-2.5" />}
              <span>{community.memberCount || 1} members</span>
              <span className="text-zinc-700">·</span>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border",
                userRole === "owner" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                userRole === "admin" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                "text-zinc-500 bg-zinc-800/50 border-zinc-700/50"
              )}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isMember ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center h-9 w-9 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 rounded-2xl border-zinc-800 bg-zinc-900 p-1.5 text-zinc-200 shadow-2xl shadow-black/50 backdrop-blur-xl"
              >
                <div className="px-3 py-2 mb-1 border-b border-zinc-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Community Menu</p>
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.path);
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onSelect={() => router.push(item.path)}
                      className={cn(
                        "rounded-xl text-sm cursor-pointer hover:bg-zinc-800 hover:text-white transition-colors my-0.5 gap-2.5",
                        isActive && "bg-zinc-800 text-white font-semibold"
                      )}
                    >
                      <Icon className="h-4 w-4 text-zinc-400" />
                      {item.name}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator className="bg-zinc-800 my-1" />
                <DropdownMenuItem
                  onSelect={() => setIsLeaveDialogOpen(true)}
                  disabled={userRole === "owner"}
                  className="rounded-xl text-sm text-red-400 cursor-pointer hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300 transition-colors gap-2.5"
                >
                  <LogOut className="h-4 w-4" />
                  Leave Community
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={handleJoinCommunity}
              disabled={actionLoading}
              className="h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-4 text-xs border-0 shadow-sm"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Join Community
            </Button>
          )}
        </div>
      </header>

      {/* ── Content Area ──────────────────────────────────────────── */}
      <main className="flex flex-1 min-h-0 flex-col overflow-hidden bg-transparent">
        {!isMember ? (
          <div className="h-full flex flex-col items-center justify-center gap-5 p-10 text-center">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center mb-2 shadow-inner border border-zinc-800">
              <Lock className="h-10 w-10 text-zinc-600" />
            </div>
            <h2 className="text-xl font-black text-white">Private Community Space</h2>
            <p className="text-sm text-zinc-400 max-w-sm font-medium">
              Join this community to view messages, participate in tests, and see rankings.
            </p>
            <Button
              onClick={handleJoinCommunity}
              disabled={actionLoading}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-8 h-11 mt-2 border-0 shadow-sm"
            >
              {actionLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Join Community
            </Button>
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            {children}
          </div>
        )}
      </main>
        </section>
      </div>

      {/* ── Leave Dialog ──────────────────────────────────────────── */}
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Leave Community?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              You will lose access to member-only chat, tests, and rankings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsLeaveDialogOpen(false)} className="hover:bg-zinc-800 text-zinc-400 rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleLeaveCommunity}
              disabled={actionLoading}
              className="bg-red-500 hover:bg-red-600 border-0 shadow-none text-white rounded-xl"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
