import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { RoadmapCanvas } from '@/components/roadmap/RoadmapCanvas';
import { roadmaps } from '../../../../../data/roadmaps';

export const generateStaticParams = async () => {
  return Object.keys(roadmaps).map((slug) => ({
    slug,
  }));
};

const countNodes = (topics: any[]) => {
  let count = 0;
  topics?.forEach(topic => {
    count++;
    if (topic.subtopics) {
      topic.subtopics.forEach(sub => {
        count++;
        if (sub.children) {
          count += sub.children.length;
        }
      });
    }
  });
  return count;
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
            className="text-brand-500 hover:text-brand-400 font-medium"
          >
            Back to roadmaps
          </Link>
        </div>
      </div>
    );
  }

  const totalTopics = countNodes(roadmap.topics);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-zinc-950 text-white">
      <RoadmapCanvas
        roadmapId={roadmap.slug}
        title={roadmap.title}
        description={roadmap.description}
        level={roadmap.level}
        estimatedTime={roadmap.estimatedTime}
        topics={roadmap.topics}
        totalTopics={totalTopics}
      />
    </div>
  );
}
