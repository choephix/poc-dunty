import { Renderer } from "@pixi/core";
import { DisplayObject } from "@pixi/display";

export function extendRenderMethod(target: DisplayObject, callback: () => void) {
  const original = target.render;
  target.render = function (renderer: Renderer) {
    callback();
    original.call(this, renderer);
  };
}
