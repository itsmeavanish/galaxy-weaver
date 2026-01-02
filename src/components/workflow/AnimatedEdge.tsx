import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

export function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: 'url(#gradient-edge)',
          strokeWidth: 2,
          strokeDasharray: '8 4',
          animation: 'flow 1s linear infinite',
        }}
      />
      <defs>
        <linearGradient id="gradient-edge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(263, 70%, 58%)" />
          <stop offset="100%" stopColor="hsl(292, 84%, 61%)" />
        </linearGradient>
      </defs>
    </>
  );
}
