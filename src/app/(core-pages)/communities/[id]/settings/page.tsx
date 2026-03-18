"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCommunity } from "@/components/communities/CommunityContext";
import { communityApi } from "@/lib/api-modules";
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
import { toast } from "sonner";
import { Crown, Loader2, Mic, MicOff, Shield, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { community, userRole, refreshCommunity } = useCommunity();
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
      const response = await communityApi.getMembers(community._id);
      setMembers(Array.isArray(response.members) ? response.members : []);
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
    if (!confirm("Remove this member?")) return;
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

  return (
    <div className="mx-auto flex h-full w-full max-w-[1100px] flex-col px-3 py-3 sm:px-5 sm:py-5">
      <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-[24px] border border-zinc-800 bg-black p-4 sm:p-6">
        <div className="rounded-[20px] border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="text-xl font-semibold text-white">{community?.name}</h2>
          <p className="mt-1 text-sm text-zinc-500">Community settings and member management.</p>
        </div>

        {isAdmin && (
          <div className="rounded-[20px] border border-zinc-800 bg-zinc-950 p-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-zinc-300">Community Name</Label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="rounded-sm border-zinc-800 bg-black"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="min-h-24 rounded-sm border-zinc-800 bg-black"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
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

            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Settings
              </Button>
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 rounded-[20px] border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 px-4 py-4">
            <h3 className="text-lg font-semibold text-white">Members</h3>
          </div>

          <div className="min-h-0 overflow-y-auto">
            {membersLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            ) : members.length === 0 ? (
              <div className="py-16 text-center text-sm text-zinc-500">
                No members found.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {members.map((member) => {
                  const userData = member.userId as any;
                  const isUserOwner = member.role === "owner";
                  const isUserAdmin = member.role === "admin";
                  const canManage = isAdmin && !isUserOwner;

                  return (
                    <div
                      key={member._id}
                      className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <Link href={`/profile/${userData?._id || ""}`} className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-sm border text-sm font-semibold",
                              isUserOwner
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                : isUserAdmin
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : "border-zinc-700 bg-black text-zinc-300"
                            )}
                          >
                            {(userData?.displayName?.[0] || userData?.email?.[0] || "?").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-white">
                                {userData?.displayName || "Unknown"}
                              </p>
                              {isUserOwner && <Crown className="h-3.5 w-3.5 text-amber-300" />}
                              {isUserAdmin && <Shield className="h-3.5 w-3.5 text-emerald-300" />}
                              {member.isMuted && <MicOff className="h-3.5 w-3.5 text-red-300" />}
                            </div>
                            <p className="text-xs text-zinc-500">{member.role}</p>
                          </div>
                        </div>
                      </Link>

                      {canManage && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMuteToggle(userData._id, !!member.isMuted)}
                            className="rounded-sm border-zinc-700 bg-black text-white hover:bg-zinc-900"
                          >
                            {member.isMuted ? (
                              <Mic className="mr-2 h-4 w-4" />
                            ) : (
                              <MicOff className="mr-2 h-4 w-4" />
                            )}
                            {member.isMuted ? "Unmute" : "Mute"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(userData._id)}
                            className="rounded-sm border-red-500/30 bg-red-950/20 text-red-300 hover:bg-red-950/40"
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="rounded-[20px] border border-red-500/20 bg-red-950/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-300">Danger Zone</h3>
                <p className="text-sm text-zinc-500">
                  Deleting the community removes the group and its test records.
                </p>
              </div>

              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 text-white hover:bg-red-700">
                    Delete Community
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
                  <DialogHeader>
                    <DialogTitle>Delete Community?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
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
    <div className="flex items-center justify-between rounded-[16px] border border-zinc-800 bg-black p-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
