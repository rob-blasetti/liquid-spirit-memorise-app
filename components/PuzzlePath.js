// Lightweight utility to build a jigsaw-like path for a square piece
// using cubic curves to approximate knobs/holes on each side.

export function buildJigsawPath(size, connectors, knobRatio = 0.22) {
  const k = size * knobRatio; // knob amplitude
  const s = size;
  const { top, right, bottom, left } = connectors;

  // Helpers for segments
  const topSeg = () => {
    if (top === 'flat') return `L ${s} 0`;
    const x1 = s * 0.35;
    const x2 = s * 0.65;
    const cp = top === 'convex' ? -k : k;
    return `L ${x1} 0 C ${s * 0.42} ${cp} ${s * 0.58} ${cp} ${x2} 0 L ${s} 0`;
  };
  const rightSeg = () => {
    if (right === 'flat') return `L ${s} ${s}`;
    const y1 = s * 0.35;
    const y2 = s * 0.65;
    const cp = right === 'convex' ? k : -k;
    return `L ${s} ${y1} C ${s + cp} ${s * 0.42} ${s + cp} ${s * 0.58} ${s} ${y2} L ${s} ${s}`;
  };
  const bottomSeg = () => {
    if (bottom === 'flat') return `L 0 ${s}`;
    const x2 = s * 0.65;
    const x1 = s * 0.35;
    const cp = bottom === 'convex' ? k : -k;
    return `L ${x2} ${s} C ${s * 0.58} ${s + cp} ${s * 0.42} ${s + cp} ${x1} ${s} L 0 ${s}`;
  };
  const leftSeg = () => {
    if (left === 'flat') return `L 0 0`;
    const y2 = s * 0.35;
    const y1 = s * 0.65;
    const cp = left === 'convex' ? -k : k;
    return `L 0 ${y1} C ${cp} ${s * 0.58} ${cp} ${s * 0.42} 0 ${y2} L 0 0`;
  };

  const d = [
    `M 0 0`,
    topSeg(),
    rightSeg(),
    bottomSeg(),
    leftSeg(),
    'Z',
  ].join(' ');
  return d;
}

export function invertConnectors(conn) {
  const inv = (v) => (v === 'convex' ? 'concave' : v === 'concave' ? 'convex' : 'flat');
  return {
    top: inv(conn.top),
    right: inv(conn.right),
    bottom: inv(conn.bottom),
    left: inv(conn.left),
  };
}
