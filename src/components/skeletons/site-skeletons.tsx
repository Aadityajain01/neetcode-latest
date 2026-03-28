import { Skeleton } from "@/components/ui/skeleton";

// ─── Problems / Practice Page Skeleton ─────────────────────────────────────────
// Viewport-locked: fills parent height, no overflow
export function ProblemsPageSkeleton() {
  return (
    <div className="h-full overflow-hidden flex flex-col px-4 sm:px-6 md:px-8 py-4 bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40 bg-zinc-800/70 rounded-xl" />
          <Skeleton className="h-3.5 w-64 bg-zinc-800/40 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-44 bg-zinc-800/60 rounded-xl" />
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 mb-4 shrink-0">
        <Skeleton className="h-12 flex-1 bg-zinc-900/80 rounded-2xl border border-zinc-800/60" />
        <Skeleton className="h-12 w-36 bg-zinc-900/80 rounded-2xl border border-zinc-800/60" />
      </div>

      {/* Table */}
      <div className="flex-1 flex flex-col min-h-0 bg-zinc-900/30 border border-zinc-800/60 rounded-[2rem] overflow-hidden shadow-xl">
        {/* Table Header */}
        <div className="hidden sm:flex gap-4 px-8 py-3 bg-zinc-950/80 border-b border-zinc-800/60 shrink-0">
          <Skeleton className="h-3 w-32 bg-zinc-800/60 rounded" />
          <Skeleton className="h-3 w-24 bg-zinc-800/40 rounded ml-auto" />
        </div>
        {/* Rows */}
        <div className="flex-1 divide-y divide-zinc-800/30 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-5 px-8 py-3.5">
              <Skeleton className="h-10 w-10 rounded-xl bg-zinc-800/50 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/5 bg-zinc-800/60 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-14 bg-zinc-800/30 rounded-full" />
                  <Skeleton className="h-3 w-14 bg-zinc-800/30 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 bg-zinc-800/50 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-8 py-3 bg-zinc-950/80 border-t border-zinc-800/60 shrink-0">
          <Skeleton className="h-8 w-20 bg-zinc-800/50 rounded-lg" />
          <div className="flex gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-7 w-7 bg-zinc-800/40 rounded-lg" />)}
          </div>
          <Skeleton className="h-8 w-20 bg-zinc-800/50 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Communities Page Skeleton ──────────────────────────────────────────────────
export function CommunityShellSkeleton() {
  return (
    <div className="h-full flex flex-col px-4 sm:px-6 md:px-8 py-4 bg-zinc-950 overflow-hidden">
      {/* Header + Search */}
      <div className="flex items-end justify-between mb-4 shrink-0 flex-wrap gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36 bg-zinc-800/70 rounded-xl" />
          <Skeleton className="h-3.5 w-72 bg-zinc-800/40 rounded-lg" />
        </div>
        <div className="flex gap-2 ml-auto">
          <Skeleton className="h-10 w-56 bg-zinc-900/80 rounded-xl border border-zinc-800/60" />
          <Skeleton className="h-10 w-28 bg-emerald-500/10 rounded-xl border border-emerald-500/20" />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 flex flex-col bg-zinc-900/40 border border-zinc-800/60 rounded-[1.5rem] overflow-hidden shadow-xl">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-6 py-3 bg-zinc-950/80 border-b border-zinc-800/60 shrink-0">
          <Skeleton className="col-span-6 h-3 w-28 bg-zinc-800/60 rounded" />
          <Skeleton className="col-span-2 h-3 w-16 bg-zinc-800/40 rounded mx-auto" />
          <Skeleton className="col-span-2 h-3 w-14 bg-zinc-800/40 rounded mx-auto" />
          <Skeleton className="col-span-2 h-3 w-16 bg-zinc-800/40 rounded ml-auto" />
        </div>
        {/* Rows */}
        <div className="flex-1 min-h-0 divide-y divide-zinc-800/40 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-6 py-3 items-center">
              <div className="col-span-6 flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl bg-zinc-800/60 shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 bg-zinc-800/60 rounded-lg" />
                  <Skeleton className="h-3 w-full bg-zinc-800/30 rounded-lg" />
                </div>
              </div>
              <div className="hidden sm:flex col-span-2 justify-center"><Skeleton className="h-5 w-16 bg-zinc-800/40 rounded" /></div>
              <div className="hidden sm:flex col-span-2 justify-center"><Skeleton className="h-4 w-8 bg-zinc-800/40 rounded" /></div>
              <div className="col-span-6 sm:col-span-2 flex justify-end"><Skeleton className="h-9 w-20 bg-zinc-800/50 rounded-lg" /></div>
            </div>
          ))}
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 bg-zinc-950/80 border-t border-zinc-800/60 shrink-0">
          <Skeleton className="h-9 w-20 bg-zinc-800/50 rounded-lg" />
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-8 bg-zinc-800/40 rounded-lg" />)}
          </div>
          <Skeleton className="h-9 w-20 bg-zinc-800/50 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page Skeleton ────────────────────────────────────────────────────
