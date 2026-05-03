'use client';

import React from 'react';

/* ── Base Shimmer Bone ─────────────────────────────────────────── */
function Bone({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton-bone rounded-lg ${className}`} style={style} aria-hidden="true" />;
}

/* ── Dashboard: Only the inner data area (stats + charts + mastery) */
export function DashboardContentSkeleton() {
  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-3 xl:gap-4 min-h-0 overflow-visible lg:overflow-hidden animate-in fade-in duration-300">
      {/* Left Column */}
      <div className="flex flex-col gap-3 w-full lg:w-[320px] xl:w-[340px] shrink-0 min-h-0">
        <div className="grid grid-cols-2 gap-2.5 shrink-0">
          {[0,1,2,3].map(i => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-3 2xl:p-4">
              <div className="flex justify-between items-start mb-1.5">
                <Bone className="h-2.5 w-12" />
                <Bone className="h-7 w-7 rounded-lg" />
              </div>
              <Bone className="h-6 w-14" />
            </div>
          ))}
        </div>
        <div className="flex-1 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-2.5 flex flex-col gap-1.5 min-h-0">
          <Bone className="h-2.5 w-28 mb-1 ml-1" />
          {[0,1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900/40">
              <Bone className="h-7 w-7 rounded-lg shrink-0" />
              <div className="space-y-1 flex-1"><Bone className="h-3 w-24" /><Bone className="h-2 w-16" /></div>
            </div>
          ))}
        </div>
      </div>
      {/* Right Column */}
      <div className="flex-1 flex flex-col gap-3 xl:gap-4 min-w-0 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 xl:gap-4 lg:flex-[3] min-h-0">
          {[0,1,2].map(i => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-3 xl:p-4 flex flex-col items-center gap-2">
              <div className="w-full flex items-center gap-1.5"><Bone className="h-3 w-3 rounded" /><Bone className="h-2.5 w-10" /></div>
              <Bone className="h-28 w-28 rounded-full" />
              <div className="w-full grid grid-cols-3 gap-1">
                {[0,1,2].map(j => <Bone key={j} className="h-8 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
        <div className="shrink-0 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 xl:p-5">
          <div className="flex items-end justify-between mb-3">
            <div className="space-y-1.5"><Bone className="h-4 w-28 rounded-full" /><Bone className="h-5 w-48" /><Bone className="h-2.5 w-64" /></div>
            <Bone className="h-9 w-16" />
          </div>
          <Bone className="h-3 w-full rounded-full mb-1.5" />
          <div className="flex justify-between"><Bone className="h-2.5 w-20" /><Bone className="h-2.5 w-40" /></div>
        </div>
      </div>
    </div>
  );
}

/* ── Problems: Only the table rows (header card shell stays) ───── */
export function ProblemsTableSkeleton() {
  return (
    <div className="flex-1 min-h-0 divide-y divide-zinc-800/40 animate-in fade-in duration-300">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 md:px-8 md:py-3.5 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Bone className="h-10 w-10 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Bone className="h-4 w-[60%]" />
              <div className="flex gap-1.5"><Bone className="h-4 w-14 rounded-full" /><Bone className="h-4 w-14 rounded-full" /></div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0"><Bone className="h-4 w-12" /><Bone className="h-9 w-9 rounded-xl" /></div>
        </div>
      ))}
    </div>
  );
}

/* ── Communities: Only the table rows ──────────────────────────── */
export function CommunityTableSkeleton() {
  return (
    <div className="flex-1 min-h-0 divide-y divide-zinc-800/40 animate-in fade-in duration-300">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 gap-3 px-4 md:px-6 py-3 items-center">
          <div className="col-span-6 flex items-center gap-3">
            <Bone className="h-10 w-10 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0"><Bone className="h-4 w-36" /><Bone className="h-3 w-24" /></div>
          </div>
          <div className="col-span-2 flex justify-center"><Bone className="h-5 w-12 rounded" /></div>
          <div className="col-span-2 flex justify-center items-center gap-1.5"><Bone className="h-4 w-4 rounded" /><Bone className="h-4 w-6" /></div>
          <div className="col-span-2 flex justify-end"><Bone className="h-8 w-16 rounded-lg" /></div>
        </div>
      ))}
    </div>
  );
}

/* ── Practice: Only the language table rows ────────────────────── */
export function PracticeTableSkeleton() {
  return (
    <div className="flex-1 min-h-0 divide-y divide-zinc-800/40 animate-in fade-in duration-300">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 md:px-6 gap-3">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <Bone className="h-10 w-10 rounded-xl shrink-0" />
            <Bone className="h-4 w-28" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Bone className="h-9 w-[130px] rounded-lg" />
            <Bone className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Leaderboard: Podium + list rows ──────────────────────────── */
export function LeaderboardContentSkeleton() {
  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 overflow-visible lg:overflow-hidden w-full animate-in fade-in duration-300">
      {/* Podium */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center w-full">
        <Bone className="h-3 w-24 mb-4 mx-auto" />
        <div className="flex items-end justify-center gap-3 w-full max-w-lg mx-auto">
          {[0,1,2].map(i => (
            <div key={i} className="flex-1 max-w-[150px] bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-4 flex flex-col items-center gap-2">
              <Bone className="h-14 w-14 rounded-full" />
              <Bone className="h-3 w-16" />
              <Bone className="h-8 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
      {/* List */}
      <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl overflow-hidden flex flex-col">
        <div className="px-5 py-3 bg-zinc-950/80 border-b border-zinc-800/60"><Bone className="h-3 w-20" /></div>
        <div className="flex-1 divide-y divide-zinc-800/40">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 px-4 md:px-5 py-2.5 items-center">
              <div className="col-span-2 md:col-span-1 flex justify-center"><Bone className="h-7 w-7 rounded-full" /></div>
              <div className="col-span-7 md:col-span-8 flex items-center gap-3">
                <Bone className="h-8 w-8 rounded-full shrink-0" />
                <Bone className="h-3.5 w-28" />
              </div>
              <div className="col-span-3 flex justify-end"><Bone className="h-3.5 w-12" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Profile: Only the data content (avatar, stats, bio, chart) ── */
export function ProfileContentSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-5">
          <Bone className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shrink-0" />
          <div className="space-y-2"><Bone className="h-7 w-48" /><Bone className="h-4 w-28" /><Bone className="h-5 w-24 rounded-full" /></div>
        </div>
        <Bone className="h-9 w-28 rounded-xl" />
      </div>
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-3">
            <Bone className="h-8 w-8 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1"><Bone className="h-3 w-16" /><Bone className="h-5 w-10" /></div>
          </div>
        ))}
      </div>
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 space-y-3">
            <Bone className="h-3 w-16" /><Bone className="h-3 w-full" /><Bone className="h-3 w-[80%]" />
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 space-y-3">
            <Bone className="h-3 w-20" />
            {[0,1].map(i => <div key={i} className="flex items-center gap-2 p-2 rounded-lg"><Bone className="h-7 w-7 rounded-lg shrink-0" /><Bone className="h-3 w-24" /></div>)}
          </div>
        </div>
        <div className="md:col-span-8 space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 space-y-3">
            <Bone className="h-3 w-28" /><Bone className="h-48 w-full rounded-xl" />
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 space-y-3">
            <Bone className="h-3 w-32" /><Bone className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
