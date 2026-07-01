import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RoadmapCanvas } from '@/components/roadmap/RoadmapCanvas';

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

  let roadmap: any = null;
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    const res = await fetch(`${apiBaseUrl}/api/roadmaps/${slug}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      roadmap = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch roadmap from DB:", error);
  }

  if (!roadmap) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Roadmap not found</h1>
          <Link
            href="/roadmap"
            className="text-brand-500 hover:text-brand-400 font-medium"
          >
            Back to roadmaps
          </Link>
        </div>
      </div>
    );
  }

  const topics = roadmap.topics || [];
  const totalTopics = roadmap.totalTopics || topics.length;
  const layoutType = roadmap.layoutType || "tree";
  const metroLines = roadmap.metroLines || [];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-zinc-950 text-white">
      <RoadmapCanvas
        roadmapId={roadmap.slug}
        title={roadmap.title}
        description={roadmap.description}
        level={roadmap.level}
        estimatedTime={roadmap.estimatedTime}
        topics={topics}
        totalTopics={totalTopics}
        layoutType={layoutType as "metromap" | "tree"}
        metroLines={metroLines}
      />
    </div>
  );
}
