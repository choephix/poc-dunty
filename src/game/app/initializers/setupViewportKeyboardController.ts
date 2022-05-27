import { extendRenderMethod } from "@sdk/pixi/extendRenderMethod";
import { WorldViewport } from "./setupViewport";

export function setupViewportKeyboardController(viewport: WorldViewport, coeffiecient: number = 10) {
  type InputDirection = {
    pressed: boolean;
    readonly x: number;
    readonly y: number;
  };
  const VELOCITY_MODIFIERS = {
    ArrowDown: { pressed: false, x: 0, y: -1 },
    ArrowLeft: { pressed: false, x: -1, y: 0 },
    ArrowRight: { pressed: false, x: 1, y: 0 },
    ArrowUp: { pressed: false, x: 0, y: 1 },
  } as Readonly<Record<string, InputDirection>>;
  let VELOCITY_MODIFIERS_PRESSED = 0;

  let ctrlPressed = false;
  let shiftPressed = false;

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  function onKeyDown(event: KeyboardEvent) {
    const key = event.key;
    if (key in VELOCITY_MODIFIERS) {
      event.preventDefault();
      VELOCITY_MODIFIERS[key].pressed = true;
      VELOCITY_MODIFIERS_PRESSED++;
    }

    ctrlPressed = event.ctrlKey;
    shiftPressed = event.shiftKey;
  }

  function onKeyUp(event: KeyboardEvent) {
    const key = event.key;
    if (key in VELOCITY_MODIFIERS) {
      event.preventDefault();
      VELOCITY_MODIFIERS[key].pressed = false;
      VELOCITY_MODIFIERS_PRESSED--;
    }

    ctrlPressed = event.ctrlKey;
    shiftPressed = event.shiftKey;
  }

  extendRenderMethod(viewport, () => {
    if (VELOCITY_MODIFIERS_PRESSED > 0) {
      const velocity = coeffiecient * (shiftPressed ? 4 : ctrlPressed ? 0.2 : 1);
      for (const { pressed, x, y } of Object.values(VELOCITY_MODIFIERS)) {
        if (pressed) {
          viewport.x -= x * velocity;
          viewport.y += y * velocity;
        }
      }
      viewport.assureWithinAllowedRegion();
    }
  });

  Object.assign(viewport, { VELOCITY_MODIFIERS });
}
