"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCommunity } from "./CommunityContext";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { communityApi } from "@/lib/api-modules";
import { toast } from "sonner";
import {
  BarChart3,
  FileText,
  Loader2,
  Lock,
  LogOut,
  MessageSquare,
  MoreVertical,
  Settings,
  Trophy,
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
    userRole === "owner" ? "Owner" : userRole === "admin" ? "Admin" : "Member";

  const navItems = [
    {
      name: "Chat",
      path: `${basePath}/chat`,
      icon: MessageSquare,
      show: true,
    },
    {
      name: "Leaderboard",
      path: `${basePath}/leaderboard`,
      icon: Trophy,
      show: true,
    },
    {
      name: "Tests",
      path: `${basePath}/tests`,
      icon: FileText,
      show: true,
    },
    {
      name: "Analytics",
      path: `${basePath}/analytics`,
      icon: BarChart3,
      show: isAdmin,
    },
    {
      name: "Settings",
      path: `${basePath}/settings`,
      icon: Settings,
      show: true,
    },
  ].filter((item) => item.show);

  const handleJoinCommunity = async () => {
    setActionLoading(true);
    try {
      await communityApi.joinCommunity(community._id);
      toast.success(`Welcome to ${community.name}!`);
      await refreshCommunity();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to join.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveCommunity = async () => {
    setActionLoading(true);
    try {
      await communityApi.leaveCommunity(community._id);
      toast.success("You have left the community.");
      router.push("/communities");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to leave");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-zinc-950 text-zinc-100">
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <div className="flex h-full w-full flex-col">
          <header className="flex items-center justify-between gap-3 border-b border-zinc-900 bg-zinc-950/80 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-4">
              <BackButton
                href="/communities"
                className="shrink-0 mb-0 [&>button]:mb-0 h-10 w-10 flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                label=""
              />

              <Link href={`${basePath}/chat`} className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-lg font-bold text-white shadow-sm">
                  {(community.name?.[0] || "?").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-lg font-semibold text-white tracking-tight sm:text-2xl">
                      {community.name}
                    </h1>
                    {community.type === "domain_restricted" && (
                      <Lock className="h-4 w-4 shrink-0 text-amber-400" />
                    )}
                  </div>
                  <p className="truncate text-xs text-zinc-500 sm:text-sm">
                    {community.description || "Community discussion space"}
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {isMember ? (
                <>
                  <Badge
                    variant="outline"
                    className="hidden border-emerald-500/30 bg-emerald-500/10 text-emerald-300 sm:inline-flex"
                  >
                    {roleLabel}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-sm border border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={10}
                      className="w-64 rounded-2xl border-zinc-800 bg-black p-2 text-zinc-100"
                    >
                      <DropdownMenuLabel className="px-3 py-2">
                        <div className="space-y-2">
                          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                            Community Menu
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            >
                              {roleLabel}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "border",
                                community.type === "domain_restricted"
                                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              )}
                            >
                              {community.type === "domain_restricted" ? "Locked" : "Public"}
                            </Badge>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.path);
                        return (
                          <DropdownMenuItem
                            key={item.path}
                            onSelect={() => router.push(item.path)}
                            className={cn(
                              "mt-1 rounded-xl px-3 py-3 text-sm focus:bg-zinc-900",
                              isActive && "bg-zinc-900 text-emerald-300"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </DropdownMenuItem>
                        );
                      })}
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem
                        onSelect={() => setIsLeaveDialogOpen(true)}
                        disabled={userRole === "owner"}
                        className="rounded-xl px-3 py-3 text-sm text-red-400 focus:bg-red-950/40 focus:text-red-300"
                      >
                        <LogOut className="h-4 w-4" />
                        Leave Community
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={handleJoinCommunity}
                  disabled={actionLoading}
                  className="h-10 rounded-sm bg-emerald-500 px-4 font-semibold text-white hover:bg-emerald-600"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Community"}
                </Button>
              )}
            </div>
          </header>

          <main className="min-h-0 flex-1 bg-zinc-950">
            {!isMember ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center text-zinc-500">
                <Lock className="h-12 w-12 text-zinc-800" />
                <p className="text-sm">Join this community to view messages, tests, and rankings.</p>
                <Button
                  size="sm"
                  onClick={handleJoinCommunity}
                  disabled={actionLoading}
                  className="rounded-sm bg-emerald-500 px-4 font-semibold text-white hover:bg-emerald-600"
                >
                  {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Join Community
                </Button>
              </div>
            ) : (
              children
            )}
          </main>
        </div>

        <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Leave Community?</DialogTitle>
            <DialogDescription>
              You will lose access to member-only chat, tests, and rankings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsLeaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLeaveCommunity}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Leave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
