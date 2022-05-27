import { DisplayObject } from "@pixi/display";

export function extendDestroyMethod(target: DisplayObject, callback: () => void) {
  const original = target.destroy;
  target.destroy = function (...args) {
    callback();
    original.call(this, ...args);
  };
}
