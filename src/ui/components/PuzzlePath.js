// Lightweight utility to build a jigsaw-like path for a square piece
// using cubic curves to approximate knobs/holes on each side.

export function buildJigsawPath(size, connectors, knobRatio = 0.22, cornerRadius = 0.12) {
  const k = size * knobRatio; // knob amplitude
  const s = size;
  const r = Math.max(3, Math.min(Math.floor(s * cornerRadius), Math.floor(s * 0.2)));
  const { top, right, bottom, left } = connectors;

  const parts = [];
  // Start point: round the top-left outer corner only if both top and left are flat (true corner piece)
  if (top === 'flat' && left === 'flat') {
    parts.push(`M ${r} 0`);
  } else {
    parts.push('M 0 0');
  }

  // Top edge
  if (top === 'flat') {
    if (right === 'flat') {
      // Top-right is a true outer corner; round it
      parts.push(`L ${s - r} 0 Q ${s} 0 ${s} ${r}`);
    } else {
      parts.push(`L ${s} 0`);
    }
  } else {
    const x1 = s * 0.35;
    const x2 = s * 0.65;
    const cp = top === 'convex' ? -k : k;
    parts.push(`L ${x1} 0 C ${s * 0.42} ${cp} ${s * 0.58} ${cp} ${x2} 0 L ${s} 0`);
  }

  // Right edge
  if (right === 'flat') {
    if (bottom === 'flat') {
      // Bottom-right is a true outer corner; round it
      parts.push(`L ${s} ${s - r} Q ${s} ${s} ${s - r} ${s}`);
    } else {
      parts.push(`L ${s} ${s}`);
    }
  } else {
    const y1 = s * 0.35;
    const y2 = s * 0.65;
    const cp = right === 'convex' ? k : -k;
    parts.push(`L ${s} ${y1} C ${s + cp} ${s * 0.42} ${s + cp} ${s * 0.58} ${s} ${y2} L ${s} ${s}`);
  }

  // Bottom edge
  if (bottom === 'flat') {
    if (left === 'flat') {
      // Bottom-left is a true outer corner; round it
      parts.push(`L ${r} ${s} Q 0 ${s} 0 ${s - r}`);
    } else {
      parts.push(`L 0 ${s}`);
    }
  } else {
    const x2 = s * 0.65;
    const x1 = s * 0.35;
    const cp = bottom === 'convex' ? k : -k;
    parts.push(`L ${x2} ${s} C ${s * 0.58} ${s + cp} ${s * 0.42} ${s + cp} ${x1} ${s} L 0 ${s}`);
  }

  // Left edge
  if (left === 'flat') {
    if (top === 'flat') {
      // Top-left is a true outer corner; round it
      parts.push(`L 0 ${r} Q 0 0 ${r} 0`);
    } else {
      parts.push('L 0 0');
    }
  } else {
    const y2 = s * 0.35;
    const y1 = s * 0.65;
    const cp = left === 'convex' ? -k : k;
    parts.push(`L 0 ${y1} C ${cp} ${s * 0.58} ${cp} ${s * 0.42} 0 ${y2} L 0 0`);
  }

  parts.push('Z');
  return parts.join(' ');
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
