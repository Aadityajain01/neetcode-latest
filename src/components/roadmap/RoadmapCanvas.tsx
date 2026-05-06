"use client";

import { useState } from 'react';
import type { RoadmapGraph } from '../../../data/roadmaps';
import { Node } from './Node';
import { Edge } from './Edge';

export function RoadmapCanvas({ roadmap }: { roadmap: RoadmapGraph }) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const nodeMap = new Map(roadmap.nodes.map((node) => [node.id, node]));

  return (
    <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-zinc-950/70 shadow-[0_35px_90px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.12),transparent_30%)]" />

      <div className="relative z-10 flex items-center justify-between gap-4 border-b border-white/5 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Backend roadmap canvas</h2>
          <p className="text-xs text-zinc-400">Follow the center path first. Branches are the topics to layer in as you build real systems.</p>
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          {roadmap.nodes.length} topics
        </div>
      </div>

      <div className="relative z-10 overflow-auto max-h-[78vh] overscroll-contain">
        <div
          className="relative"
          style={{ width: `${roadmap.width}px`, height: `${roadmap.height}px`, minWidth: `${roadmap.width}px` }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.07]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.9) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />

          <svg className="absolute inset-0 h-full w-full pointer-events-none">
            {roadmap.edges.map((edge) => {
              const fromNode = nodeMap.get(edge.from);
              const toNode = nodeMap.get(edge.to);

              if (!fromNode || !toNode) {
                return null;
              }

              const isHovered = hoveredNode === edge.from || hoveredNode === edge.to;

              return (
                <Edge
                  key={`${edge.from}-${edge.to}`}
                  fromNode={fromNode}
                  toNode={toNode}
                  isHovered={isHovered}
                  style={edge.style}
                  emphasis={edge.emphasis}
                />
              );
            })}
          </svg>

          {roadmap.nodes.map((node) => (
            <Node
              key={node.id}
              node={node}
              isHovered={hoveredNode === node.id}
              onHover={setHoveredNode}
              onClick={() => {}}
            />
          ))}

          <div className="pointer-events-none absolute bottom-6 right-6 rounded-full border border-white/10 bg-zinc-950/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500 shadow-lg">
            Scroll to explore
          </div>
        </div>
      </div>
    </div>
  );
}
