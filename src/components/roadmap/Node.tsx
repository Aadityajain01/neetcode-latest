import type { RoadmapNode } from '../../../data/roadmaps';
import { cn } from '@/lib/utils';

interface NodeProps {
  node: RoadmapNode;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

export function Node({ node, isHovered, onHover, onClick }: NodeProps) {
  const size = node.size ?? 'md';
  const variant = node.variant ?? 'branch';

  return (
    <div
      onClick={() => onClick(node.id)}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        'absolute -translate-x-1/2 -translate-y-1/2 select-none rounded-2xl border text-center font-semibold leading-tight tracking-[0.01em] transition-all duration-300',
        'backdrop-blur-md',
        size === 'lg' && 'w-56 px-5 py-3.5 text-[15px]',
        size === 'md' && 'w-44 px-4 py-2.5 text-[13px]',
        size === 'sm' && 'w-36 px-3 py-2 text-[11px]',
        variant === 'core' && 'border-white bg-white text-zinc-950 shadow-[0_18px_45px_rgba(255,255,255,0.12)]',
        variant === 'branch' && 'border-zinc-700 bg-zinc-900/88 text-zinc-100 shadow-[0_16px_32px_rgba(0,0,0,0.22)]',
        variant === 'support' && 'border-zinc-600/40 bg-zinc-800/60 text-zinc-200 shadow-[0_16px_32px_rgba(0,0,0,0.18)]',
        isHovered && 'scale-[1.03] border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.15)] z-10',
        !isHovered && 'z-0'
      )}
      style={{ left: `${node.x}px`, top: `${node.y}px` }}
    >
      <span className="block whitespace-normal">{node.label}</span>
    </div>
  );
}
