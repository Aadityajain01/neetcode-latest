"use client";

import { useState, useEffect } from "react";
import { useCommunity } from "@/components/communities/CommunityContext";
import { communityApi } from "@/lib/api-modules";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Users, Crown, Shield, UserX, ArrowRightLeft, MoreVertical, Loader2, MicOff, Mic } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SettingsPage() {
  const { community, userRole, refreshCommunity } = useCommunity();
  const router = useRouter();
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    allowUsersToChat: true,
    allowTestCreation: false
  });
  
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Member states
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const fetchMembers = async () => {
    if (!community) return;
    try {
      setMembersLoading(true);
      const membersList = await communityApi.getMembers(community._id);
      setMembers(Array.isArray(membersList) ? membersList : []);
    } catch (e) {
      toast.error("Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (community) {
      setForm({
        name: community.name || "",
        description: community.description || "",
        allowUsersToChat: community.allowUsersToChat ?? true,
        allowTestCreation: community.allowTestCreation ?? false
      });
      fetchMembers();
    }
  }, [community]);

  const isAdmin = userRole === "admin" || userRole === "owner";
  const isOwner = userRole === "owner";

  const handleSave = async () => {
    setLoading(true);
    try {
      await communityApi.updateSettings(community!._id, form);
      toast.success("Settings saved");
      await refreshCommunity();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    try {
      await communityApi.deleteCommunity(community!._id);
      toast.success("Community deleted");
      router.push("/communities");
    } catch {
      toast.error("Failed to delete community");
    }
  };

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

  return (
    <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8 mt-6 pb-12 animate-in fade-in flex flex-col items-center">
      
      {/* Group Info Header */}
      <div className="w-full space-y-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-md">
         <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-4xl text-emerald-500 font-bold border border-emerald-500/20 shadow-lg">
            {(community?.name?.[0] || '?').toUpperCase()}
         </div>
         <div>
            <h1 className="text-2xl font-bold text-white mb-2">{community?.name}</h1>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto">{community?.description}</p>
         </div>
      </div>

      {isAdmin && (
         <div className="w-full space-y-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md">
           <div>
             <h2 className="text-xl font-bold text-white mb-1">Group Settings</h2>
             <p className="text-sm text-zinc-400 mb-6">Manage settings and permissions only visible to admins.</p>
           </div>
           
           <div className="space-y-4">
             <div className="space-y-2">
               <Label className="text-zinc-300">Group Name</Label>
               <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500" />
             </div>
             <div className="space-y-2">
               <Label className="text-zinc-300">Description</Label>
               <Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500 min-h-[100px]" />
             </div>
           </div>

           <div className="space-y-4 mt-8 pt-6 border-t border-zinc-800">
             <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
               <div className="space-y-0.5">
                 <Label className="text-base text-zinc-200">Allow Global Chat</Label>
                 <p className="text-sm text-zinc-500">If disabled, only admins can send messages.</p>
               </div>
               <Switch checked={form.allowUsersToChat} onCheckedChange={(v) => setForm({ ...form, allowUsersToChat: v })} />
             </div>
             
             <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
               <div className="space-y-0.5">
                 <Label className="text-base text-zinc-200">Allow Test Creation</Label>
                 <p className="text-sm text-zinc-500">If enabled, standard members can create tests.</p>
               </div>
               <Switch checked={form.allowTestCreation} onCheckedChange={(v) => setForm({ ...form, allowTestCreation: v })} />
             </div>
           </div>

           <div className="flex justify-end pt-4">
               <Button onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto px-8">
                 Save Settings
               </Button>
           </div>
         </div>
      )}

      {/* Members Section */}
      <div className="w-full space-y-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-md">
         <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-4">
            <div>
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" /> 
                  Participants
               </h2>
               <p className="text-sm text-zinc-400 mt-1">{members.length} members</p>
            </div>
         </div>

         {membersLoading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
         ) : members.length === 0 ? (
            <div className="py-8 text-center text-zinc-500">No members found.</div>
         ) : (
            <div className="flex flex-col gap-2">
               {members.map((member) => {
                  const userData = member.userId as any;
                  const isUserOwner = member.role === 'owner';
                  const isUserAdmin = member.role === 'admin';
                  const isMe = userData?._id === (window as any)._currentUser?.id; // rough check, we'll just not rely heavily on isMe here
                  const canManage = isAdmin && !isUserOwner;

                  return (
                     <div key={member._id} className={cn("flex items-center justify-between p-3 rounded-lg hover:bg-zinc-950 border border-transparent hover:border-zinc-800 transition-colors group", member.isMuted ? "opacity-75" : "")}>
                        
                        <Link href={`/profile/${userData?._id || ''}`} className="flex items-center gap-4 flex-1">
                           <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold border",
                              isUserOwner ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                              isUserAdmin ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                              "bg-zinc-800 text-zinc-400 border-zinc-700"
                           )}>
                              {(userData?.displayName?.[0] || userData?.email?.[0] || '?').toUpperCase()}
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                 <p className="text-zinc-200 font-medium">{userData?.displayName || "Unknown"}</p>
                                 {isUserOwner && <Crown className="w-3 h-3 text-amber-500" />}
                                 {isUserAdmin && <Shield className="w-3 h-3 text-purple-500" />}
                                 {member.isMuted && <MicOff className="w-3 h-3 text-red-500" />}
                              </div>
                              <p className="text-xs text-zinc-500 capitalize">{member.role} {member.isMuted ? ' • Muted' : ''}</p>
                           </div>
                        </Link>

                        {canManage && (
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white shrink-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-200 z-50">
                                <DropdownMenuLabel>Manage Participant</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-zinc-800" />
                                
                                {isOwner && !isUserAdmin && (
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
                                    {member.isMuted ? "Unmute" : "Mute Server Chat"}
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem onClick={() => handleRemoveMember(userData._id)} className="focus:bg-red-500/10 focus:text-red-500 text-red-400 cursor-pointer">
                                  <UserX className="w-4 h-4 mr-2" /> Remove
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

      {isOwner && (
        <div className="w-full mt-8 pt-8 border-t border-red-900/30">
          <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
          <p className="text-sm text-zinc-400 mb-6">Once you delete the group, there is no going back.</p>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
             <DialogTrigger asChild>
               <Button variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 w-full mb-8">Exit and Delete Group</Button>
             </DialogTrigger>
             <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                <DialogHeader>
                   <DialogTitle>Are you absolutely sure?</DialogTitle>
                   <DialogDescription>This action cannot be undone. This will permanently delete the group and remove all test records.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                   <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                   <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</Button>
                </DialogFooter>
             </DialogContent>
          </Dialog>
        </div>
      )}
      </div>
    </div>
  );
}
