"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCommunity } from "@/components/communities/CommunityContext";
import { communityApi, CommunityMember } from "@/lib/api-modules";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, Crown, Shield, UserX, ArrowRightLeft, MoreVertical, Loader2, MicOff, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MembersPage() {
  const { community, isMember, userRole } = useCommunity();
  const { user } = useAuthStore();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    if (!community) return;
    try {
      setLoading(true);
      const membersList = await communityApi.getMembers(community._id);
      setMembers(Array.isArray(membersList) ? membersList : []);
    } catch (e) {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [community?._id]);

  if (!isMember) return null;

  const isAdmin = userRole === "owner" || userRole === "admin";
  const isOwner = userRole === "owner";

  const handleRemoveMember = async (userId: string) => {
    if(!confirm("Remove this user?")) return;
    try {
      await communityApi.removeMember(community!._id, userId);
      toast.success("Member removed");
      fetchMembers();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handlePromoteMember = async (userId: string) => {
    try {
      await communityApi.promoteMember(community!._id, userId);
      toast.success("Member promoted to Admin");
      fetchMembers();
    } catch (error) {
      toast.error("Failed to promote member");
    }
  };

  const handleTransferOwnership = async (userId: string) => {
    if(!confirm("Transfer ownership? You will become a regular member.")) return;
    try {
      await communityApi.transferOwnership(community!._id, userId);
      toast.success("Ownership transferred");
      fetchMembers();
    } catch (error) {
      toast.error("Failed to transfer ownership");
    }
  };

  const handleMuteToggle = async (userId: string, currentMuted: boolean) => {
     try {
       await communityApi.muteMember(community!._id, userId, !currentMuted);
       toast.success(currentMuted ? "Member unmuted" : "Member muted");
       fetchMembers();
     } catch(e) {
       toast.error("Failed to toggle mute state");
     }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in pt-8">
      <div className="flex items-center gap-3">
         <div className="p-2 bg-zinc-800 rounded-lg"><Users className="w-5 h-5 text-white" /></div>
         <h2 className="text-xl font-bold text-white">Members <span className="text-zinc-500 ml-2 font-normal">{members.length}</span></h2>
      </div>

      {members.length === 0 ? (
         <div className="py-12 text-center text-zinc-500 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
            No members found.
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
               const userData = member.userId as any;
               const isUserOwner = member.role === 'owner';
               const isUserAdmin = member.role === 'admin';
               const isMe = userData._id === user?.id;
               const canManage = (isAdmin && !isUserOwner && !isMe) || (isOwner && !isMe);

               return (
                  <div key={member._id} className={cn("flex items-center justify-between p-4 rounded-xl border transition-colors group", member.isMuted ? "bg-zinc-900/50 border-zinc-800/50 opacity-75" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700")}>
                     
                     <Link 
                       href={`/profile/${userData?._id || ''}`} 
                       className="flex-1 flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                     >
                        <div className={cn("h-10 w-10 rounded-full flex shrink-0 items-center justify-center text-sm font-bold border",
                           isUserOwner ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                           isUserAdmin ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                           "bg-zinc-800 text-zinc-400 border-zinc-700"
                        )}>
                           {(userData?.displayName?.[0] || userData?.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                           <div className="flex items-center gap-2">
                              <p className="text-zinc-200 font-medium truncate">{userData?.displayName || "Unknown"}</p>
                              {isUserOwner && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                              {isUserAdmin && <Shield className="w-3 h-3 text-purple-500 shrink-0" />}
                              {member.isMuted && <MicOff className="w-3 h-3 text-red-500 shrink-0" />}
                           </div>
                           <p className="text-xs text-zinc-500 capitalize">{member.role} {member.isMuted ? ' • Muted' : ''}</p>
                        </div>
                     </Link>

                     {canManage && (
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white shrink-0 ml-2">
                               <MoreVertical className="h-4 w-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-200 z-50">
                             <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                             <DropdownMenuSeparator className="bg-zinc-800" />
                             
                             {isOwner && member.role !== 'admin' && (
                               <DropdownMenuItem onClick={() => handlePromoteMember(userData._id)} className="focus:bg-emerald-500/10 focus:text-emerald-500 cursor-pointer">
                                 <Shield className="w-4 h-4 mr-2" /> Promote to Admin
                               </DropdownMenuItem>
                             )}
                             
                             {isOwner && (
                               <DropdownMenuItem onClick={() => handleTransferOwnership(userData._id)} className="focus:bg-amber-500/10 focus:text-amber-500 cursor-pointer">
                                 <ArrowRightLeft className="w-4 h-4 mr-2" /> Transfer Ownership
                               </DropdownMenuItem>
                             )}

                             {isAdmin && (
                               <DropdownMenuItem onClick={() => handleMuteToggle(userData._id, !!member.isMuted)} className="focus:bg-zinc-800 cursor-pointer">
                                 {member.isMuted ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />} 
                                 {member.isMuted ? "Unmute" : "Mute User"}
                               </DropdownMenuItem>
                             )}

                             <DropdownMenuItem onClick={() => handleRemoveMember(userData._id)} className="focus:bg-red-500/10 focus:text-red-500 text-red-400 cursor-pointer">
                               <UserX className="w-4 h-4 mr-2" /> Remove Member
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                        </DropdownMenu>
                     )}
                  </div>
               );
            })}
         </div>
      )}
    </div>
  );
}
