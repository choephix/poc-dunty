import { DisplayObject } from "@pixi/display";
import { Graphics } from "@pixi/graphics";
import { Rectangle } from "@pixi/math";

type Thennable = { then: (onFulfilled: (value: any) => void) => Thennable };

export function createDisplayObjectMask(o: DisplayObject, bounds?: Rectangle) {
  if (!bounds) {
    bounds = o.getLocalBounds();
    bounds.x += o.x;
    bounds.y += o.y;
    bounds.width *= o.scale.x;
    bounds.height *= o.scale.y;
  }

  const g = new Graphics();
  g.beginFill(0x00ffff);
  g.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);

  return g;
}

export function addDisplayObjectMask(o: DisplayObject) {
  const mask = createDisplayObjectMask(o);

  o.parent?.addChild(mask);
  o.mask = mask;

  const remove = () => {
    if (o.mask === mask) o.mask = null;
    mask.destroy();
  };

  return Object.assign(remove, {
    async during(promise: Thennable) {
      try {
        return await promise;
      } finally {
        remove();
      }
    },
  });
}
