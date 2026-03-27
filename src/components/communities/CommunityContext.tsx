"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { communityApi, Community } from "@/lib/api-modules";
import type { CommunityRole } from "@/lib/api-modules/community.api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CommunityContextType {
  community: Community | null;
  isMember: boolean;
  userRole: CommunityRole | null;
  loading: boolean;
  refreshCommunity: () => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType>({
  community: null,
  isMember: false,
  userRole: null,
  loading: true,
  refreshCommunity: async () => {},
});

export const useCommunity = () => useContext(CommunityContext);

export function CommunityProvider({ children, communityId }: { children: ReactNode; communityId: string }) {
  const { initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [community, setCommunity] = useState<Community | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<CommunityRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const data = await communityApi.getCommunityById(communityId);
      setCommunity(data.community);
      setIsMember(data.isMember);
      setUserRole(data.userRole || null);
    } catch (error) {
      toast.error("Failed to load community details");
      router.push("/communities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized || authLoading || !communityId) return;
    if (isAuthenticated) {
      fetchCommunityData();
    } else {
      router.push("/login");
    }
  }, [initialized, authLoading, isAuthenticated, communityId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
        <p className="text-zinc-500 animate-pulse">Loading Classroom...</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="p-8 text-center text-zinc-400">Community not found.</div>
    );
  }

  return (
    <CommunityContext.Provider value={{ community, isMember, userRole, loading, refreshCommunity: fetchCommunityData }}>
      {children}
    </CommunityContext.Provider>
  );
}
