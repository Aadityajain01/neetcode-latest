"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import type { RoadmapTopic, MetroLineDefinition } from '../../../data/roadmaps';
import Link from 'next/link';

interface RoadmapCanvasProps {
  roadmapId: string;
  title: string;
  description: string;
  level: string;
  estimatedTime: string;
  topics: RoadmapTopic[];
  totalTopics: number;
  layoutType?: "metromap" | "tree";
  metroLines?: MetroLineDefinition[];
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
  totalTopics,
  layoutType,
  metroLines
}: RoadmapCanvasProps) {
  // Zoom & Pan State
  const [transform, setTransform] = useState({ zoom: 0.75, panX: 0, panY: 0 });
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
      } catch (e) {
        console.error(e);
      }
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

    const isMetro = layoutType === "metromap" || topics.some(t => t.x !== undefined && t.y !== undefined);

    if (isMetro) {
      topics.forEach((topic) => {
        if (topic.x !== undefined && topic.y !== undefined) {
          positions.set(topic.id, {
            x: topic.x - 20, // center on x
            y: topic.y - 20, // center on y
            width: 40,
            height: 40,
            type: topic.isInterchange ? "root" : "main-topic"
          });
        }
      });

      // Calculate max bounds
      let maxX = 1200;
      let maxY = 1000;
      positions.forEach((p) => {
        maxX = Math.max(maxX, p.x + 200);
        maxY = Math.max(maxY, p.y + 200);
      });

      return { nodePositions: positions, allNodes: nodesMap, canvasWidth: maxX, canvasHeight: maxY };
    }

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
  }, [topics, roadmapId, title, description, layoutType]);

  // Metro Line Labels styling & positioning metadata
  const lineLabels: Record<string, { x: number; y: number; text: string; color: string }> = {
    "foundations": { x: 350, y: 145, text: "FOUNDATIONS LINE", color: "#4ade80" },
    "advanced": { x: 325, y: 560, text: "ADVANCED LINE", color: "#c084fc" },
    "frontend": { x: 615, y: 295, text: "FRONTEND LINE", color: "#facc15" },
    "backend": { x: 955, y: 440, text: "BACKEND LINE", color: "#3b82f6" },
    "data-deploy": { x: 880, y: 645, text: "DATA & DEPLOY LINE", color: "#f87171" },
    "career": { x: 420, y: 805, text: "CAREER LINE", color: "#ec4899" }
  };

  // Helper function to generate smooth rounded paths dynamically
  const generateRoundedPath = (pts: Array<{ x: number; y: number }>, radius: number = 24): string => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 1; i < pts.length - 1; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const next = pts[i + 1];

      const d1x = prev.x - curr.x;
      const d1y = prev.y - curr.y;
      const len1 = Math.sqrt(d1x * d1x + d1y * d1y);

      const d2x = next.x - curr.x;
      const d2y = next.y - curr.y;
      const len2 = Math.sqrt(d2x * d2x + d2y * d2y);

      const r = Math.min(radius, len1 / 2, len2 / 2);

      if (r <= 0) {
        d += ` L ${curr.x} ${curr.y}`;
        continue;
      }

      // Check if collinear to skip redundant rounding curves
      const crossProduct = Math.abs(d1x * d2y - d1y * d2x);
      if (crossProduct < 1) {
        d += ` L ${curr.x} ${curr.y}`;
        continue;
      }

      const p1x = curr.x + (d1x / len1) * r;
      const p1y = curr.y + (d1y / len1) * r;

      const p2x = curr.x + (d2x / len2) * r;
      const p2y = curr.y + (d2y / len2) * r;

      d += ` L ${p1x} ${p1y} Q ${curr.x} ${curr.y} ${p2x} ${p2y}`;
    }

    d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
    return d;
  };

  // Render SVG connection lines dynamically
  const connectionSvgContent = useMemo(() => {
    if (layoutType === "metromap" && metroLines) {
      return (
        <>
          {/* Subtle Grid Pattern Overlay */}
          <g opacity="0.08">
            {Array.from({ length: 15 }).map((_, idx) => (
              <line key={`v-${idx}`} x1={50 + idx * 80} y1={0} x2={50 + idx * 80} y2={1100} stroke="#71717a" strokeWidth={1} />
            ))}
            {Array.from({ length: 15 }).map((_, idx) => (
              <line key={`h-${idx}`} x1={0} y1={50 + idx * 80} x2={1250} y2={50 + idx * 80} stroke="#71717a" strokeWidth={1} />
            ))}
          </g>

          {/* Metro Line Tracks */}
          {metroLines.map((line) => {
            const pts: Array<{ x: number; y: number }> = [];
            line.stations.forEach((station) => {
              if (typeof station === "string") {
                const topic = topics.find((t) => t.id === station);
                if (topic && topic.x !== undefined && topic.y !== undefined) {
                  pts.push({ x: topic.x, y: topic.y });
                }
              } else if (station && typeof station.x === "number" && typeof station.y === "number") {
                pts.push({ x: station.x, y: station.y });
              }
            });

            if (pts.length < 2) return null;
            const pathD = generateRoundedPath(pts, 32);

            const startPt = pts[0];
            const endPt = pts[pts.length - 1];

            // Direction vector at Start (points backwards)
            const dx = pts[1].x - startPt.x;
            const dy = pts[1].y - startPt.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const ux = len > 0 ? -dx / len : 0;
            const uy = len > 0 ? -dy / len : -1;
            const startLabelX = startPt.x + ux * 38;
            const startLabelY = startPt.y + uy * 38;

            // Direction vector at End (points forwards)
            const lastIdx = pts.length - 1;
            const dxEnd = endPt.x - pts[lastIdx - 1].x;
            const dyEnd = endPt.y - pts[lastIdx - 1].y;
            const lenEnd = Math.sqrt(dxEnd * dxEnd + dyEnd * dyEnd);
            const uxEnd = lenEnd > 0 ? dxEnd / lenEnd : 0;
            const uyEnd = lenEnd > 0 ? dyEnd / lenEnd : 1;
            const endLabelX = endPt.x + uxEnd * 38;
            const endLabelY = endPt.y + uyEnd * 38;

            return (
              <g key={line.id}>
                {/* Thick glow effect */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={14}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.06"
                />
                {/* Sharp core transit line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={line.color}
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Start Terminal Indicator */}
                <g>
                  <circle cx={startPt.x} cy={startPt.y} r={18} fill="none" stroke={line.color} strokeWidth={2.5} strokeDasharray="3 2" />
                  <text
                    x={startLabelX}
                    y={startLabelY + 3.5}
                    fill={line.color}
                    fontSize="9"
                    fontWeight="900"
                    textAnchor="middle"
                    className="font-sans select-none tracking-wider"
                    style={{ textShadow: "0 1px 2px #000, 0 1px 4px #000" }}
                  >
                    START
                  </text>
                </g>

                {/* End Terminal Indicator */}
                <g>
                  <line 
                    x1={endPt.x - uyEnd * 12} 
                    y1={endPt.y + uxEnd * 12} 
                    x2={endPt.x + uyEnd * 12} 
                    y2={endPt.y - uxEnd * 12} 
                    stroke={line.color} 
                    strokeWidth={4} 
                    strokeLinecap="round" 
                  />
                  <circle cx={endPt.x} cy={endPt.y} r={18} fill="none" stroke={line.color} strokeWidth={2.5} />
                  <text
                    x={endLabelX}
                    y={endLabelY + 3.5}
                    fill={line.color}
                    fontSize="9"
                    fontWeight="900"
                    textAnchor="middle"
                    className="font-sans select-none tracking-wider"
                    style={{ textShadow: "0 1px 2px #000, 0 1px 4px #000" }}
                  >
                    END
                  </text>
                </g>
              </g>
            );
          })}

          {/* Dynamic Metro Line Labels */}
          {metroLines.map((line) => {
            let labelConfig = lineLabels[line.id];
            
            if (!labelConfig) {
              const stations = line.stations;
              if (stations && stations.length > 0) {
                // Find midpoint station
                const midIdx = Math.floor(stations.length / 2);
                const midStation = stations[midIdx];
                const midStationId = typeof midStation === "string" ? midStation : (midStation as any).id;
                
                const topic = topics.find((t) => t.id === midStationId);
                if (topic && topic.x !== undefined && topic.y !== undefined) {
                  labelConfig = {
                    x: topic.x,
                    y: topic.y + 42, // offset below the node
                    text: line.name || `${line.id.toUpperCase()} LINE`,
                    color: line.color
                  };
                }
              }
            }

            if (!labelConfig) return null;
            return (
              <text
                key={`label-${line.id}`}
                x={labelConfig.x}
                y={labelConfig.y}
                fill={labelConfig.color}
                fontSize="11"
                fontWeight="950"
                letterSpacing="0.18em"
                textAnchor="middle"
                opacity="0.8"
                className="font-sans select-none"
                style={{ textShadow: "0 2px 4px rgba(9, 9, 11, 0.95), 0 0 6px rgba(9, 9, 11, 0.95)" }}
              >
                {labelConfig.text}
              </text>
            );
          })}
        </>
      );
    }

    // Fallback to original tree-like edge connection lines
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
            key={`center-wavy-${topics[i].id}-${topics[i + 1].id}`}
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
  }, [nodePositions, topics, roadmapId, layoutType, metroLines]);

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
    const targetHeight = rect.height > 0 ? rect.height : window.innerHeight - 150;

    const mapWidth = maxX - minX;
    const mapHeight = maxY - minY;

    let newZoom = Math.min(
      (targetWidth - 100) / mapWidth,
      (targetHeight - 100) / mapHeight
    );

    newZoom = layoutType === "metromap" ? 0.75 : Math.max(0.5, Math.min(1.1, newZoom));

    setTransform({
      zoom: newZoom,
      panX: targetWidth / 2 - ((maxX + minX) / 2) * newZoom,
      panY: targetHeight / 2 - ((maxY + minY) / 2) * newZoom
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
                    layoutType={layoutType}
                    metroLines={metroLines}
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
          className={`w-[360px] border-l border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md flex flex-col overflow-hidden h-full z-40 transition-transform duration-300 shadow-[-10px_0_30px_rgba(0,0,0,0.3)] ${selectedNode ? 'translate-x-0' : 'translate-x-full absolute right-0'
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
              <div className="shrink-0 px-5 py-3 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-900/10">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</span>
                <button
                  onClick={(e) => cycleProgressState(selectedNode.id, e)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${progress[selectedNode.id] === "completed"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                      : progress[selectedNode.id] === "in-progress"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${progress[selectedNode.id] === "completed"
                      ? "bg-emerald-400"
                      : progress[selectedNode.id] === "in-progress"
                        ? "bg-amber-400 animate-pulse"
                        : "bg-zinc-500"
                    }`} />
                  {progress[selectedNode.id] === "completed"
                    ? "Completed"
                    : progress[selectedNode.id] === "in-progress"
                      ? "In Progress"
                      : "Not Started"}
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
                    {((selectedNode.content?.resources && selectedNode.content.resources.length > 0) || (selectedNode.resources && selectedNode.resources.length > 0)) && (
                      <div className="space-y-1.5">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-1.5">Recommended Resources</h3>
                        <ul className="space-y-2 list-none">
                          {(((selectedNode.content?.resources || selectedNode.resources) || []) as any[]).map((res: any, idx: number) => (
                            <li key={idx} className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800/60 p-2.5 rounded-xl leading-relaxed flex items-center justify-between gap-3 hover:border-zinc-700/60 transition-all duration-200">
                              <a href={res.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 hover:underline font-bold truncate flex-1">
                                {res.title}
                              </a>
                              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 bg-zinc-950 shrink-0">
                                {res.type || "docs"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : selectedNode.description ? (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-1.5">Description</h3>
                      <p className="text-xs leading-relaxed text-zinc-300">{selectedNode.description}</p>
                    </div>
                    {selectedNode.resources && selectedNode.resources.length > 0 && (
                      <div className="space-y-1.5">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-1.5">Recommended Resources</h3>
                        <ul className="space-y-2 list-none">
                          {(selectedNode.resources as any[]).map((res: any, idx: number) => (
                            <li key={idx} className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800/60 p-2.5 rounded-xl leading-relaxed flex items-center justify-between gap-3 hover:border-zinc-700/60 transition-all duration-200">
                              <a href={res.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 hover:underline font-bold truncate flex-1">
                                {res.title}
                              </a>
                              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 bg-zinc-950 shrink-0">
                                {res.type || "docs"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-1.5">Overview</h3>
                      <p className="text-xs leading-relaxed text-zinc-300">{selectedNode.title} is part of the learning path.</p>
                    </div>
                    {selectedNode.resources && selectedNode.resources.length > 0 && (
                      <div className="space-y-1.5">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-1.5">Recommended Resources</h3>
                        <ul className="space-y-2 list-none">
                          {(selectedNode.resources as any[]).map((res: any, idx: number) => (
                            <li key={idx} className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800/60 p-2.5 rounded-xl leading-relaxed flex items-center justify-between gap-3 hover:border-zinc-700/60 transition-all duration-200">
                              <a href={res.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 hover:underline font-bold truncate flex-1">
                                {res.title}
                              </a>
                              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 bg-zinc-950 shrink-0">
                                {res.type || "docs"}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
  layoutType?: "metromap" | "tree";
  metroLines?: MetroLineDefinition[];
}

function RoadmapNodeComponent({
  id,
  pos,
  node,
  isSelected,
  progressStatus,
  onProgressToggle,
  onNodeClick,
  layoutType,
  metroLines
}: RoadmapNodeProps) {
  const isMetro = layoutType === "metromap";

  if (isMetro) {
    const isInterchange = node.isInterchange || false;
    const labelPos = node.labelPos || "above";
    const subtitle = node.subtitle || "";

    // Resolve node line color
    const getNodeColor = () => {
      if (metroLines) {
        const line = metroLines.find(l => l.stations.includes(id));
        if (line) return line.color;
      }
      return "#4ade80"; // fallback green
    };

    const lineColor = getNodeColor();

    // Checkbox styling based on progress
    let dotBg = "bg-zinc-950";
    let dotBorder = isInterchange ? "border-white" : "border-zinc-700";
    let innerDot: React.ReactNode = null;
    let glowClass = "";

    if (progressStatus === "completed") {
      dotBg = "bg-[#10b981]";
      dotBorder = "border-[#10b981]";
      glowClass = "shadow-[0_0_15px_rgba(16,185,129,0.6)]";
      innerDot = (
        <span className="text-[10px] font-black text-zinc-950 select-none pointer-events-none">
          ✓
        </span>
      );
    } else if (progressStatus === "in-progress") {
      dotBg = "bg-zinc-950";
      dotBorder = "border-[#fbbf24]";
      glowClass = "shadow-[0_0_15px_rgba(251,191,36,0.5)]";
      innerDot = (
        <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] animate-pulse" />
      );
    } else {
      // Not started
      dotBg = "bg-zinc-950";
      dotBorder = isInterchange ? "border-white border-2" : `border-[3px]`;
      glowClass = isInterchange ? "shadow-[0_0_10px_rgba(255,255,255,0.25)]" : "";
      innerDot = (
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: isInterchange ? "#ffffff" : lineColor }}
        />
      );
    }

    // Label position CSS styling
    let labelClasses = "absolute flex flex-col pointer-events-auto cursor-pointer select-none whitespace-nowrap min-w-[140px]";

    switch (labelPos) {
      case "above":
        labelClasses += " bottom-full left-1/2 -translate-x-1/2 -translate-y-3 items-center text-center";
        break;
      case "below":
        labelClasses += " top-full left-1/2 -translate-x-1/2 translate-y-3 items-center text-center";
        break;
      case "left":
        labelClasses += " right-full top-1/2 -translate-y-1/2 -translate-x-4 items-end text-right";
        break;
      case "right":
        labelClasses += " left-full top-1/2 -translate-y-1/2 translate-x-4 items-start text-left";
        break;
      case "above-left":
        labelClasses += " bottom-full right-1/2 -translate-x-2 -translate-y-2 items-end text-right";
        break;
      case "above-right":
        labelClasses += " bottom-full left-1/2 translate-x-2 -translate-y-2 items-start text-left";
        break;
      case "below-left":
        labelClasses += " top-full right-1/2 -translate-x-2 translate-y-2 items-end text-right";
        break;
      case "below-right":
        labelClasses += " top-full left-1/2 translate-x-2 translate-y-2 items-start text-left";
        break;
    }

    const sizeClass = isInterchange ? "w-9 h-9" : "w-7 h-7";

    return (
      <div
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${pos.width}px`,
          height: `${pos.height}px`,
          zIndex: isSelected ? 30 : 10
        }}
      >
        {/* Clickable station circle */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onNodeClick();
          }}
          style={{ borderColor: progressStatus === "not-started" && !isInterchange ? lineColor : undefined }}
          className={`pointer-events-auto flex items-center justify-center rounded-full border-2 transition-all duration-300 hover:scale-110 cursor-pointer ${dotBg} ${dotBorder} ${glowClass} ${sizeClass}`}
        >
          {innerDot}
        </div>

        {/* Button Box Label */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onNodeClick();
          }}
          className={`${labelClasses} group/label`}
        >
          <div
            className={`px-3.5 py-2 rounded-xl border bg-zinc-900/90 backdrop-blur-md shadow-xl flex flex-col transition-all duration-300 hover:scale-[1.04] hover:bg-zinc-850/95 ${
              isSelected
                ? "border-brand-500 shadow-[0_0_15px_rgba(255,106,31,0.25)]"
                : "border-zinc-800/80 hover:border-zinc-700"
            } ${
              labelPos === "above" || labelPos === "below" || labelPos.includes("above-") || labelPos.includes("below-")
                ? "items-center text-center"
                : labelPos === "left"
                ? "items-end text-right"
                : "items-start text-left"
            }`}
            style={{
              borderLeft: `4px solid ${lineColor}`
            }}
          >
            <span className={`text-xs font-extrabold tracking-tight transition-colors duration-200 ${isSelected ? 'text-brand-400' : 'text-zinc-200 group-hover/label:text-white'}`}>
              {node.title}
            </span>
            {subtitle && (
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider mt-1.5 leading-none">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback tree-like node rendering
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
