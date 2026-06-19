"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Zap, ArrowRight, Bookmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { techDetails } from '../../../../data/techDetails';

const opportunities = Object.entries(techDetails).map(([slug, tech]) => {
  const initialSalary = tech.history[0]?.averageSalary ?? 0;
  const latestSalary = tech.history[tech.history.length - 1]?.averageSalary ?? 0;
  const growth = initialSalary ? Math.round(((latestSalary - initialSalary) / initialSalary) * 100) : 0;

  return {
    slug,
    title: tech.title,
    summary: tech.summary,
    demand: tech.demand,
    averageSalary: latestSalary,
    growth,
    entry: tech.entry,
    description: tech.description,
  };
});

function TechOpportunityCard({ tech }: { tech: typeof opportunities[0] }) {
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (typeof window === "undefined") return false;
    const bookmarkedRaw = localStorage.getItem("swadhyaayi-bookmarked-jobs");
    if (!bookmarkedRaw) return false;
    try {
      const parsed = JSON.parse(bookmarkedRaw);
      return Array.isArray(parsed) && parsed.some((b: any) => b.slug === tech.slug);
    } catch {
      return false;
    }
  });

  const handleBookmarkClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    const bookmarkedRaw = localStorage.getItem("swadhyaayi-bookmarked-jobs");
    let bookmarked: any[] = [];
    if (bookmarkedRaw) {
      try {
        bookmarked = JSON.parse(bookmarkedRaw);
        if (!Array.isArray(bookmarked)) bookmarked = [];
      } catch {}
    }

    if (nextState) {
      if (!bookmarked.some(b => b.slug === tech.slug)) {
        bookmarked.push({
          slug: tech.slug,
          title: tech.title,
          summary: tech.summary,
          averageSalary: tech.averageSalary,
          demand: tech.demand,
          growth: tech.growth,
          entry: tech.entry
        });
      }
      toast.success(`Bookmarked "${tech.title}" role!`);
    } else {
      bookmarked = bookmarked.filter(b => b.slug !== tech.slug);
      toast.info(`Removed bookmark for "${tech.title}".`);
    }
    localStorage.setItem("swadhyaayi-bookmarked-jobs", JSON.stringify(bookmarked));
  };

  return (
    <Link href={`/tech-opportunities/${tech.slug}`} className="block w-full outline-none">
      <div className="group relative bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-900/80 hover:border-emerald-500/30 backdrop-blur-md rounded-2xl p-5 md:p-6 transition-all duration-300 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full cursor-pointer">
        
        {/* Subtle color glow in background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 group-hover:bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none transition-all duration-500" />
        
        {/* Left Side: Role details */}
        <div className="space-y-2 flex-1 relative z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-white tracking-tight leading-snug group-hover:text-emerald-400 transition-colors">
              {tech.title}
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-900/80 border border-zinc-800/80 text-zinc-400 text-[9px] font-bold uppercase tracking-wider">
              {tech.slug}
            </span>
            <button
              onClick={handleBookmarkClick}
              type="button"
              className="text-zinc-500 hover:text-emerald-400 p-1.5 rounded-md transition-colors shrink-0 ml-1 relative z-20"
            >
              <Bookmark
                size={15}
                className={isBookmarked ? "fill-emerald-400 text-emerald-400" : "text-zinc-650 group-hover:text-zinc-400"}
              />
            </button>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-2xl">
            {tech.summary}
          </p>
        </div>

        {/* Right Side: Horizontal metrics group */}
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

          {/* Arrow navigation indicator */}
          <div className="text-zinc-600 group-hover:text-emerald-400 transition-colors ml-auto md:ml-2">
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>

        </div>
      </div>
    </Link>
  );
}

export default function TechOpportunitiesPage() {
  const [search, setSearch] = useState('');

  const filteredOpportunities = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return opportunities;
    }

    return opportunities.filter((tech) => {
      return (
        tech.title.toLowerCase().includes(query) ||
        tech.slug.toLowerCase().includes(query) ||
        tech.summary.toLowerCase().includes(query)
      );
    });
  }, [search]);

  return (
    <div className="h-full flex flex-col p-4 md:p-6 min-h-0 overflow-hidden font-sans text-zinc-100 max-w-7xl mx-auto w-full">
      <div className="flex-1 h-full flex flex-col gap-6 min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-zinc-800/40 shrink-0">
          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none flex items-center gap-2.5">
              <Zap className="text-emerald-400" size={26} />
              Tech Opportunities
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm max-w-xl font-medium">
              Explore available tech roles and open the full deep-dive page for each roadmap-ready opportunity.
            </p>
          </div>
          <div className="relative w-full md:w-72 group shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-zinc-900/50 border-zinc-800/80 text-zinc-200 pl-10 h-10 text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500/30 placeholder:text-zinc-650 w-full"
            />
          </div>
        </div>

        {/* Opportunities List Container */}
        <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-1 space-y-4">
          {filteredOpportunities.length === 0 ? (
            <div className="border border-zinc-800/60 bg-zinc-950/30 rounded-[1.75rem] px-4 py-16 text-center text-zinc-500 uppercase tracking-[0.25em] text-xs">
              No roles found in the current data file.
            </div>
          ) : (
            filteredOpportunities.map((tech) => (
              <TechOpportunityCard tech={tech} key={tech.slug} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
