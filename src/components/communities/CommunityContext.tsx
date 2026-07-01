"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { communityApi, Community } from "@/lib/api-modules";
import type { CommunityRole } from "@/lib/api-modules/community.api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CommunityShellSkeleton } from "@/components/skeletons/site-skeletons";

export interface Group {
  _id: string;
  communityId: string;
  name: string;
  description?: string;
  type: "text" | "announcement";
  createdBy: string;
  isDefault: boolean;
  memberCount: number;
  settings: {
    requireApproval: boolean;
    allowChat: boolean;
  };
  createdAt: string;
  updatedAt: string;
  isMember: boolean;
  role: string | null;
  isMuted: boolean;
  pendingApproval?: boolean;
}

interface CommunityContextType {
  community: Community | null;
  isMember: boolean;
  userRole: CommunityRole | null;
  loading: boolean;
  refreshCommunity: () => Promise<void>;
  groups: Group[];
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;
  notifications: Record<string, number>;
  refreshGroups: () => Promise<void>;
  activeGroup: Group | null;
  isGroupMember: boolean;
  groupUserRole: string | null;
}

const CommunityContext = createContext<CommunityContextType>({
  community: null,
  isMember: false,
  userRole: null,
  loading: true,
  refreshCommunity: async () => {},
  groups: [],
  activeGroupId: null,
  setActiveGroupId: () => {},
  notifications: {},
  refreshGroups: async () => {},
  activeGroup: null,
  isGroupMember: false,
  groupUserRole: null,
});

export const useCommunity = () => useContext(CommunityContext);

export function CommunityProvider({ children, communityId }: { children: ReactNode; communityId: string | null }) {
  const { initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<CommunityRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupIdState] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Record<string, number>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlGroupId = searchParams?.get("groupId") || null;

  const setActiveGroupId = (id: string | null) => {
    setActiveGroupIdState(id);
    if (typeof window !== "undefined" && searchParams) {
      const params = new URLSearchParams(searchParams.toString());
      if (id) {
        params.set("groupId", id);
      } else {
        params.delete("groupId");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const fetchGroupsData = async (commId: string, currentActiveId: string | null) => {
    try {
      const groupsList = await communityApi.getGroups(commId);
      setGroups(groupsList);

      // Auto-set active group ID
      if (groupsList.length > 0) {
        const targetId = urlGroupId && groupsList.some((g) => g._id === urlGroupId)
          ? urlGroupId
          : (currentActiveId && groupsList.some((g) => g._id === currentActiveId)
              ? currentActiveId
              : null);

        if (targetId) {
          setActiveGroupIdState(targetId);
        } else {
          const announcementGroup = groupsList.find((g) => g.type === "announcement");
          const defaultGroup = groupsList.find((g) => g.isDefault);
          setActiveGroupIdState(
            announcementGroup
              ? announcementGroup._id
              : (defaultGroup ? defaultGroup._id : groupsList[0]._id)
          );
        }
      } else {
        setActiveGroupIdState(null);
      }

      // Fetch pending request notifications
      try {
        const notifs = await communityApi.getGroupNotifications(commId);
        setNotifications(notifs);
      } catch (err) {
        console.error("Failed to fetch group notifications:", err);
      }
    } catch (error) {
      console.error("Failed to load groups list:", error);
      toast.error("Failed to load groups");
    }
  };

  const fetchCommunityData = async () => {
    if (!communityId) return;
    try {
      setLoading(true);
      const data = await communityApi.getCommunityById(communityId);
      setCommunity(data.community);
      setIsMember(data.isMember);
      setUserRole(data.userRole || null);

      if (data.isMember) {
        await fetchGroupsData(communityId, activeGroupId);
      }
    } catch (error) {
      toast.error("Failed to load community details");
      router.push("/communities");
    } finally {
      setLoading(false);
    }
  };

  const refreshGroupsOnly = async () => {
    if (!communityId || !isMember) return;
    await fetchGroupsData(communityId, activeGroupId);
  };

  // Sync state if url changes
  useEffect(() => {
    if (urlGroupId && urlGroupId !== activeGroupId && groups.some((g) => g._id === urlGroupId)) {
      setActiveGroupIdState(urlGroupId);
    }
  }, [urlGroupId, groups, activeGroupId]);

  useEffect(() => {
    if (!initialized || authLoading) return;
    if (!communityId) {
      setCommunity(null);
      setGroups([]);
      setIsMember(false);
      setUserRole(null);
      setLoading(false);
      return;
    }
    fetchCommunityData();
  }, [initialized, authLoading, communityId, router]);

  const activeGroup = useMemo(() => {
    if (!activeGroupId) return null;
    return groups.find((g) => g._id === activeGroupId) || null;
  }, [groups, activeGroupId]);

  const isGroupMember = useMemo(() => {
    return activeGroup?.isMember ?? false;
  }, [activeGroup]);

  const groupUserRole = useMemo(() => {
    return activeGroup?.role ?? null;
  }, [activeGroup]);

  return (
    <CommunityContext.Provider
      value={{
        community,
        isMember,
        userRole,
        loading,
        refreshCommunity: fetchCommunityData,
        groups,
        activeGroupId,
        setActiveGroupId,
        notifications,
        refreshGroups: refreshGroupsOnly,
        activeGroup,
        isGroupMember,
        groupUserRole,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}
