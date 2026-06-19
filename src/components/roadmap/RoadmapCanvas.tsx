"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import type { RoadmapTopic } from '../../../data/roadmaps';
import Link from 'next/link';

interface RoadmapCanvasProps {
  roadmapId: string;
  title: string;
  description: string;
  level: string;
  estimatedTime: string;
  topics: RoadmapTopic[];
  totalTopics: number;
}

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "root" | "main-topic" | "subtopic" | "leaf";
}

const CONFIG = {
  mainNodeWidth: 180,
  mainNodeHeight: 52,
  subtopicWidth: 160,
  subtopicHeight: 44,
  verticalGap: 110,
  subtopicGap: 24,
  sideOffset: 120,
  canvasPadding: 80
};

export function RoadmapCanvas({
  roadmapId,
  title,
  description,
  level,
  estimatedTime,
  topics,
  totalTopics
}: RoadmapCanvasProps) {
  // Zoom & Pan State
  const [transform, setTransform] = useState({ zoom: 1, panX: 0, panY: 0 });
  const { zoom, panX, panY } = transform;
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const zoomTo = (zoomDelta: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.width > 0 ? rect.width / 2 : window.innerWidth / 2;
    const cy = rect.height > 0 ? rect.height / 2 : (window.innerHeight - 52) / 2;

    setTransform((prev) => {
      const oldZoom = prev.zoom;
      const newZoom = Math.max(0.25, Math.min(2.2, oldZoom + zoomDelta));
      const wx = (cx - prev.panX) / oldZoom;
      const wy = (cy - prev.panY) / oldZoom;
      return {
        zoom: newZoom,
        panX: cx - wx * newZoom,
        panY: cy - wy * newZoom
      };
    });
  };

  // Progress Tracking State
  const [progress, setProgress] = useState<Record<string, string>>({});

  // Node Selection & Search State
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  // Load progress from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("roadmap-progress");
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  // Calculate layout coordinates dynamically
  const { nodePositions, allNodes, canvasWidth, canvasHeight } = useMemo(() => {
    const positions = new Map<string, NodePosition>();
    const nodesMap = new Map<string, any>();

    // Index all nodes in a flat map
    nodesMap.set(roadmapId, { id: roadmapId, title, description });
    topics.forEach((topic) => {
      nodesMap.set(topic.id, topic);
      topic.subtopics?.forEach((sub) => {
        nodesMap.set(sub.id, sub);
        sub.children?.forEach((child) => {
          nodesMap.set(child.id, child);
        });
      });
    });

    const centerX = 800;
    let y = CONFIG.canvasPadding;

    // Root node
    const rootWidth = 240;
    const rootHeight = 56;
    positions.set(roadmapId, {
      x: centerX - rootWidth / 2,
      y,
      width: rootWidth,
      height: rootHeight,
      type: "root"
    });
    y += rootHeight + 100;

    topics.forEach((topic, i) => {
      const tw = CONFIG.mainNodeWidth;
      const th = CONFIG.mainNodeHeight;
      const subWidth = CONFIG.subtopicWidth;
      const subHeight = CONFIG.subtopicHeight;
      const subtopicGap = CONFIG.subtopicGap;

      const leafWidth = 140;
      const leafHeight = 36;
      const leafGap = 8;
      const leafOffset = 40;

      let subtopicsTotalHeight = 0;
      const subtopicHeights: Array<{ sub: any; requiredHeight: number; totalLeafHeight: number }> = [];

      if (topic.subtopics && topic.subtopics.length > 0) {
        topic.subtopics.forEach((sub) => {
          let totalLeafHeight = 0;
          if (sub.children && sub.children.length > 0) {
            totalLeafHeight = sub.children.length * leafHeight + (sub.children.length - 1) * leafGap;
          }
          const requiredHeight = Math.max(subHeight, totalLeafHeight);
          subtopicHeights.push({ sub, requiredHeight, totalLeafHeight });
          subtopicsTotalHeight += requiredHeight;
        });
        subtopicsTotalHeight += (topic.subtopics.length - 1) * subtopicGap;
      } else {
        subtopicsTotalHeight = th;
      }

      const topicBlockHeight = Math.max(th, subtopicsTotalHeight);
      const offset = (i % 2 === 0) ? -45 : 45;
      const topicX = centerX + offset;
      const topicY = y + topicBlockHeight / 2 - th / 2;

      positions.set(topic.id, {
        x: topicX - tw / 2,
        y: topicY,
        width: tw,
        height: th,
        type: "main-topic"
      });

      const side = (i % 2 === 0) ? "right" : "left";

      if (topic.subtopics && topic.subtopics.length > 0) {
        const subStartY = y + topicBlockHeight / 2 - subtopicsTotalHeight / 2;
        let currentSubY = subStartY;

        subtopicHeights.forEach(({ sub, requiredHeight, totalLeafHeight }) => {
          let subX = 0;
          if (side === "right") {
            subX = topicX + tw / 2 + CONFIG.sideOffset;
          } else {
            subX = topicX - tw / 2 - CONFIG.sideOffset - subWidth;
          }

          const subY = currentSubY + requiredHeight / 2 - subHeight / 2;

          positions.set(sub.id, {
            x: subX,
            y: subY,
            width: subWidth,
            height: subHeight,
            type: "subtopic"
          });

          if (sub.children && sub.children.length > 0) {
            const leafStartY = currentSubY + requiredHeight / 2 - totalLeafHeight / 2;

            sub.children.forEach((child, k) => {
              let leafX = 0;
              if (side === "right") {
                leafX = subX + subWidth + leafOffset;
              } else {
                leafX = subX - leafWidth - leafOffset;
              }

              const leafY = leafStartY + k * (leafHeight + leafGap);

              positions.set(child.id, {
                x: leafX,
                y: leafY,
                width: leafWidth,
                height: leafHeight,
                type: "leaf"
              });
            });
          }

          currentSubY += requiredHeight + subtopicGap;
        });
      }

      y += topicBlockHeight + CONFIG.verticalGap;
    });

    let maxX = 1200;
    let maxY = 1200;
    positions.forEach((p) => {
      maxX = Math.max(maxX, p.x + p.width + 100);
      maxY = Math.max(maxY, p.y + p.height + 100);
    });

    return { nodePositions: positions, allNodes: nodesMap, canvasWidth: maxX, canvasHeight: maxY };
  }, [topics, roadmapId, title, description]);

  // Render SVG connection lines dynamically
  const connectionSvgContent = useMemo(() => {
    const paths: React.ReactNode[] = [];
    const rootPos = nodePositions.get(roadmapId);

    // Connect root to first topic
    if (rootPos && topics && topics.length > 0) {
      const firstTopicPos = nodePositions.get(topics[0].id);
      if (firstTopicPos) {
        const x1 = rootPos.x + rootPos.width / 2;
        const y1 = rootPos.y + rootPos.height;
        const x2 = firstTopicPos.x + firstTopicPos.width / 2;
        const y2 = firstTopicPos.y;
        const midX = (x1 + x2) / 2;
        paths.push(
          <path
            key="root-to-first"
            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
            className="stroke-[#FF6A1F] stroke-[3.5] fill-none stroke-linecap-round"
          />
        );
      }
    }

    // Connect topics sequentially in a wavy center path
    for (let i = 0; i < topics.length - 1; i++) {
      const curr = nodePositions.get(topics[i].id);
      const next = nodePositions.get(topics[i + 1].id);
      if (curr && next) {
        const startX = curr.x + curr.width / 2;
        const startY = curr.y + curr.height;
        const endX = next.x + next.width / 2;
        const endY = next.y;
        const midY = (startY + endY) / 2;
        paths.push(
          <path
            key={`center-wavy-${topics[i].id}-${topics[i+1].id}`}
            d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`}
            className="stroke-[#FF6A1F] stroke-[3.5] fill-none stroke-linecap-round"
          />
        );
      }
    }

    // Connect topics to subtopics, and subtopics to leaf nodes
    topics.forEach((topic, i) => {
      const topicPos = nodePositions.get(topic.id);
      if (!topicPos || !topic.subtopics) return;
      const side = (i % 2 === 0) ? "right" : "left";

      topic.subtopics.forEach((sub) => {
        const subPos = nodePositions.get(sub.id);
        if (!subPos) return;

        let startX, startY, endX, endY;
        startY = topicPos.y + topicPos.height / 2;
        endY = subPos.y + subPos.height / 2;

        if (side === "right") {
          startX = topicPos.x + topicPos.width;
          endX = subPos.x;
        } else {
          startX = topicPos.x;
          endX = subPos.x + subPos.width;
        }

        const midX = (startX + endX) / 2;
        paths.push(
          <path
            key={`topic-to-sub-${sub.id}`}
            d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
            className="stroke-[#FF6A1F66] stroke-[2.2] fill-none stroke-dasharray-[6,5] stroke-linecap-round"
          />
        );

        if (sub.children) {
          sub.children.forEach((child) => {
            const childPos = nodePositions.get(child.id);
            if (!childPos) return;

            let leafStartX, leafStartY, leafEndX, leafEndY;
            leafStartY = subPos.y + subPos.height / 2;
            leafEndY = childPos.y + childPos.height / 2;

            if (side === "right") {
              leafStartX = subPos.x + subPos.width;
              leafEndX = childPos.x;
            } else {
              leafStartX = subPos.x;
              leafEndX = childPos.x + childPos.width;
            }

            const leafMidX = (leafStartX + leafEndX) / 2;
            paths.push(
              <path
                key={`sub-to-leaf-${child.id}`}
                d={`M ${leafStartX} ${leafStartY} C ${leafMidX} ${leafStartY}, ${leafMidX} ${leafEndY}, ${leafEndX} ${leafEndY}`}
                className="stroke-[#FF6A1F66] stroke-[2.2] fill-none stroke-dasharray-[6,5] stroke-linecap-round"
              />
            );
          });
        }
      });
    });

    return paths;
  }, [nodePositions, topics, roadmapId]);

  // Fit view port to show everything centered
  const fitToScreen = () => {
    if (nodePositions.size === 0 || !containerRef.current) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodePositions.forEach((p) => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x + p.width);
      maxY = Math.max(maxY, p.y + p.height);
    });

    if (minX === Infinity) return;

    const rect = containerRef.current.getBoundingClientRect();
    const targetWidth = rect.width > 0 ? rect.width : window.innerWidth;

    const newZoom = 1.0;

    setTransform({
      zoom: newZoom,
      panX: targetWidth / 2 - ((maxX + minX) / 2) * newZoom,
      panY: 40 - minY * newZoom
    });
  };

  // Center/fit view on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fitToScreen();
    }, 100);
    return () => clearTimeout(timer);
  }, [nodePositions]);

  // Handle wheel zoom with native listener for passive:false compatibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      setTransform((prev) => {
        const oldZoom = prev.zoom;
        const zoomDelta = e.deltaY > 0 ? -0.12 : 0.12;
        const newZoom = Math.max(0.25, Math.min(2.2, oldZoom + zoomDelta));

        const wx = (clientX - prev.panX) / oldZoom;
        const wy = (clientY - prev.panY) / oldZoom;

        return {
          zoom: newZoom,
          panX: clientX - wx * newZoom,
          panY: clientY - wy * newZoom
        };
      });
    };

    el.addEventListener("wheel", wheelHandler, { passive: false });
    return () => {
      el.removeEventListener("wheel", wheelHandler);
    };
  }, []);

  // Pan dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".node") || target.closest(".canvas-controls") || target.closest(".instructions-card")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.panX, y: e.clientY - transform.panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      panX: e.clientX - dragStart.x,
      panY: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Progress cycle
  const cycleProgressState = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const states = ["not-started", "in-progress", "completed"];
    const currentStatus = progress[id] || "not-started";
    const nextStatus = states[(states.indexOf(currentStatus) + 1) % states.length];

    setProgress((prev) => {
      const next = { ...prev };
      if (nextStatus === "not-started") {
        delete next[id];
      } else {
        next[id] = nextStatus;
      }
      localStorage.setItem("roadmap-progress", JSON.stringify(next));
      return next;
    });
  };

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const list: any[] = [];
    allNodes.forEach((node, id) => {
      if (id !== roadmapId && node.title && node.title.toLowerCase().includes(q)) {
        list.push(node);
      }
    });
    return list;
  }, [searchQuery, allNodes, roadmapId]);

  // Focus node center animation
  const focusNode = (id: string) => {
    const pos = nodePositions.get(id);
    if (!pos || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const targetWidth = rect.width > 0 ? rect.width : window.innerWidth;
    const targetHeight = rect.height > 0 ? rect.height : window.innerHeight - 52;

    const tx = targetWidth / 2 - pos.x * transform.zoom - (pos.width * transform.zoom) / 2;
    const ty = targetHeight / 2 - pos.y * transform.zoom - (pos.height * transform.zoom) / 2;

    const sx = transform.panX;
    const sy = transform.panY;
    const t0 = performance.now();

    const anim = (t: number) => {
      const p = Math.min((t - t0) / 300, 1);
      const e = 1 - Math.pow(1 - p, 3); // Cubic ease out
      setTransform(prev => ({
        ...prev,
        panX: sx + (tx - sx) * e,
        panY: sy + (ty - sy) * e
      }));
      if (p < 1) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  };

  // Stats
  const { solvedCount, totalCount } = useMemo(() => {
    const ids = Array.from(allNodes.keys()).filter((id) => id !== roadmapId);
    const solved = ids.filter((id) => progress[id] === "completed").length;
    return { solvedCount: solved, totalCount: ids.length };
  }, [allNodes, progress, roadmapId]);

  const completionPercentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  return (
    <div className="flex-1 w-full flex flex-col min-h-0 relative overflow-hidden bg-zinc-950 font-sans">
      
      {/* Stats bar / header */}
      <div className="shrink-0 px-6 py-4 border-b border-zinc-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950/80 backdrop-blur-md z-30">
        <div className="space-y-1">
          <Link href="/roadmap" className="inline-flex items-center gap-2 text-zinc-400 hover:text-brand-500 text-xs font-semibold transition-colors">
            <ArrowLeft size={14} />
            <span>Back to roadmaps</span>
          </Link>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-zinc-950 border border-zinc-800/80 px-3 py-1 rounded-xl text-center min-w-[70px]">
            <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Level</span>
            <span className="text-xs font-bold text-white leading-none">{level}</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800/80 px-3 py-1 rounded-xl text-center min-w-[80px]">
            <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Time</span>
            <span className="text-xs font-bold text-white leading-none">{estimatedTime}</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-800/80 px-3 py-1 rounded-xl text-center min-w-[70px]">
            <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Topics</span>
            <span className="text-xs font-bold text-white leading-none">{totalTopics}</span>
          </div>
          <button
            onClick={fitToScreen}
            className="h-9 px-3 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-white transition-all select-none cursor-pointer"
          >
            Reset View
          </button>
          <div className="px-3 py-2 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-xl text-xs font-black">
            {completionPercentage}% Complete ({solvedCount}/{totalCount})
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex-1 flex min-h-0 relative">
        
        {/* Canvas area */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 h-full relative overflow-hidden select-none bg-zinc-950 cursor-${isDragging ? 'grabbing' : 'grab'}`}
          style={{
            backgroundImage: 'radial-gradient(circle, #27272a 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px'
          }}
        >
          {/* Zoomable tree container */}
          <div
            className="absolute origin-top-left will-change-transform"
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`
            }}
          >
            <svg
              className="absolute inset-0 pointer-events-none overflow-visible"
              width={canvasWidth}
              height={canvasHeight}
              style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
            >
              {connectionSvgContent}
            </svg>

            <div className="absolute inset-0">
              {Array.from(nodePositions.entries()).map(([id, pos]) => {
                const node = allNodes.get(id);
                if (!node) return null;
                return (
                  <RoadmapNodeComponent
                    key={id}
                    id={id}
                    pos={pos}
                    node={node}
                    isSelected={selectedNode?.id === id}
                    progressStatus={progress[id] || "not-started"}
                    onProgressToggle={(e) => cycleProgressState(id, e)}
                    onNodeClick={() => setSelectedNode(node)}
                  />
                );
              })}
            </div>
          </div>

          {/* Floating Controls */}
          <div className="absolute bottom-6 left-6 flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-2xl z-20">
            <button
              onClick={() => zoomTo(-0.12)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/80 font-bold transition-all cursor-pointer"
            >
              -
            </button>
            <span className="text-[10px] font-mono text-zinc-500 w-10 text-center select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => zoomTo(0.12)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/80 font-bold transition-all cursor-pointer"
            >
              +
            </button>
            <button
              onClick={fitToScreen}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/80 text-xs font-bold transition-all cursor-pointer"
            >
              ⊡
            </button>
          </div>

          {/* Floating Usage Instructions */}
          <div className="absolute top-6 left-6 w-72 bg-zinc-900/90 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-5 shadow-2xl z-20 hidden lg:flex flex-col gap-3">
            <div className="text-xs font-black uppercase tracking-wider text-white border-b border-zinc-800/60 pb-2">Usage Instructions</div>
            <ul className="text-[11px] text-zinc-400 space-y-2.5 list-none">
              <li className="flex items-start gap-1.5"><span className="text-brand-500 font-bold leading-none">•</span> Track your progress interactively step-by-step.</li>
              <li className="flex items-start gap-1.5"><span className="text-brand-500 font-bold leading-none">•</span> Drag to pan the roadmap, scroll to zoom in/out.</li>
              <li className="flex items-start gap-1.5"><span className="text-brand-500 font-bold leading-none">•</span> Click on a node to view core documentation & code.</li>
              <li className="flex items-start gap-1.5"><span className="text-brand-500 font-bold leading-none">•</span> Click on the circle checkbox on any node to toggle status.</li>
            </ul>
          </div>

          {/* Floating Search Bar */}
          <div className="absolute top-6 right-6 z-20">
            <div className="relative w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-brand-500 transition-colors" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-zinc-200 pl-9 pr-4 py-2 w-full text-xs rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 placeholder:text-zinc-500 transition-all shadow-xl"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-zinc-900/95 border border-zinc-800 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-[60] py-1 backdrop-blur-md">
                  {searchResults.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => {
                        setSelectedNode(node);
                        focusNode(node.id);
                        setSearchQuery("");
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors border-b border-zinc-800/40 last:border-0 cursor-pointer"
                    >
                      {node.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar details panel */}
        <div
          className={`w-[360px] border-l border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md flex flex-col overflow-hidden h-full z-40 transition-transform duration-300 shadow-[-10px_0_30px_rgba(0,0,0,0.3)] ${
            selectedNode ? 'translate-x-0' : 'translate-x-full absolute right-0'
          }`}
        >
          {selectedNode && (
            <>
              <div className="shrink-0 px-5 py-4 border-b border-zinc-800/80 flex justify-between items-center bg-zinc-900/40">
                <h2 className="text-sm font-bold text-white truncate pr-4">{selectedNode.title}</h2>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-brand">
                {selectedNode.content ? (
                  <>
                    {selectedNode.content.description && (
                      <div className="space-y-1.5">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-1.5">Description</h3>
                        <p className="text-xs leading-relaxed text-zinc-300">{selectedNode.content.description}</p>
                      </div>
                    )}
                    {selectedNode.content.syntax && (
                      <div className="space-y-1.5">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-1.5">Syntax</h3>
                        <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 font-mono text-[11px] text-[#34d399] leading-relaxed overflow-x-auto whitespace-pre-wrap word-break-all shadow-inner">
                          {selectedNode.content.syntax}
                        </pre>
                      </div>
                    )}
                    {selectedNode.content.examples && selectedNode.content.examples.length > 0 && (
                      <div className="space-y-1.5">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-1.5">Examples</h3>
                        <ul className="space-y-2.5 list-none">
                          {selectedNode.content.examples.map((ex: string, idx: number) => (
                            <li key={idx} className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800/60 p-2.5 rounded-xl leading-relaxed flex items-start gap-2">
                              <span className="text-brand-500 font-bold shrink-0">→</span>
                              <span>{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedNode.content.bestPractices && selectedNode.content.bestPractices.length > 0 && (
                      <div className="space-y-1.5">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-1.5">Best Practices</h3>
                        <ul className="space-y-2.5 list-none">
                          {selectedNode.content.bestPractices.map((bp: string, idx: number) => (
                            <li key={idx} className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800/60 p-2.5 rounded-xl leading-relaxed flex items-start gap-2">
                              <span className="text-emerald-500 font-bold shrink-0">✓</span>
                              <span>{bp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : selectedNode.description ? (
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-1.5">Description</h3>
                    <p className="text-xs leading-relaxed text-zinc-300">{selectedNode.description}</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-1.5">Overview</h3>
                    <p className="text-xs leading-relaxed text-zinc-300">{selectedNode.title} is part of the Frontend Development learning path.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
}

// Sub-component for individual Node rendering
interface RoadmapNodeProps {
  id: string;
  pos: NodePosition;
  node: any;
  isSelected: boolean;
  progressStatus: string;
  onProgressToggle: (e: React.MouseEvent) => void;
  onNodeClick: () => void;
}

function RoadmapNodeComponent({
  id,
  pos,
  node,
  isSelected,
  progressStatus,
  onProgressToggle,
  onNodeClick
}: RoadmapNodeProps) {
  let cardClass = "";
  if (pos.type === "root") {
    cardClass = "border-2 border-brand-500 bg-zinc-900 shadow-[0_0_20px_rgba(255,106,31,0.2)] text-[15px] font-black tracking-tight";
  } else if (pos.type === "main-topic") {
    cardClass = "border-2 border-brand-500 bg-zinc-900 shadow-[0_0_15px_rgba(255,106,31,0.1)] text-[13px] font-black tracking-tight";
  } else if (pos.type === "subtopic") {
    cardClass = "border border-zinc-800 hover:border-brand-500/50 bg-zinc-900/80 text-[12px] font-bold text-zinc-100";
  } else if (pos.type === "leaf") {
    cardClass = "border border-zinc-800/80 hover:border-zinc-700 bg-zinc-950 text-[11px] font-semibold text-zinc-300 hover:text-white";
  }

  let progressClass = "border-zinc-700 bg-zinc-950";
  let progressChar = "";
  if (progressStatus === "completed") {
    progressClass = "border-[#10b981] bg-[#10b981] text-zinc-950 font-black";
    progressChar = "✓";
  } else if (progressStatus === "in-progress") {
    progressClass = "border-[#f59e0b] text-[#f59e0b] bg-gradient-to-r from-[#f59e0b]/50 to-transparent";
    progressChar = "◐";
  }

  return (
    <div
      onClick={onNodeClick}
      className="absolute cursor-pointer transition-all duration-300 z-10 hover:scale-[1.03]"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${pos.width}px`,
        height: `${pos.height}px`
      }}
    >
      <div className={`w-full h-full rounded-xl flex items-center gap-2.5 px-3 py-2 border select-none transition-all duration-300 ${cardClass} ${isSelected ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-zinc-950' : ''}`}>
        <div
          onClick={onProgressToggle}
          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold cursor-pointer shrink-0 transition-all hover:scale-110 ${progressClass}`}
        >
          {progressChar}
        </div>
        <span className="block truncate pointer-events-none">{node.title}</span>
      </div>
    </div>
  );
}
