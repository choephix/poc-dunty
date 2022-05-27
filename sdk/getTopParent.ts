import { DisplayObject } from "pixi.js";

export const getTopParent = (o:DisplayObject): DisplayObject | null => {
  o = o.parent;
  while (o.parent) {
    o = o.parent;
  }
  return o || null;
}
