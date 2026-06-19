"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, Compass, Zap, ArrowRight, Search, Inbox } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BookmarkedRoadmap {
  title: string;
  slug: string;
  isAvailable: boolean;
}

interface BookmarkedJob {
  slug: string;
  title: string;
  summary: string;
  averageSalary: number;
  demand: string;
  growth: number;
  entry: string;
}

export default function BookmarksPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'roadmaps' | 'jobs'>('roadmaps');
  const [search, setSearch] = useState('');

  // Bookmarked items state
  const [roadmaps, setRoadmaps] = useState<BookmarkedRoadmap[]>([]);
  const [jobs, setJobs] = useState<BookmarkedJob[]>([]);

  // Load from localStorage on client-only mount
  useEffect(() => {
    setMounted(true);
    
    // Load roadmaps
    const roadmapsRaw = localStorage.getItem("swadhyaayi-bookmarked-roadmaps");
    if (roadmapsRaw) {
      try {
        const parsed = JSON.parse(roadmapsRaw);
        if (Array.isArray(parsed)) {
          setRoadmaps(parsed);
        }
      } catch (err) {
        console.error("Error parsing roadmaps bookmarks", err);
      }
    }

    // Load jobs
    const jobsRaw = localStorage.getItem("swadhyaayi-bookmarked-jobs");
    if (jobsRaw) {
      try {
        const parsed = JSON.parse(jobsRaw);
        if (Array.isArray(parsed)) {
          setJobs(parsed);
        }
      } catch (err) {
        console.error("Error parsing jobs bookmarks", err);
      }
    }
  }, []);

  // Remove Roadmap Bookmark
  const handleRemoveRoadmap = (event: React.MouseEvent, slug: string, title: string) => {
    event.stopPropagation();
    const updated = roadmaps.filter(item => item.slug !== slug);
    setRoadmaps(updated);
    localStorage.setItem("swadhyaayi-bookmarked-roadmaps", JSON.stringify(updated));
    toast.info(`Removed bookmark for "${title}" roadmap.`);
  };

  // Remove Job Bookmark
  const handleRemoveJob = (event: React.MouseEvent, slug: string, title: string) => {
    event.preventDefault();
    event.stopPropagation();
    const updated = jobs.filter(item => item.slug !== slug);
    setJobs(updated);
    localStorage.setItem("swadhyaayi-bookmarked-jobs", JSON.stringify(updated));
    toast.info(`Removed bookmark for "${title}" role.`);
  };

  // Click handler for Roadmap Card
  const handleRoadmapClick = (item: BookmarkedRoadmap) => {
    if (item.isAvailable) {
      router.push(`/roadmap/${item.slug}`);
    } else {
      toast.info(`"${item.title}" roadmap is coming soon!`);
    }
  };

  // Filters for Search
  const filteredRoadmaps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roadmaps;
    return roadmaps.filter(item => item.title.toLowerCase().includes(q));
  }, [roadmaps, search]);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.summary.toLowerCase().includes(q) || 
      item.slug.toLowerCase().includes(q)
    );
  }, [jobs, search]);

  // Prevent flash or hydration error
  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center bg-[#020617]">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <Bookmark className="h-8 w-8 text-zinc-700 animate-spin" />
          <span className="text-xs text-zinc-500 uppercase tracking-widest font-black">Loading Bookmarks...</span>
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
              <Bookmark className="text-emerald-400" size={26} />
              Bookmarked Items
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm max-w-xl font-medium">
              View and manage your saved tech learning roadmaps and opportunity profiles.
            </p>
          </div>
          <div className="relative w-full md:w-72 group shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search bookmarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900/50 border-zinc-800/80 text-zinc-200 pl-10 h-10 text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500/30 placeholder:text-zinc-600 w-full"
            />
          </div>
        </div>

        {/* Tab Controls & Counters */}
        <div className="flex items-center gap-3 bg-zinc-900/30 p-1 rounded-xl border border-zinc-800/40 w-fit shrink-0">
          <button
            onClick={() => setActiveTab('roadmaps')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'roadmaps'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-300 bg-transparent'
            }`}
          >
            Roadmaps
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              activeTab === 'roadmaps'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              {roadmaps.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'jobs'
                ? 'bg-zinc-800 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-300 bg-transparent'
            }`}
          >
            Opportunities
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              activeTab === 'jobs'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              {jobs.length}
            </span>
          </button>
        </div>

        {/* Dynamic Display Panel */}
        <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-1">
          {activeTab === 'roadmaps' ? (
            <div>
              {filteredRoadmaps.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 md:p-16 border border-zinc-800/60 bg-zinc-950/20 rounded-3xl text-center space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-md">
                    <Compass size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">No roadmaps bookmarked</h3>
                    <p className="text-xs text-zinc-500 max-w-sm">
                      {search.trim() ? "No roadmaps match your search query." : "Save roadmaps from the explorer to see them listed here."}
                    </p>
                  </div>
                  {!search.trim() && (
                    <Button
                      onClick={() => router.push('/roadmap')}
                      className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold px-4 h-9 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10 hover:scale-[1.02] transition-all"
                    >
                      Explore Roadmaps <ArrowRight size={14} />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRoadmaps.map((item) => (
                    <div
                      key={item.slug}
                      onClick={() => handleRoadmapClick(item)}
                      className="group flex items-center justify-between h-14 px-5 rounded-[12px] border transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/80 hover:border-emerald-500/30"
                    >
                      <span className="font-semibold text-sm text-zinc-300 group-hover:text-white transition-colors truncate pr-4">
                        {item.title}
                      </span>
                      <button
                        onClick={(e) => handleRemoveRoadmap(e, item.slug, item.title)}
                        type="button"
                        className="text-emerald-400 hover:text-red-400 p-1.5 rounded-md transition-colors shrink-0"
                      >
                        <Bookmark
                          size={15}
                          className="fill-emerald-400 text-emerald-400 hover:fill-transparent hover:text-red-400 transition-colors"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {filteredJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 md:p-16 border border-zinc-800/60 bg-zinc-950/20 rounded-3xl text-center space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-md">
                    <Zap size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">No opportunities bookmarked</h3>
                    <p className="text-xs text-zinc-500 max-w-sm">
                      {search.trim() ? "No roles match your search query." : "Bookmark positions in the opportunities tab to view metrics here."}
                    </p>
                  </div>
                  {!search.trim() && (
                    <Button
                      onClick={() => router.push('/tech-opportunities')}
                      className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold px-4 h-9 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10 hover:scale-[1.02] transition-all"
                    >
                      Browse Opportunities <ArrowRight size={14} />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((tech) => (
                    <Link href={`/tech-opportunities/${tech.slug}`} key={tech.slug} className="block w-full outline-none">
                      <div className="group relative bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-900/80 hover:border-emerald-500/30 backdrop-blur-md rounded-2xl p-5 md:p-6 transition-all duration-300 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full cursor-pointer">
                        
                        {/* Color glow effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 group-hover:bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none transition-all duration-500" />
                        
                        {/* Left: Role details */}
                        <div className="space-y-2 flex-1 relative z-10">
                          <div className="flex items-center gap-3">
                            <h2 className="text-lg font-black text-white tracking-tight leading-snug group-hover:text-emerald-400 transition-colors">
                              {tech.title}
                            </h2>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-900/80 border border-zinc-800/80 text-zinc-400 text-[9px] font-bold uppercase tracking-wider">
                              {tech.slug}
                            </span>
                            <button
                              onClick={(e) => handleRemoveJob(e, tech.slug, tech.title)}
                              type="button"
                              className="text-emerald-400 hover:text-red-400 p-1.5 rounded-md transition-colors shrink-0 ml-1 relative z-20"
                            >
                              <Bookmark
                                size={15}
                                className="fill-emerald-400 text-emerald-400 hover:fill-transparent hover:text-red-400 transition-colors"
                              />
                            </button>
                          </div>
                          <p className="text-zinc-400 text-xs leading-relaxed max-w-2xl">
                            {tech.summary}
                          </p>
                        </div>

                        {/* Right: Metrics */}
                        <div className="flex flex-wrap gap-x-8 gap-y-4 items-center shrink-0 w-full md:w-auto relative z-10 md:border-l md:border-zinc-800/40 md:pl-8">
                          <div className="flex flex-col items-start min-w-[90px] shrink-0">
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1.5">Avg Salary</span>
                            <span className="text-white text-xs font-bold font-mono">₹{tech.averageSalary} LPA</span>
                          </div>

                          <div className="flex flex-col items-start min-w-[80px] shrink-0">
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1.5">Demand</span>
                            <span className="text-emerald-400 text-xs font-bold">{tech.demand}</span>
                          </div>

                          <div className="flex flex-col items-start min-w-[80px] shrink-0">
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1.5">Growth</span>
                            <span className="text-sky-400 text-xs font-bold">+{tech.growth}%</span>
                          </div>

                          <div className="flex flex-col items-start min-w-[80px] shrink-0">
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1.5">Entry Level</span>
                            <span className="text-zinc-300 text-xs font-bold">{tech.entry}</span>
                          </div>

                          <div className="text-zinc-650 group-hover:text-emerald-400 transition-colors ml-auto md:ml-2">
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>

                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
