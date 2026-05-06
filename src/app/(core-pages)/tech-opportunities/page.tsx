"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { techDetails } from '../../../../data/techDetails';

const opportunities = Object.entries(techDetails).map(([slug, tech]) => ({
  slug,
  title: tech.title,
  summary: tech.summary,
  demand: tech.demand,
  averageSalary: tech.history[tech.history.length - 1]?.averageSalary ?? 0,
  entry: tech.entry,
  description: tech.description,
}));

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
    <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="font-sans pb-20 max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-3 shrink-0 mb-1 bg-zinc-900/40 rounded-3xl p-4 md:p-5 border border-zinc-800/50 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight flex items-center gap-3">
                <Zap className="text-emerald-400" size={28} />
                Tech Opportunities
              </h1>
              <p className="text-zinc-400 text-[13px] md:text-sm max-w-md font-medium">
                Explore available tech roles and open the full deep-dive page for each roadmap-ready opportunity.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl shadow-inner w-full md:w-auto">
              <div className="relative flex-1 group min-w-60">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  placeholder="Search roles..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="bg-transparent border-0 text-zinc-100 pl-11 h-10 text-sm focus-visible:ring-0 shadow-none placeholder:text-zinc-600 w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border border-zinc-800/60 bg-zinc-950/30 rounded-[1.75rem] overflow-hidden">

          {filteredOpportunities.length === 0 ? (
            <div className="px-4 py-16 text-center text-zinc-500 uppercase tracking-[0.25em] text-xs">
              No roles found in the current data file.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-zinc-950/80 text-zinc-500 uppercase tracking-[0.22em] text-[10px]">
                  <tr>
                    <th className="px-4 py-3 font-bold">Role</th>
                    <th className="px-4 py-3 font-bold">Avg Salary</th>
                    <th className="px-4 py-3 font-bold">Demand</th>
                    <th className="px-4 py-3 font-bold">Entry</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOpportunities.map((tech) => (
                    <tr key={tech.slug} className="border-t border-zinc-800/60 text-zinc-200 align-top hover:bg-zinc-900/30 transition-colors">
                      <td className="px-4 py-3 min-w-70">
                        <Link
                          href={`/tech-opportunities/${tech.slug}`}
                          className="block group"
                        >
                          <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">{tech.title}</div>
                          <div className="text-xs uppercase tracking-[0.22em] text-zinc-500 mt-1">{tech.slug}</div>
                          <p className="text-sm text-zinc-400 leading-relaxed mt-2 max-w-lg">{tech.summary}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white font-semibold">₹{tech.averageSalary} LPA</td>
                      <td className="px-4 py-3 text-emerald-400 font-semibold whitespace-nowrap">{tech.demand}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-300">{tech.entry}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
