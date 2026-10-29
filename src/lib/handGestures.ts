// Reading hands from MediaPipe landmarks: which pose a hand is making, and how
// far apart two palms are. Landmarks are normalised image coordinates.

export interface Pt {
  x: number;
  y: number;
  z?: number;
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

// Tip, middle joint pairs for index, middle, ring and little finger
const FINGERS: [number, number][] = [
  [8, 6],
  [12, 10],
  [16, 14],
  [20, 18],
];

// One hand's pose:
//   palm       all four fingers and the thumb open (rotates the Earth)
//   1-4        that many fingers raised, thumb tucked
//   thumbs-up  fingers curled, thumb out and pointing up
//   fist       everything curled
export type Pose = { kind: 'palm' } | { kind: 'count'; n: number } | { kind: 'thumbsUp' } | { kind: 'fist' };

export function readPose(lm: Pt[]): Pose {
  const wrist = lm[0];
  const palm = dist(lm[0], lm[9]);
  // A finger counts when its tip is clearly farther from the wrist than its
  // middle joint, which holds at any hand angle
  let n = 0;
  for (const [tip, pip] of FINGERS) {
    if (dist(lm[tip], wrist) > dist(lm[pip], wrist) * 1.12) n++;
  }
  // Thumb: out when its tip is well away from the palm, both from the index
  // knuckle and from the middle of the palm
  const thumbOut = dist(lm[4], lm[5]) > palm * 0.6 && dist(lm[4], lm[9]) > palm * 0.85;

  // Four fingers: an open palm unless the thumb is clearly folded in, lying
  // along the index knuckle or across the palm (a relaxed open thumb is often
  // not far out, so this is the looser test)
  if (n === 4) {
    const across = Math.min(dist(lm[4], lm[9]), dist(lm[4], lm[13]), dist(lm[4], lm[17]));
    const tucked = dist(lm[4], lm[5]) < palm * 0.4 || across < palm * 0.6;
    return tucked ? { kind: 'count', n: 4 } : { kind: 'palm' };
  }
  if (n > 0) return { kind: 'count', n };
  // Thumbs up: the thumb tip sits clearly above its base and every knuckle
  const up =
    lm[4].y < lm[2].y - palm * 0.5 && [5, 9, 13, 17].every((i) => lm[4].y < lm[i].y - palm * 0.15);
  if (thumbOut && up) return { kind: 'thumbsUp' };
  return { kind: 'fist' };
}

// Centre of the palm, for tracking movement and the spread between two hands
export function palmCentre(lm: Pt[]): Pt {
  const ids = [0, 5, 9, 13, 17];
  let x = 0;
  let y = 0;
  for (const i of ids) {
    x += lm[i].x;
    y += lm[i].y;
  }
  return { x: x / ids.length, y: y / ids.length };
}

export const handSpread = (a: Pt[], b: Pt[]) => dist(palmCentre(a), palmCentre(b));

// Bones to draw in the preview
export const BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];
