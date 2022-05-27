import { DisplayObject } from '@pixi/display';
import { Rectangle } from '@pixi/math';

type Target = DisplayObject & { width?: number; height?: number };
type IPointInput = number | [number, number] | { x?: number; y?: number };
type IOptions = {
  alignment?: IPointInput;
  spacing?: number;
  cellSize?: number;
  vertical?: boolean;
};

const __bounds = new Rectangle();

function processPointInput(p: IPointInput | undefined) {
  if (p == undefined) return { x: 0, p: 0 };
  if (typeof p === 'number') return { x: p, y: p };
  if (Array.isArray(p)) {
    const [x, y = x] = p;
    return { x, y };
  }
  const { x = 0, y = x } = p;
  return { x, y };
}

export function arrangeInStraightLine(
  targets: readonly Target[],
  options?: IOptions
) {
  const {
    alignment: alignmentInput = 0.5,
    spacing = 0,
    cellSize = 0,
    vertical = false,
  } = options || {};
  const alignment = processPointInput(alignmentInput);

  const [kx, ky] = !vertical ? (['x', 'y'] as const) : (['y', 'x'] as const);
  const [klen, kside] = !vertical
    ? (['width', 'height'] as const)
    : (['height', 'width'] as const);

  let largestSide = 0;
  let posHead = 0;
  for (const o of targets) {
    const bounds = o.getLocalBounds(__bounds);
    bounds.width *= o.scale.x;
    bounds.height *= o.scale.y;
    bounds.x -= o.pivot.x;
    bounds.y -= o.pivot.y;
    bounds.x *= o.scale.x;
    bounds.y *= o.scale.y;

    bounds[kx] = posHead - bounds[kx];
    bounds[ky] = -bounds[ky];

    if (bounds[klen] < cellSize) {
      bounds[kx] += alignment[kx] * (cellSize - bounds[klen]);
      bounds[klen] = cellSize;
    }

    o.position.copyFrom(bounds);

    posHead += bounds[klen] + spacing;
    if (o[kside] && largestSide < o[kside]) {
      largestSide = o[kside];
    }
  }

  for (const o of targets) {
    o[ky] += alignment[ky] * (largestSide - o[kside]);
  }
}
