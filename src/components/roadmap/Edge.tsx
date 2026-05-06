import type { RoadmapEdgeStyle, RoadmapNode } from '../../../data/roadmaps';

interface EdgeProps {
  fromNode: RoadmapNode;
  toNode: RoadmapNode;
  isHovered: boolean;
  style?: RoadmapEdgeStyle;
  emphasis?: boolean;
}

const NODE_DIMENSIONS = {
  sm: { halfWidth: 72, halfHeight: 20 },
  md: { halfWidth: 88, halfHeight: 22 },
  lg: { halfWidth: 112, halfHeight: 26 },
} as const;

function getNodeDimensions(node: RoadmapNode) {
  return NODE_DIMENSIONS[node.size ?? 'md'];
}

export function Edge({ fromNode, toNode, isHovered, style = 'solid', emphasis = false }: EdgeProps) {
  const fromSize = getNodeDimensions(fromNode);
  const toSize = getNodeDimensions(toNode);
  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const isVertical = Math.abs(dx) < 24;

  const startX = isVertical
    ? fromNode.x
    : fromNode.x + (dx > 0 ? fromSize.halfWidth : -fromSize.halfWidth);
  const startY = isVertical ? fromNode.y + fromSize.halfHeight : fromNode.y;
  const endX = isVertical
    ? toNode.x
    : toNode.x + (dx > 0 ? -toSize.halfWidth : toSize.halfWidth);
  const endY = isVertical ? toNode.y - toSize.halfHeight : toNode.y;

  const horizontalBias = Math.abs(dx) > Math.abs(dy);
  const c1x = horizontalBias ? startX + dx / 2 : startX;
  const c1y = horizontalBias ? startY : startY + (endY - startY) / 2;
  const c2x = horizontalBias ? endX - dx / 2 : endX;
  const c2y = horizontalBias ? endY : endY - (endY - startY) / 2;

  const pathData = `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
  const strokeColor = isHovered ? '#34d399' : emphasis ? '#10b981' : '#3f3f46';
  const strokeWidth = isHovered ? 3.25 : emphasis ? 2.75 : 1.9;

  return (
    <g>
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={15}
      />
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={style === 'dashed' ? '4 8' : undefined}
        strokeLinecap="round"
        className="transition-all duration-300"
        style={{
          filter: isHovered || emphasis ? 'drop-shadow(0 0 10px rgba(16,185,129,0.18))' : 'none'
        }}
      />
    </g>
  );
}