export function DashboardPageSkeleton() {
  return (
    <div className="h-full overflow-hidden flex flex-col px-4 sm:px-6 md:px-8 py-4 bg-zinc-950 gap-3">
      {/* Welcome Banner */}
      <div className="shrink-0 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 bg-zinc-800/70 rounded-xl" />
          <Skeleton className="h-3.5 w-72 bg-zinc-800/40 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-24 rounded-xl bg-zinc-800/60 shrink-0" />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3 overflow-hidden">
        {/* Left Column */}
        <div className="flex flex-col gap-3 w-full lg:w-[320px] shrink-0 min-h-0">
          <div className="grid grid-cols-2 gap-2.5 shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-3 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16 bg-zinc-800/50 rounded" />
                  <Skeleton className="h-6 w-6 rounded-lg bg-zinc-800/60" />
                </div>
                <Skeleton className="h-7 w-14 bg-zinc-800/70 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="flex-1 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-3 flex flex-col gap-2 min-h-0 overflow-hidden">
            <Skeleton className="h-3 w-24 bg-zinc-800/50 rounded shrink-0" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-zinc-800/30 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 min-h-0 overflow-hidden">
          <div className="grid grid-cols-3 gap-3 flex-[3] min-h-0 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-3 flex flex-col gap-2 min-h-0">
                <Skeleton className="h-3 w-16 bg-zinc-800/50 rounded shrink-0" />
                <Skeleton className="flex-1 w-full bg-zinc-800/30 rounded-xl" />
                <div className="grid grid-cols-3 gap-1 shrink-0">
                  {Array.from({ length: 3 }).map((_, j) => <Skeleton key={j} className="h-8 bg-zinc-800/20 rounded-lg" />)}
                </div>
              </div>
            ))}
          </div>
          <div className="shrink-0 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 flex flex-col gap-2">
            <Skeleton className="h-4 w-40 bg-zinc-800/50 rounded shrink-0" />
            <Skeleton className="h-3 w-full bg-zinc-800/60 rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20 bg-zinc-800/30 rounded" />
              <Skeleton className="h-3 w-32 bg-zinc-800/30 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Leaderboard Page Skeleton ──────────────────────────────────────────────────
