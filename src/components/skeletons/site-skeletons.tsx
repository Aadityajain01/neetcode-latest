import { Skeleton } from "@/components/ui/skeleton";

export function AppRouteSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <Skeleton className="h-14 w-full rounded-2xl bg-zinc-900/70" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-32 rounded-2xl bg-zinc-900/70" />
          <Skeleton className="h-32 rounded-2xl bg-zinc-900/70" />
          <Skeleton className="h-32 rounded-2xl bg-zinc-900/70" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl bg-zinc-900/70" />
      </div>
    </div>
  );
}

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

export function DashboardPageSkeleton() {
  return (
    <div className="min-h-[80vh] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl bg-zinc-900/70" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-24 rounded-2xl bg-zinc-900/70" />
          <Skeleton className="h-24 rounded-2xl bg-zinc-900/70" />
          <Skeleton className="h-24 rounded-2xl bg-zinc-900/70" />
          <Skeleton className="h-24 rounded-2xl bg-zinc-900/70" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-2xl bg-zinc-900/70" />
          <Skeleton className="h-72 rounded-2xl bg-zinc-900/70" />
          <Skeleton className="h-72 rounded-2xl bg-zinc-900/70" />
        </div>
      </div>
    </div>
  );
}

export function ProblemsPageSkeleton() {
  return (
    <div className="space-y-4 py-6">
      <Skeleton className="h-36 w-full rounded-3xl bg-zinc-900/70" />
      <Skeleton className="h-14 w-full rounded-xl bg-zinc-900/70" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Skeleton key={idx} className="h-16 w-full rounded-xl bg-zinc-900/70" />
        ))}
      </div>
    </div>
  );
}

export function LeaderboardPageSkeleton() {
  return (
    <div className="space-y-6 py-8">
      <Skeleton className="h-16 w-full rounded-2xl bg-zinc-900/70" />
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        <Skeleton className="h-40 rounded-2xl bg-zinc-900/70" />
        <Skeleton className="h-52 rounded-2xl bg-zinc-900/70" />
        <Skeleton className="h-36 rounded-2xl bg-zinc-900/70" />
      </div>
      <Skeleton className="h-72 w-full rounded-2xl bg-zinc-900/70" />
    </div>
  );
}

export function CommunityShellSkeleton() {
  return (
    <div className="space-y-5 px-4 py-6 sm:px-6">
      <Skeleton className="h-12 w-full rounded-xl bg-zinc-900/70" />
      <Skeleton className="h-28 w-full rounded-2xl bg-zinc-900/70" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-16 w-full rounded-xl bg-zinc-900/70" />
        ))}
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6 py-6">
      <Skeleton className="h-44 w-full rounded-3xl bg-zinc-900/70" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-28 rounded-2xl bg-zinc-900/70" />
        <Skeleton className="h-28 rounded-2xl bg-zinc-900/70" />
        <Skeleton className="h-28 rounded-2xl bg-zinc-900/70" />
      </div>
      <Skeleton className="h-80 w-full rounded-2xl bg-zinc-900/70" />
    </div>
  );
}

export function SplitViewSkeleton() {
  return (
    <div className="h-[calc(100vh-80px)] p-4">
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
