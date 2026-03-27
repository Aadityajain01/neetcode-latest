"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCommunity } from "@/components/communities/CommunityContext";
import { communityApi } from "@/lib/api-modules";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ArrowRightLeft, Crown, Loader2, Mic, MicOff, MoreVertical, Shield, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

type MemberActionType = "remove" | "transfer" | "mute";

interface MemberActionDialogState {
  type: MemberActionType;
  userId: string;
  memberName: string;
  isMuted?: boolean;
}

export default function SettingsPage() {
  const { community, userRole, refreshCommunity } = useCommunity();
  const { user } = useAuthStore();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    allowUsersToChat: true,
    allowTestCreation: false,
  });
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberActionDialog, setMemberActionDialog] = useState<MemberActionDialogState | null>(null);
  const [memberActionLoading, setMemberActionLoading] = useState(false);

  const isAdmin = userRole === "admin" || userRole === "owner";
  const isOwner = userRole === "owner";

  useEffect(() => {
    if (!community) return;

    setForm({
      name: community.name || "",
      description: community.description || "",
      allowUsersToChat: community.allowUsersToChat ?? true,
      allowTestCreation: community.allowTestCreation ?? false,
    });

    fetchMembers();
  }, [community]);

  const fetchMembers = async () => {
    if (!community) return;
    try {
      setMembersLoading(true);
      const membersList = await communityApi.getMembers(community._id);
      setMembers(Array.isArray(membersList) ? membersList : []);
    } catch {
      toast.error("Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  };

  const handleSave = async () => {
    if (!community) return;
    setLoading(true);
    try {
      await communityApi.updateSettings(community._id, form);
      toast.success("Settings saved");
      await refreshCommunity();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!community || !isOwner) return;
    try {
      await communityApi.deleteCommunity(community._id);
      toast.success("Community deleted");
      router.push("/communities");
    } catch {
      toast.error("Failed to delete community");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!community) return;
    try {
      await communityApi.removeMember(community._id, userId);
      toast.success("Member removed");
      fetchMembers();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleMuteToggle = async (userId: string, currentMuted: boolean) => {
    if (!community) return;
    try {
      await communityApi.muteMember(community._id, userId, !currentMuted);
      toast.success(currentMuted ? "Member unmuted" : "Member muted");
      fetchMembers();
    } catch {
      toast.error("Failed to update member");
    }
  };

  const handleRoleUpdate = async (
    userId: string,
    targetRole: "member" | "subadmin" | "admin",
    successMessage: string
  ) => {
    if (!community) return;
    try {
      await communityApi.updateMemberRole(community._id, userId, targetRole);
      toast.success(successMessage);
      fetchMembers();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to update role");
    }
  };

  const handleTransferOwnership = async (newOwnerId: string) => {
    if (!community || !isOwner) return;
    try {
      await communityApi.transferOwnership(community._id, newOwnerId);
      toast.success("Ownership transferred");
      await refreshCommunity();
      fetchMembers();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to transfer ownership");
    }
  };

  const getDialogCopy = () => {
    if (!memberActionDialog) return null;

    if (memberActionDialog.type === "remove") {
      return {
        title: "Remove Member",
        description: `Remove ${memberActionDialog.memberName} from this community? This action can be reversed only if they join again.`,
        actionLabel: "Remove",
        actionClassName: "bg-red-500 hover:bg-red-600 text-white border-0",
      };
    }

    if (memberActionDialog.type === "transfer") {
      return {
        title: "Transfer Ownership",
        description: `Transfer ownership to ${memberActionDialog.memberName}? You will become a regular member.`,
        actionLabel: "Transfer",
        actionClassName: "bg-amber-500 hover:bg-amber-600 text-[#111b21] border-0",
      };
    }

    const muting = !memberActionDialog.isMuted;
    return {
      title: muting ? "Mute Member" : "Unmute Member",
      description: muting
        ? `${memberActionDialog.memberName} will not be able to send chat messages.`
        : `${memberActionDialog.memberName} will be able to send chat messages again.`,
      actionLabel: muting ? "Mute" : "Unmute",
      actionClassName: "bg-[#00a884] hover:bg-[#029074] text-[#111b21] border-0",
    };
  };

  const handleConfirmMemberAction = async () => {
    if (!memberActionDialog || !community) return;

    setMemberActionLoading(true);
    try {
      if (memberActionDialog.type === "remove") {
        await handleRemoveMember(memberActionDialog.userId);
      } else if (memberActionDialog.type === "transfer") {
        await handleTransferOwnership(memberActionDialog.userId);
      } else {
        await handleMuteToggle(memberActionDialog.userId, !!memberActionDialog.isMuted);
      }

      setMemberActionDialog(null);
    } finally {
      setMemberActionLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col px-4 py-6 sm:px-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#e9edef]">{community?.name} Settings</h2>
        <p className="mt-1 text-[#8696a0]">Manage community details and members</p>
      </div>

      <div className="flex flex-col gap-6">
        {isAdmin && (
          <div className="rounded-2xl bg-[#111b21] p-5 shadow-sm border border-transparent hover:border-[#2a3942] transition-colors">
            <h3 className="text-lg font-semibold text-[#e9edef] mb-4">General Info</h3>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[#aebac1]">Community Name</Label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="rounded-lg border-none bg-[#202c33] text-[#d1d7db] h-10 focus-visible:ring-0"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#aebac1]">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="min-h-24 rounded-lg border-none bg-[#202c33] text-[#d1d7db] resize-none focus-visible:ring-0"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-[#e9edef] mt-8 mb-4">Permissions</h3>
            <div className="grid gap-4 lg:grid-cols-2">
              <ToggleCard
                label="Allow chat"
                description="If disabled, only admins can send messages."
                checked={form.allowUsersToChat}
                onCheckedChange={(value) =>
                  setForm((prev) => ({ ...prev, allowUsersToChat: value }))
                }
              />
              <ToggleCard
                label="Allow test creation"
                description="If enabled, members can create tests."
                checked={form.allowTestCreation}
                onCheckedChange={(value) =>
                  setForm((prev) => ({ ...prev, allowTestCreation: value }))
                }
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-[#00a884] text-[#111b21] font-semibold hover:bg-[#029074] rounded-full px-6 shadow-none border-0"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-[#111b21] shadow-sm border border-transparent flex flex-col min-h-[300px]">
          <div className="border-b border-[#202c33] px-5 py-4 shrink-0">
            <h3 className="text-lg font-semibold text-[#e9edef]">Members</h3>
            <p className="mt-1 text-xs text-[#8696a0]">
              Mute blocks only chat messages. Owners can promote, demote, and transfer ownership here.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {membersLoading ? (
              <div className="flex h-full items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-[#00a884]" />
              </div>
            ) : members.length === 0 ? (
              <div className="py-16 text-center text-sm text-[#8696a0]">
                No members found.
              </div>
            ) : (
              <div className="divide-y divide-[#202c33]">
                {members.map((member) => {
                  const userData = member.userId as any;
                  const isUserOwner = member.role === "owner";
                  const isUserAdmin = member.role === "admin";
                  const isUserSubadmin = member.role === "subadmin";
                  const isMe = userData?._id === user?.id;
                  const canRoleManage = isOwner && !isUserOwner && !isMe;
                  const canModerate = isOwner
                    ? !isUserOwner && !isMe
                    : userRole === "admin"
                      ? !isUserOwner && member.role !== "admin" && !isMe
                      : false;
                  const canManage = canRoleManage || canModerate;

                  return (
                    <div
                      key={member._id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-[#202c33]/30 transition-colors"
                    >
                      <Link href={`/profile/${userData?._id || ""}`} className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm",
                              isUserOwner
                                ? "bg-amber-500/10 text-amber-500"
                                : isUserAdmin
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : isUserSubadmin
                                    ? "bg-sky-500/10 text-sky-400"
                                  : "bg-[#202c33] text-[#aebac1]"
                            )}
                          >
                            {(userData?.displayName?.[0] || userData?.email?.[0] || "?").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <p className="truncate text-[15px] font-medium text-[#e9edef]">
                                  {userData?.displayName || "Unknown"}
                                </p>
                                {isUserOwner && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                                {isUserAdmin && <Shield className="h-3.5 w-3.5 text-emerald-500" />}
                                {isUserSubadmin && <Shield className="h-3.5 w-3.5 text-sky-400" />}
                                {member.isMuted && <MicOff className="h-3.5 w-3.5 text-red-500" />}
                              </div>
                              <p className="text-[13px] text-[#8696a0] capitalize">{member.role}</p>
                            </div>
                          </div>
                        </div>
                      </Link>

                      {canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-[#8696a0] hover:bg-[#202c33] hover:text-[#d1d7db]"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 border-[#2a3942] bg-[#111b21] text-[#d1d7db]">
                            <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-[#2a3942]" />

                            {canRoleManage && member.role === "member" && (
                              <DropdownMenuItem
                                onClick={() => handleRoleUpdate(userData._id, "subadmin", "Member promoted to subadmin")}
                                className="cursor-pointer focus:bg-sky-500/10 focus:text-sky-300"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Promote to Subadmin
                              </DropdownMenuItem>
                            )}

                            {canRoleManage && member.role === "subadmin" && (
                              <DropdownMenuItem
                                onClick={() => handleRoleUpdate(userData._id, "admin", "Subadmin promoted to admin")}
                                className="cursor-pointer focus:bg-indigo-500/10 focus:text-indigo-300"
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Promote to Admin
                              </DropdownMenuItem>
                            )}

                            {canRoleManage && (member.role === "admin" || member.role === "subadmin") && (
                              <DropdownMenuItem
                                onClick={() => handleRoleUpdate(userData._id, "member", "Role changed to member")}
                                className="cursor-pointer focus:bg-orange-500/10 focus:text-orange-300"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Demote to Member
                              </DropdownMenuItem>
                            )}

                            {canRoleManage && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setMemberActionDialog({
                                    type: "transfer",
                                    userId: userData._id,
                                    memberName: userData?.displayName || "this member",
                                  })
                                }
                                className="cursor-pointer focus:bg-amber-500/10 focus:text-amber-300"
                              >
                                <ArrowRightLeft className="mr-2 h-4 w-4" />
                                Handover Ownership
                              </DropdownMenuItem>
                            )}

                            {canModerate && <DropdownMenuSeparator className="bg-[#2a3942]" />}

                            {canModerate && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setMemberActionDialog({
                                    type: "mute",
                                    userId: userData._id,
                                    memberName: userData?.displayName || "this member",
                                    isMuted: !!member.isMuted,
                                  })
                                }
                                className="cursor-pointer focus:bg-[#202c33]"
                              >
                                {member.isMuted ? (
                                  <Mic className="mr-2 h-4 w-4" />
                                ) : (
                                  <MicOff className="mr-2 h-4 w-4" />
                                )}
                                {member.isMuted ? "Unmute" : "Mute"}
                              </DropdownMenuItem>
                            )}

                            {canModerate && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setMemberActionDialog({
                                    type: "remove",
                                    userId: userData._id,
                                    memberName: userData?.displayName || "this member",
                                  })
                                }
                                className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Remove Member
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
                <p className="text-sm text-[#8696a0]">
                  Deleting the community removes the group and its test records.
                </p>
              </div>

              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold rounded-full px-6 shadow-none border-0">
                    Delete Community
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-[#2a3942] bg-[#233138] text-[#e9edef]">
                  <DialogHeader>
                    <DialogTitle>Delete Community?</DialogTitle>
                    <DialogDescription className="text-[#8696a0]">
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="hover:bg-[#111b21] text-[#aebac1]">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600 border-0 shadow-none text-white"
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!memberActionDialog} onOpenChange={(open) => !open && setMemberActionDialog(null)}>
        <AlertDialogContent className="border-[#2a3942] bg-[#233138] text-[#e9edef]">
          <AlertDialogHeader>
            <AlertDialogTitle>{getDialogCopy()?.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8696a0]">
              {getDialogCopy()?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2a3942] bg-transparent text-[#aebac1] hover:bg-[#111b21] hover:text-[#d1d7db]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmMemberAction}
              disabled={memberActionLoading}
              className={getDialogCopy()?.actionClassName}
            >
              {memberActionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {getDialogCopy()?.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ToggleCard({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[#202c33] bg-[#0b141a]/50 p-4 hover:border-[#2a3942] transition-colors">
      <div>
        <p className="text-[15px] font-medium text-[#e9edef]">{label}</p>
        <p className="text-xs text-[#8696a0] mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="data-[state=checked]:bg-[#00a884]" />
    </div>
  );
}
