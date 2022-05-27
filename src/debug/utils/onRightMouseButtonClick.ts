import type { DisplayObject } from "@pixi/display";
import type { InteractionEvent } from "@pixi/interaction";

export function onRightMouseButtonClick(target: DisplayObject, callback: () => void) {
  let isRightMouseButtonDown = false;
  document.addEventListener("mousedown", e => {
    if (e.button === 2) isRightMouseButtonDown = true;
  });

  target.interactive = true;
  target.on("rightclick", (event: InteractionEvent) => {
    if (isRightMouseButtonDown) {
      event.stopPropagation();
      callback();
    }
  });

  document.addEventListener("mouseup", e => {
    if (e.button === 2) isRightMouseButtonDown = false;
  });
}
