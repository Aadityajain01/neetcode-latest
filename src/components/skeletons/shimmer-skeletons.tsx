'use client';

import React from 'react';

/* ── Base Shimmer Primitive ──────────────────────────────────────── */
function Bone({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`skeleton-bone rounded-lg ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/* ── Dashboard ───────────────────────────────────────────────────── */
export function DashboardPageSkeleton() {
  return (
    <div className="h-auto lg:h-full max-w-7xl mx-auto p-3 sm:p-4 md:p-5 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-3 shrink-0">
        <div className="space-y-2">
          <Bone className="h-5 w-28 rounded-full" />
          <Bone className="h-8 w-72" />
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
          <Bone className="h-7 w-7 rounded-lg" />
          <div className="space-y-1"><Bone className="h-2 w-16" /><Bone className="h-4 w-20" /></div>
        </div>
      </div>
      {/* Body */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 xl:gap-4 min-h-0">
        {/* Left Column */}
        <div className="flex flex-col gap-3 w-full lg:w-[320px] xl:w-[340px] shrink-0 min-h-0">
          {/* 2x2 Stats */}
          <div className="grid grid-cols-2 gap-2.5 shrink-0">
            {[0,1,2,3].map(i => (
              <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-3 flex items-center gap-2.5">
                <Bone className="h-8 w-8 rounded-lg shrink-0" />
                <div className="space-y-1 flex-1"><Bone className="h-2.5 w-12" /><Bone className="h-5 w-10" /></div>
              </div>
            ))}
          </div>
          {/* Quick Navigation */}
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
          {/* 3 Chart Cards */}
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
          {/* Mastery Bar */}
          <div className="shrink-0 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 xl:p-5">
            <div className="flex items-end justify-between mb-3">
              <div className="space-y-1.5">
                <Bone className="h-4 w-28 rounded-full" />
                <Bone className="h-5 w-48" />
                <Bone className="h-2.5 w-64" />
              </div>
              <Bone className="h-9 w-16" />
            </div>
            <Bone className="h-3 w-full rounded-full mb-1.5" />
            <div className="flex justify-between"><Bone className="h-2.5 w-20" /><Bone className="h-2.5 w-40" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Problems ────────────────────────────────────────────────────── */
export function ProblemsPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3 animate-in fade-in duration-300 h-full">
      {/* Header Card */}
      <div className="bg-zinc-900/40 rounded-3xl p-4 md:p-5 border border-zinc-800/50 space-y-3 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2">
            <Bone className="h-5 w-32 rounded-full" />
            <Bone className="h-8 w-48" />
            <Bone className="h-4 w-72" />
          </div>
          <div className="flex gap-2 p-1.5 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl">
            <Bone className="h-10 w-48 rounded-xl" />
            <Bone className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="flex-1 bg-zinc-900/30 border border-zinc-800/60 rounded-[2rem] overflow-hidden flex flex-col">
        <div className="px-8 py-3 bg-zinc-950/80 border-b border-zinc-800/60 shrink-0">
          <div className="flex justify-between"><Bone className="h-3 w-36" /><Bone className="h-3 w-28" /></div>
        </div>
        <div className="flex-1 divide-y divide-zinc-800/40">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 md:px-8 md:py-3.5 gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Bone className="h-10 w-10 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Bone className="h-4 w-[60%]" />
                  <div className="flex gap-1.5">
                    <Bone className="h-4 w-14 rounded-full" />
                    <Bone className="h-4 w-14 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Bone className="h-4 w-12" />
                <Bone className="h-9 w-9 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between p-3 md:px-8 border-t border-zinc-800/60 bg-zinc-950/90 shrink-0">
          <Bone className="h-3 w-40" />
          <div className="flex gap-1.5"><Bone className="h-8 w-8 rounded-[10px]" /><Bone className="h-8 w-14 rounded-[10px]" /><Bone className="h-8 w-8 rounded-[10px]" /></div>
        </div>
      </div>
    </div>
  );
}

/* ── Practice ────────────────────────────────────────────────────── */
export function PracticePageSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex flex-col items-center text-center gap-2 mb-2">
        <Bone className="h-8 w-48" />
        <Bone className="h-4 w-80" />
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-5xl mx-auto w-full">
        <Bone className="h-12 w-80 rounded-2xl" />
        <Bone className="h-10 w-96 rounded-xl" />
      </div>
      <div className="flex gap-2 flex-wrap justify-center max-w-5xl mx-auto">
        {[0,1,2,3,4].map(i => <Bone key={i} className="h-9 w-24 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-5xl mx-auto w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Bone className="h-10 w-10 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1"><Bone className="h-4 w-20" /><Bone className="h-3 w-16" /></div>
            </div>
            <div className="flex gap-2"><Bone className="h-8 w-16 rounded-lg" /><Bone className="h-8 w-16 rounded-lg" /><Bone className="h-8 w-16 rounded-lg" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Leaderboard ─────────────────────────────────────────────────── */
export function LeaderboardPageSkeleton() {
  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 w-full animate-in fade-in duration-300">
      {/* Podium (left) */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center w-full">
        <div className="text-center mb-4 space-y-1.5">
          <Bone className="h-3 w-24 mx-auto" />
          <Bone className="h-3 w-40 mx-auto" />
        </div>
        <div className="flex items-end justify-center gap-3 md:gap-4 w-full">
          {/* 2nd place */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-3 md:p-4 w-[130px] flex flex-col items-center gap-2">
            <Bone className="h-12 w-12 md:h-14 md:w-14 rounded-full" />
            <Bone className="h-3 w-16" />
            <div className="w-full px-3 py-1 rounded-xl bg-black/20 border border-white/5">
              <Bone className="h-5 w-10 mx-auto" /><Bone className="h-2 w-8 mx-auto mt-1" />
            </div>
          </div>
          {/* 1st place (taller) */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-4 md:p-5 w-[140px] flex flex-col items-center gap-2 -mt-4 z-10">
            <Bone className="h-14 w-14 md:h-[72px] md:w-[72px] rounded-full" />
            <Bone className="h-3 w-20" />
            <div className="w-full px-3 py-1 rounded-xl bg-black/20 border border-white/5">
              <Bone className="h-6 w-12 mx-auto" /><Bone className="h-2 w-8 mx-auto mt-1" />
            </div>
          </div>
          {/* 3rd place */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-3 md:p-4 w-[130px] flex flex-col items-center gap-2">
            <Bone className="h-12 w-12 md:h-14 md:w-14 rounded-full" />
            <Bone className="h-3 w-16" />
            <div className="w-full px-3 py-1 rounded-xl bg-black/20 border border-white/5">
              <Bone className="h-5 w-10 mx-auto" /><Bone className="h-2 w-8 mx-auto mt-1" />
            </div>
          </div>
        </div>
      </div>
      {/* Rankings (right) */}
      <div className="lg:col-span-7 flex flex-col min-h-0 w-full">
        <div className="flex items-center gap-4 w-full mb-3 shrink-0">
          <Bone className="h-2.5 w-20" />
          <div className="h-px flex-1 bg-zinc-800/80" />
        </div>
        <div className="flex-1 rounded-3xl overflow-hidden border border-zinc-800/60 bg-zinc-900/40 min-h-0 flex flex-col">
          <div className="divide-y divide-zinc-800/40 flex-1 min-h-0">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 px-4 md:px-5 py-2.5 items-center">
                <div className="col-span-2 md:col-span-1 flex justify-center">
                  <Bone className="h-7 w-7 rounded-full" />
                </div>
                <div className="col-span-7 md:col-span-8 flex items-center gap-3">
                  <Bone className="h-8 w-8 md:h-9 md:w-9 rounded-full shrink-0" />
                  <Bone className="h-4 w-28" />
                </div>
                <div className="col-span-3 md:col-span-3 flex items-center justify-end gap-1.5">
                  <Bone className="h-4 w-12" /><Bone className="h-3 w-6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Community Shell (table layout) ──────────────────────────────── */
export function CommunityShellSkeleton() {
  return (
    <div className="h-auto lg:h-full flex flex-col px-4 sm:px-6 md:px-8 py-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 shrink-0 mb-3">
        <div className="space-y-1.5">
          <Bone className="h-4 w-32 rounded-full" />
          <Bone className="h-7 w-36" />
          <Bone className="h-3 w-64" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-9 w-56 rounded-lg" />
          <Bone className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      {/* Table card */}
      <div className="flex-1 min-h-0 flex flex-col bg-zinc-900/40 border border-zinc-800/60 rounded-[1.5rem] overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-4 md:px-6 py-3 bg-zinc-950/80 border-b border-zinc-800/60 shrink-0">
          <div className="col-span-6"><Bone className="h-3 w-28" /></div>
          <div className="col-span-2 flex justify-center"><Bone className="h-3 w-12" /></div>
          <div className="col-span-2 flex justify-center"><Bone className="h-3 w-14" /></div>
          <div className="col-span-2 flex justify-end"><Bone className="h-3 w-12" /></div>
        </div>
        {/* Rows */}
        <div className="flex-1 min-h-0 divide-y divide-zinc-800/40">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 px-4 md:px-6 py-3 items-center">
              <div className="col-span-6 flex items-center gap-3">
                <Bone className="h-10 w-10 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Bone className="h-4 w-36" />
                  <Bone className="h-3 w-24" />
                </div>
              </div>
              <div className="col-span-2 flex justify-center"><Bone className="h-5 w-12 rounded" /></div>
              <div className="col-span-2 flex justify-center items-center gap-1.5">
                <Bone className="h-4 w-4 rounded" /><Bone className="h-4 w-6" />
              </div>
              <div className="col-span-2 flex justify-end"><Bone className="h-8 w-16 rounded-lg" /></div>
            </div>
          ))}
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 p-3 border-t border-zinc-800/60 bg-zinc-950/80 shrink-0">
          <Bone className="h-7 w-7 rounded" />
          <Bone className="h-7 w-7 rounded" />
          <Bone className="h-7 w-7 rounded" />
          <Bone className="h-7 w-7 rounded" />
        </div>
      </div>
    </div>
  );
}

/* ── Community Analytics ─────────────────────────────────────────── */
export function CommunityAnalyticsSkeleton() {
  return (
    <div className="px-4 py-4 flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center"><Bone className="h-7 w-40" /><Bone className="h-9 w-28 rounded-xl" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0,1,2,3].map(i => <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 space-y-2"><Bone className="h-3 w-20" /><Bone className="h-7 w-14" /></div>)}
      </div>
      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 space-y-3">
        <Bone className="h-4 w-32" /><Bone className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}

/* ── Community Tests ─────────────────────────────────────────────── */
export function CommunityTestsSkeleton() {
  return (
    <div className="px-4 py-4 flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center"><Bone className="h-7 w-36" /><Bone className="h-9 w-28 rounded-xl" /></div>
      <Bone className="h-10 w-64 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 space-y-3">
            <Bone className="h-20 w-full rounded-xl" /><Bone className="h-4 w-32" /><Bone className="h-3 w-48" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Admin Panel ─────────────────────────────────────────────────── */
export function AdminPanelSkeleton() {
  return (
    <div className="p-6 flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="space-y-2"><Bone className="h-8 w-48" /><Bone className="h-4 w-64" /></div>
      <Bone className="h-10 w-36 rounded-lg" />
      <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-6"><Bone className="h-10 w-full rounded-md" /></div>
      <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start justify-between p-4 bg-zinc-900/60 rounded-lg border border-zinc-700/40">
            <div className="space-y-2 flex-1"><div className="flex gap-2"><Bone className="h-5 w-40" /><Bone className="h-5 w-14 rounded-full" /></div><Bone className="h-3 w-[80%]" /><div className="flex gap-4"><Bone className="h-3 w-12" /><Bone className="h-3 w-16" /></div></div>
            <div className="flex gap-2 ml-4"><Bone className="h-8 w-14 rounded-md" /><Bone className="h-8 w-8 rounded-md" /><Bone className="h-8 w-8 rounded-md" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Profile ─────────────────────────────────────────────────────── */
export function ProfilePageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto pt-4 px-4 sm:px-6 flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Header: Avatar + Name + Edit */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-5">
          <Bone className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <Bone className="h-7 w-48" />
            <Bone className="h-4 w-28" />
            <Bone className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <Bone className="h-9 w-28 rounded-xl" />
      </div>
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-3">
            <Bone className="h-8 w-8 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Bone className="h-3 w-16" />
              <Bone className="h-5 w-10" />
            </div>
          </div>
        ))}
      </div>
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="md:col-span-4 space-y-6">
          {/* Bio Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 space-y-3">
            <Bone className="h-3 w-16" />
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-[80%]" />
            <div className="pt-4 border-t border-zinc-800/50 space-y-2 mt-3">
              <Bone className="h-3 w-32" />
              <Bone className="h-3 w-20" />
            </div>
          </div>
          {/* Communities Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-4 space-y-3">
            <Bone className="h-3 w-20" />
            {[0,1].map(i => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg">
                <Bone className="h-7 w-7 rounded-lg shrink-0" />
                <Bone className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
        {/* Right Column */}
        <div className="md:col-span-8 space-y-6">
          {/* Radar Chart Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 space-y-3">
            <Bone className="h-3 w-28" />
            <Bone className="h-48 w-full rounded-xl" />
          </div>
          {/* Activity Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 space-y-3">
            <Bone className="h-3 w-32" />
            {[0,1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Bone className="h-8 w-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1"><Bone className="h-3 w-[60%]" /><Bone className="h-2.5 w-20" /></div>
                <Bone className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Split View (Problem/Practice Detail) ────────────────────────── */
export function SplitViewSkeleton() {
  return (
    <div className="flex h-full animate-in fade-in duration-300">
      {/* Left - Description */}
      <div className="w-1/2 border-r border-zinc-800/60 p-6 space-y-4">
        <Bone className="h-7 w-[70%]" />
        <div className="flex gap-2"><Bone className="h-6 w-16 rounded-full" /><Bone className="h-6 w-20 rounded-full" /></div>
        <div className="space-y-2"><Bone className="h-3 w-full" /><Bone className="h-3 w-full" /><Bone className="h-3 w-[85%]" /><Bone className="h-3 w-[60%]" /></div>
        <Bone className="h-24 w-full rounded-xl" />
        <div className="space-y-2"><Bone className="h-3 w-full" /><Bone className="h-3 w-[90%]" /><Bone className="h-3 w-[70%]" /></div>
      </div>
      {/* Right - Code Editor */}
      <div className="w-1/2 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2"><Bone className="h-8 w-28 rounded-lg" /><Bone className="h-8 w-20 rounded-lg" /></div>
          <Bone className="h-8 w-20 rounded-lg" />
        </div>
        <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-4 flex-1 min-h-[300px] space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Bone className="h-3 w-6" style={{ opacity: 0.3 }} />
              <Bone className="h-3" style={{ width: `${30 + Math.random() * 50}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Auth Page ────────────────────────────────────────────────────── */
export function AuthPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center animate-in fade-in duration-300">
      <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-3xl p-8 w-full max-w-md space-y-6">
        <div className="text-center space-y-2"><Bone className="h-8 w-32 mx-auto" /><Bone className="h-4 w-56 mx-auto" /></div>
        <div className="space-y-4">
          <div className="space-y-2"><Bone className="h-3 w-12" /><Bone className="h-10 w-full rounded-lg" /></div>
          <div className="space-y-2"><Bone className="h-3 w-16" /><Bone className="h-10 w-full rounded-lg" /></div>
          <Bone className="h-11 w-full rounded-xl" />
        </div>
        <Bone className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}

/* ── App Route (generic fallback) ────────────────────────────────── */
export function AppRouteSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-4 animate-in fade-in duration-300">
      <Bone className="h-8 w-48" />
      <Bone className="h-4 w-80" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 space-y-3">
            <Bone className="h-5 w-32" /><Bone className="h-3 w-full" /><Bone className="h-3 w-[70%]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Re-exported aliases for backward compat ─────────────────────── */
export { AppRouteSkeleton as AppRouteSkeletonShell };
