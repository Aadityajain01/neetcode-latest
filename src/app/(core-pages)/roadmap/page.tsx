"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Compass, Bookmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { roadmapApi } from '@/lib/api-modules';

interface RoadmapCardItem {
  title: string;
  slug: string;
  isAvailable: boolean;
  icon?: string;
}

const roleRoadmapIds = [
  "frontend", "backend", "fullstack", "devops", "mobile", 
  "cybersecurity", "data-engineer", "game-dev", "embedded-iot", 
  "cloud-architect", "platform-engineer", "sre", "qa-engineer"
];

const skillRoadmapIds = [
  "ml-ai", "blockchain", "product-manager", 
  "devsecops", "technical-writer", "low-code-no-code", "ar-vr"
];


function RoadmapCard({ item }: { item: RoadmapCardItem }) {
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (typeof window === "undefined") return false;
    const bookmarkedRaw = localStorage.getItem("swadhyaayi-bookmarked-roadmaps");
    if (!bookmarkedRaw) return false;
    try {
      const parsed = JSON.parse(bookmarkedRaw);
      return Array.isArray(parsed) && parsed.some((b: any) => b.slug === item.slug);
    } catch {
      return false;
    }
  });
  const router = useRouter();

  const handleCardClick = () => {
    if (item.isAvailable) {
      router.push(`/roadmap/${item.slug}`);
    } else {
      toast.info(`"${item.title}" roadmap is coming soon! Bookmark to stay updated.`);
    }
  };

  const handleBookmarkClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    const bookmarkedRaw = localStorage.getItem("swadhyaayi-bookmarked-roadmaps");
    let bookmarked: any[] = [];
    if (bookmarkedRaw) {
      try {
        bookmarked = JSON.parse(bookmarkedRaw);
        if (!Array.isArray(bookmarked)) bookmarked = [];
      } catch {}
    }

    if (nextState) {
      if (!bookmarked.some(b => b.slug === item.slug)) {
        bookmarked.push({ title: item.title, slug: item.slug, isAvailable: item.isAvailable });
      }
      toast.success(`Bookmarked "${item.title}" roadmap!`);
    } else {
      bookmarked = bookmarked.filter(b => b.slug !== item.slug);
      toast.info(`Removed bookmark for "${item.title}".`);
    }
    localStorage.setItem("swadhyaayi-bookmarked-roadmaps", JSON.stringify(bookmarked));
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group flex items-center justify-between h-14 px-5 rounded-[12px] border transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/80 hover:border-brand-500/30`}
    >
      <div className="flex items-center gap-3 truncate pr-4">
        {item.icon && <span className="text-base shrink-0">{item.icon}</span>}
        <span className="font-semibold text-sm text-zinc-300 group-hover:text-white transition-colors truncate">
          {item.title}
        </span>
      </div>
      <button
        onClick={handleBookmarkClick}
        type="button"
        className="text-zinc-500 hover:text-brand-500 p-1.5 rounded-md transition-colors shrink-0"
      >
        <Bookmark
          size={15}
          className={isBookmarked ? "fill-brand-500 text-brand-500" : "text-zinc-600 group-hover:text-zinc-400"}
        />
      </button>
    </div>
  );
}

export default function RoadmapPage() {
  const [search, setSearch] = useState('');
  const [roadmapsList, setRoadmapsList] = useState<RoadmapCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roadmapApi.getRoadmaps()
      .then((data) => {
        setRoadmapsList(data.map((item) => ({
          title: item.title,
          slug: item.slug,
          isAvailable: true,
          icon: item.icon,
        })));
      })
      .catch((err) => {
        console.error("Failed to load roadmaps:", err);
        toast.error("Failed to load roadmaps from the server");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const roleRoadmaps = useMemo(() => {
    return roadmapsList.filter((item) => roleRoadmapIds.includes(item.slug));
  }, [roadmapsList]);

  const skillRoadmaps = useMemo(() => {
    return roadmapsList.filter((item) => skillRoadmapIds.includes(item.slug));
  }, [roadmapsList]);

  const filteredSkillRoadmaps = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return skillRoadmaps;
    return skillRoadmaps.filter((item) => item.title.toLowerCase().includes(query));
  }, [search, skillRoadmaps]);

  const filteredRoleRoadmaps = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return roleRoadmaps;
    return roleRoadmaps.filter((item) => item.title.toLowerCase().includes(query));
  }, [search, roleRoadmaps]);

  const totalFilteredCount = filteredSkillRoadmaps.length + filteredRoleRoadmaps.length;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Loading roadmaps...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 min-h-0 overflow-hidden font-sans text-zinc-100 max-w-7xl mx-auto w-full">
      <div className="flex-1 h-full flex flex-col gap-6 min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-zinc-800/40 shrink-0">
          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none flex items-center gap-2.5">
              <Compass className="text-brand-500" size={26} />
              Learning Roadmaps
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm max-w-xl font-medium">
              Explore structured learning paths for different technologies and specializations.
            </p>
          </div>
          <div className="relative w-full md:w-72 group shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-brand-500 transition-colors" />
            <Input
              placeholder="Search roadmaps..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-zinc-900/50 border-zinc-800/80 text-zinc-200 pl-10 h-10 text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-brand-500/30 placeholder:text-zinc-600 w-full"
            />
          </div>
        </div>

        {/* Scroll Container for Roadmaps lists */}
        <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-1 space-y-10">
          {totalFilteredCount === 0 ? (
            <div className="border border-zinc-800/60 bg-zinc-950/30 rounded-[1.75rem] px-4 py-16 text-center text-zinc-500 uppercase tracking-[0.25em] text-xs">
              No roadmaps found matching your search.
            </div>
          ) : (
            <div className="space-y-10 pb-10">
              
              {/* Skill-based Section */}
              {filteredSkillRoadmaps.length > 0 && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <span className="px-5 py-1.5 rounded-full border border-zinc-800/60 bg-zinc-950/70 text-zinc-400 text-xs font-bold tracking-wider uppercase">
                      Skill-based Roadmaps
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSkillRoadmaps.map((item) => (
                      <RoadmapCard key={item.title} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Role-based Section */}
              {filteredRoleRoadmaps.length > 0 && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <span className="px-5 py-1.5 rounded-full border border-zinc-800/60 bg-zinc-950/70 text-zinc-400 text-xs font-bold tracking-wider uppercase">
                      Role-based Roadmaps
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRoleRoadmaps.map((item) => (
                      <RoadmapCard key={item.title} item={item} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
