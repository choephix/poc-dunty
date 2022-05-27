import { DisplayObject } from "@pixi/display";
import { Rectangle } from "@pixi/math";

type Target = DisplayObject & { width?: number; height?: number };
type IPointInput = number | [number, number] | { x?: number; y?: number };
type IOptions = {
  x?: number;
  y?: number;
  alignment?: IPointInput;
  spacing?: number;
  cellSize?: number;
  vertical?: boolean;
};

const __bounds = new Rectangle();

function processPointInput(p: IPointInput | undefined) {
  if (p == undefined) return { x: 0, y: 0 };
  if (typeof p === "number") return { x: p, y: p };
  if (Array.isArray(p)) {
    const [x, y = x] = p;
    return { x, y };
  }
  const { x = 0, y = x } = p;
  return { x, y };
}

export function arrangeInStraightLine(targets: readonly Target[], options?: IOptions) {
  const { alignment: alignmentInput = 0.5, spacing = 0, cellSize = 0, vertical = false } = options || {};
  const alignment = processPointInput(alignmentInput);

  const [kx, ky] = !vertical ? (["x", "y"] as const) : (["y", "x"] as const);
  const [klen, kside] = !vertical ? (["width", "height"] as const) : (["height", "width"] as const);

  const startPosition = {
    x: options?.x || 0,
    y: options?.y || 0,
  };

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

    bounds[kx] = startPosition[kx] + posHead - bounds[kx];
    bounds[ky] = startPosition[ky] + -bounds[ky];

    if (bounds[klen] < cellSize) {
      bounds[kx] += alignment[kx] * (cellSize - bounds[klen]);
      bounds[klen] = cellSize;
    }

    o.position.copyFrom(bounds);

    posHead += bounds[klen] + spacing;
    const side = o[kside];
    if (side && largestSide < side) {
      largestSide = side;
    }
  }

  for (const o of targets) {
    const side = o[kside] || 0;
    o[ky] += alignment[ky] * (largestSide - side);
  }
}
