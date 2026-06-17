import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RoadmapCanvas } from '@/components/roadmap/RoadmapCanvas';
import { roadmaps } from '../../../../../data/roadmaps';

export const generateStaticParams = async () => {
  return Object.keys(roadmaps).map((slug) => ({
    slug,
  }));
};

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  const rawSlug = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug[0]
    : resolvedParams.slug;

  const slug = String(rawSlug ?? "").toLowerCase();



  const roadmap = (roadmaps as Record<string, any>)[slug] ??
    Object.values(roadmaps).find((r: any) => String(r.slug).toLowerCase() === slug);

  if (!roadmap) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Roadmap not found</h1>
          <Link
            href="/roadmap"
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            ? resolvedParams.slug[0]
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-20 pt-6 font-sans sm:px-6 lg:px-8">
        {/* Header */}
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to roadmaps
        </Link>

        <div className="space-y-3">
          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
            {roadmap.title}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-zinc-300 md:text-lg">
            {roadmap.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Level
            </div>
            <div className="mt-1 text-sm font-semibold text-white">
              {roadmap.level}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Estimated Time
            </div>
            <div className="mt-1 text-sm font-semibold text-white">
              {roadmap.estimatedTime}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Topics
            </div>
            <div className="mt-1 text-sm font-semibold text-white">
              {roadmap.roadmap.nodes.length}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <RoadmapCanvas roadmap={roadmap.roadmap} />
      </div>
    </div>
  );
}
