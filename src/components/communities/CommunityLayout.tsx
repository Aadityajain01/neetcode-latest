"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCommunity } from "./CommunityContext";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, Settings, BarChart, Lock, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { communityApi } from "@/lib/api-modules";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { MoreVertical } from "lucide-react";

export function CommunityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { community, isMember, userRole, refreshCommunity } = useCommunity();
  const router = useRouter();
  
  const [actionLoading, setActionLoading] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  if (!community) return null;

  const basePath = `/communities/${community._id}`;
  const isAdmin = userRole === 'admin' || userRole === 'owner';

  const tabs = [
    { name: "Chat", path: `${basePath}/chat`, icon: MessageSquare, show: true },
    { name: "Tests", path: `${basePath}/tests`, icon: FileText, show: true },
    { name: "Analytics", path: `${basePath}/analytics`, icon: BarChart, show: isAdmin },
    { name: "Settings", path: `${basePath}/settings`, icon: Settings, show: isAdmin },
  ].filter(t => t.show);

  const activeTab = tabs.find(t => pathname.startsWith(t.path));

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
    <div className="flex flex-col h-full overflow-hidden bg-zinc-950">
      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>

        {/* ── Top header bar ── */}
        <div className="flex-none flex items-center justify-between px-3 sm:px-5 h-14 border-b border-zinc-800/70 bg-zinc-900/80 backdrop-blur-sm z-20">
          <div className="flex items-center gap-3 min-w-0">
            <BackButton
              href="/communities"
              className="shrink-0 mb-0 [&>button]:mb-0 h-9 w-9 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
              label=""
            />
            {/* Community avatar */}
            <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              {(community.name?.[0] || '?').toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white tracking-tight leading-none flex items-center gap-1.5 truncate">
                {community.name}
                {community.type === 'domain_restricted' && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
              </h1>
              <p className="text-xs text-zinc-400 truncate max-w-[180px] sm:max-w-sm mt-0.5">
                {community.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isMember ? (
              <Button size="sm" onClick={handleJoinCommunity} disabled={actionLoading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-8 px-3 text-xs">
                {actionLoading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : "Join"}
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-white rounded-full">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-zinc-200">
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DialogTrigger asChild>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-500 focus:text-red-400 hover:bg-zinc-800 focus:bg-zinc-800"
                      disabled={userRole === 'owner'}>
                      <LogOut className="w-4 h-4 mr-2" /> Leave Group
                    </DropdownMenuItem>
                  </DialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* ── Tab navigation ── */}
        {isMember && (
          <div className="flex-none flex items-center border-b border-zinc-800/70 bg-zinc-950 px-2 sm:px-4 overflow-x-auto scrollbar-none">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = pathname.startsWith(tab.path);
              return (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0",
                    isActive
                      ? "border-emerald-500 text-emerald-400"
                      : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Scrollable content area ── */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
          {!isMember ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 p-12 text-zinc-500 h-full">
              <Lock className="w-12 h-12 text-zinc-800" />
              <p className="text-sm">Join this community to view messages and tests.</p>
              <Button size="sm" onClick={handleJoinCommunity} disabled={actionLoading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                {actionLoading ? <Loader2 className="animate-spin w-3.5 h-3.5 mr-2" /> : null}
                Join Community
              </Button>
            </div>
          ) : (
            children
          )}
        </div>

        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Leave Community?</DialogTitle>
            <DialogDescription>You will lose access to member-only messages and tests.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsLeaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLeaveCommunity} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
              {actionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirm Leave"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
