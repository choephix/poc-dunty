import { DisplayObject } from "@pixi/display";

export const getWorldScaleX = (o: DisplayObject): number => {
  let scale = 1,
    parent = o.parent;
  while (parent) {
    scale *= parent.scale.x;
    parent = parent.parent;
  }
  return scale;
};