export function LeaderboardPageSkeleton() {
  return (
    <div className="h-full overflow-hidden flex flex-col px-4 sm:px-6 md:px-8 py-4 bg-zinc-950 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36 bg-zinc-800/70 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-48 bg-zinc-900/80 rounded-xl border border-zinc-800/60" />
      </div>

      {/* Main Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Podium */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="flex items-end justify-center gap-3">
            {[110, 140, 100].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-4" style={{ minHeight: h }}>
                <Skeleton className="h-14 w-14 rounded-full bg-zinc-800/60" />
                <Skeleton className="h-4 w-20 bg-zinc-800/50 rounded-lg" />
                <Skeleton className="h-6 w-16 bg-zinc-800/30 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
        {/* Rankings Table */}
        <div className="lg:col-span-7 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl overflow-hidden flex flex-col">
            <div className="flex-1 divide-y divide-zinc-800/30 overflow-hidden">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-5 py-2.5 items-center">
                  <Skeleton className="col-span-1 h-4 w-6 bg-zinc-800/50 rounded" />
                  <div className="col-span-8 flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full bg-zinc-800/60 shrink-0" />
                    <Skeleton className="h-4 w-32 bg-zinc-800/50 rounded-lg" />
                  </div>
                  <Skeleton className="col-span-3 h-4 w-16 bg-zinc-800/40 rounded ml-auto" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-5 py-3 bg-zinc-950/80 border-t border-zinc-800/60 shrink-0">
              <Skeleton className="h-8 w-20 bg-zinc-800/50 rounded-lg" />
              <div className="flex gap-1.5">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-7 w-7 bg-zinc-800/40 rounded-lg" />)}
              </div>
              <Skeleton className="h-8 w-20 bg-zinc-800/50 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Practice Page Skeleton ─────────────────────────────────────────────────────
export function PracticePageSkeleton() {
  return (
    <div className="h-full overflow-hidden flex flex-col items-center px-4 sm:px-6 md:px-8 py-5 bg-zinc-950 gap-4">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        <Skeleton className="h-8 w-40 bg-zinc-800/70 rounded-xl" />
        <Skeleton className="h-3.5 w-72 bg-zinc-800/40 rounded-lg" />
      </div>

      {/* Tab + Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 shrink-0 w-full max-w-5xl">
        <div className="flex gap-2 shrink-0">
          <Skeleton className="h-10 w-32 bg-emerald-500/10 rounded-xl border border-emerald-500/20" />
          <Skeleton className="h-10 w-32 bg-zinc-900/80 rounded-xl border border-zinc-800/60" />
        </div>
        <Skeleton className="h-12 w-full md:w-96 bg-zinc-900/80 rounded-2xl border border-zinc-800/60" />
      </div>

      {/* Language Table */}
      <div className="flex-1 min-h-0 flex flex-col w-full max-w-5xl bg-zinc-900/40 border border-zinc-800/60 rounded-[1.5rem] overflow-hidden shadow-xl">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-950/80 border-b border-zinc-800/60 shrink-0">
          <Skeleton className="col-span-5 h-3 w-24 bg-zinc-800/50 rounded" />
          <Skeleton className="col-span-7 h-3 w-16 bg-zinc-800/40 rounded ml-auto" />
        </div>
        <div className="flex-1 min-h-0 divide-y divide-zinc-800/40 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 px-6 py-3.5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl bg-zinc-800/60 shrink-0" />
                <Skeleton className="h-4 w-24 bg-zinc-800/60 rounded-lg" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-[130px] bg-zinc-800/40 rounded-lg" />
                <Skeleton className="h-9 w-24 bg-zinc-800/50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center px-6 py-3 bg-zinc-950/80 border-t border-zinc-800/60 shrink-0 gap-3">
          <Skeleton className="h-9 w-9 bg-zinc-800/50 rounded-lg" />
          <Skeleton className="h-7 w-16 bg-zinc-800/40 rounded-lg" />
          <Skeleton className="h-9 w-9 bg-zinc-800/50 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Generic App Route Skeleton (fallback) ──────────────────────────────────────
export function AppRouteSkeleton() {
  return (
    <div className="h-full overflow-hidden flex flex-col px-4 sm:px-6 md:px-8 py-4 bg-zinc-950 gap-4">
      <Skeleton className="h-14 w-full rounded-2xl bg-zinc-900/70 shrink-0" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 shrink-0">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl bg-zinc-900/70" />)}
      </div>
      <Skeleton className="flex-1 w-full rounded-2xl bg-zinc-900/60" />
    </div>
  );
}

// ─── Auth Page Skeleton ─────────────────────────────────────────────────────────
export function AuthPageSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <Skeleton className="mx-auto h-12 w-12 rounded-xl bg-zinc-800" />
        <Skeleton className="mx-auto h-6 w-40 bg-zinc-800" />
        <Skeleton className="mx-auto h-4 w-56 bg-zinc-800" />
        <div className="space-y-3 pt-3">
          <Skeleton className="h-10 w-full bg-zinc-800" />
          <Skeleton className="h-10 w-full bg-zinc-800" />
          <Skeleton className="h-10 w-full bg-zinc-800" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl bg-zinc-800" />
      </div>
    </div>
  );
}

// ─── Profile Page Skeleton ──────────────────────────────────────────────────────
export function ProfilePageSkeleton() {
  return (
    <div className="h-full overflow-hidden flex flex-col px-4 sm:px-6 md:px-8 py-4 bg-zinc-950 gap-4">
      <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-6 flex items-center gap-6 shrink-0">
        <Skeleton className="h-20 w-20 rounded-full bg-zinc-800/70 shrink-0" />
        <div className="space-y-3 flex-1">
          <Skeleton className="h-6 w-40 bg-zinc-800/70 rounded-xl" />
          <Skeleton className="h-4 w-72 bg-zinc-800/40 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 shrink-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 space-y-3">
            <Skeleton className="h-3 w-20 bg-zinc-800/50 rounded" />
            <Skeleton className="h-8 w-16 bg-zinc-800/70 rounded-xl" />
          </div>
        ))}
      </div>
      <Skeleton className="flex-1 w-full rounded-2xl bg-zinc-900/40 border border-zinc-800/60" />
    </div>
  );
}

// ─── Split View Skeleton (code editor pages) ────────────────────────────────────
export function SplitViewSkeleton() {
  return (
    <div className="h-full p-4 overflow-hidden">
      <div className="grid h-full grid-cols-1 gap-2 lg:grid-cols-[40%_60%]">
        <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <Skeleton className="h-6 w-40 bg-zinc-800" />
          <Skeleton className="h-4 w-24 bg-zinc-800" />
          <Skeleton className="h-[75%] w-full rounded-lg bg-zinc-900/70" />
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <Skeleton className="h-full w-full rounded-lg bg-zinc-900/70" />
        </div>
      </div>
    </div>
  );
}
