"use client";

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
  ArrowLeft
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
    <div className="flex h-full w-full overflow-hidden bg-zinc-950 text-zinc-100">
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <div className="flex flex-col min-w-0 flex-1 h-full relative">
          <header className="h-[60px] flex items-center justify-between px-3 sm:px-4 bg-zinc-900/90 border-b border-zinc-800 shrink-0 z-10 w-full">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/communities')}
                className="h-10 w-10 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className={cn(
                "h-10 w-10 rounded-full flex shrink-0 items-center justify-center font-bold",
                community.type === "domain_restricted"
                  ? "bg-zinc-800 text-zinc-200"
                  : "bg-zinc-800 text-zinc-200"
              )}>
                {(community.name?.[0] || "?").toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="truncate text-base font-semibold text-zinc-100">
                    {community.name}
                  </h1>
                </div>
                <div className="truncate flex items-center gap-1 text-[13px] text-zinc-400">
                  {community.type === "domain_restricted" && (
                     <Lock className="h-3 w-3 inline-block" />
                  )}
                  {community.memberCount || 1} members
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {isMember ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full text-zinc-400 hover:bg-zinc-800"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 rounded-xl border-zinc-800 bg-zinc-900 p-1 text-zinc-200 shadow-xl"
                    >
                      <div className="px-2 py-1.5 mb-1">
                        <Badge variant="outline" className="border-zinc-700 bg-zinc-800 text-zinc-200 text-[10px] uppercase font-semibold">
                          {roleLabel}
                        </Badge>
                      </div>

                      <DropdownMenuLabel className="px-2 text-xs text-zinc-500">Navigation</DropdownMenuLabel>
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname.startsWith(item.path);
                        return (
                          <DropdownMenuItem
                            key={item.path}
                            onSelect={() => router.push(item.path)}
                            className={cn(
                              "rounded-lg text-sm cursor-pointer hover:bg-zinc-800 hover:text-zinc-100",
                              isActive && "bg-zinc-800 text-zinc-100"
                            )}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {item.name}
                          </DropdownMenuItem>
                        );
                      })}
                      <DropdownMenuSeparator className="bg-zinc-800" />

                      <DropdownMenuItem
                        onSelect={() => setIsLeaveDialogOpen(true)}
                        disabled={userRole === "owner"}
                        className="rounded-lg text-sm text-red-400 cursor-pointer hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
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
                  className="h-9 rounded-md bg-zinc-100 px-4 font-semibold text-zinc-900 hover:bg-zinc-200 shadow-none border-0"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Join Community
                </Button>
              )}
            </div>
          </header>

          <main className="flex-1 min-h-0 bg-zinc-950/80 relative overflow-y-auto flex flex-col w-full h-full">
            <div className="relative z-10 w-full h-full flex flex-col flex-1">
            {!isMember ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center text-zinc-400 bg-zinc-950/70">
                <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-2 shadow-sm border border-zinc-800">
                  <Lock className="h-10 w-10 text-zinc-400" />
                </div>
                <h2 className="text-xl font-medium text-zinc-100">Private Community Space</h2>
                <p className="text-sm max-w-sm">Join this community to view messages, participate in tests, and see rankings.</p>
                <Button
                  onClick={handleJoinCommunity}
                  disabled={actionLoading}
                  className="rounded-full bg-zinc-100 px-8 py-6 font-semibold text-zinc-900 hover:bg-zinc-200 mt-2 shadow-none border-0"
                >
                  {actionLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Join Community
                </Button>
              </div>
            ) : (
              children
            )}
            </div>
          </main>
        </div>

        <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Leave Community?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              You will lose access to member-only chat, tests, and rankings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsLeaveDialogOpen(false)} className="hover:bg-zinc-800 text-zinc-400">
              Cancel
            </Button>
            <Button
              onClick={handleLeaveCommunity}
              disabled={actionLoading}
              className="bg-red-500 hover:bg-red-600 border-0 shadow-none text-white"
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
