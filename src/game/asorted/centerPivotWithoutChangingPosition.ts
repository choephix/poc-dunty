import { DisplayObject } from "@pixi/display";
import { IPointData } from "@pixi/math";

type AnchorInput = IPointData | [number, number] | number;

const defaultAnchor = Object.freeze({ x: 0.5, y: 0.5 });

export function modifyPivotWithoutChangingPosition(target: DisplayObject, anchor: AnchorInput = defaultAnchor) {
  const prevPivot = target.pivot.clone();

  if (typeof anchor === "number") {
    anchor = { x: anchor, y: anchor };
  } else if (Array.isArray(anchor)) {
    anchor = { x: anchor[0], y: anchor[1] };
  }

  const bounds = target.getLocalBounds();
  target.pivot.set(bounds.x + bounds.width * anchor.x, bounds.y + bounds.height * anchor.y);
  target.position.set(
    target.position.x + (target.pivot.x - prevPivot.x) * target.scale.x,
    target.position.y + (target.pivot.y - prevPivot.y) * target.scale.y
  );
}
