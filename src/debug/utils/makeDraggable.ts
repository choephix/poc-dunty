import { Container, DisplayObject } from "@pixi/display";
import { Point } from "@pixi/math";
import { getTopParent } from "@sdk/utils/pixi/getTopParent";
import { getWorldScaleX } from "@sdk/utils/pixi/getWorldScaleX";
import { InteractionEvent } from "@pixi/interaction";
import { onKeyPress } from "./onKeyPress";
import { waitUntil } from "@sdk/utils/frameloops/waitUntil";
import { Graphics } from "@pixi/graphics";

type Callbacks = {
  onDragStart?: (event: InteractionEvent) => void;
  onDragMove?: (event: InteractionEvent) => void;
  onDragEnd?: (event: InteractionEvent) => void;
};

const eventPrefix = "mouse";
const mouseButton = 0;

export async function makeDraggable(object: DisplayObject, mul: number | (() => number) = 1, cbs: Callbacks = {}) {
  object.interactive = true;
  object.buttonMode = true;

  const lastPosition: Point = new Point();
  const newPosition: Point = new Point();
  let isDragging: boolean = false;

  await waitUntil(() => object.parent);

  const stage = getTopParent(object);
  if (!stage) return;

  object.interactive = true;
  object.on(eventPrefix + "down", (event: InteractionEvent) => {
    if (event.data.button !== mouseButton) return;

    const parent = object.parent;
    if (!parent) return;
    parent.setChildIndex(object, parent.children.length - 1);

    lastPosition.copyFrom(event.data.global);
    // event.stopPropagation();
    isDragging = true;

    cbs.onDragStart?.(event);
  });

  object.on(eventPrefix + "up", (event: InteractionEvent) => {
    isDragging = false;
    cbs.onDragEnd?.(event);
  });

  object.on(eventPrefix + "upoutside", (event: InteractionEvent) => {
    isDragging = false;
  });

  object.on(eventPrefix + "move", (event: InteractionEvent) => {
    if (isDragging) {
      const $mul = typeof mul === "function" ? mul() : mul;
      const factor = ((!event.data.originalEvent.shiftKey ? 1 : 0.25) * $mul) / getWorldScaleX(object);
      newPosition.copyFrom(event.data.global);
      object.x += factor * (newPosition.x - lastPosition.x);
      object.y += factor * (newPosition.y - lastPosition.y);
      lastPosition.copyFrom(newPosition);
      cbs.onDragMove?.(event);
    }
  });

  const name = object.name || "object";
  // onKeyPress(' ', () => console.log((object as any).name, `.position`, [object.x, object.y]));
  onKeyPress(" ", () => {
    if (object.destroyed) {
      console.warn(`${name} is destroyed`);
      return;
    }

    const x = Math.round(object.x);
    const y = Math.round(object.y);
    console.log(`${name}.position.set(${x}, ${y})`);
  });

  return object;
}

export namespace makeDraggable {
  export async function advanced(object: DisplayObject, onDrag: (delta: [dx: number, dy: number]) => void) {
    object.interactive = true;
    object.buttonMode = true;

    const lastPosition: Point = new Point();
    const newPosition: Point = new Point();
    let isDragging: boolean = false;

    await waitUntil(() => object.parent);

    const stage = getTopParent(object);
    if (!stage) return;

    object.interactive = true;
    object.on("pointerdown", (event: InteractionEvent) => {
      lastPosition.copyFrom(event.data.global);
      // event.stopPropagation();
      isDragging = true;
    });

    object.on("pointerup", (event: InteractionEvent) => {
      isDragging = false;
    });

    object.on("pointerupoutside", (event: InteractionEvent) => {
      isDragging = false;
    });

    object.on("pointermove", (event: InteractionEvent) => {
      if (isDragging) {
        const factor = !event.data.originalEvent.shiftKey ? 1 : 0.25;
        newPosition.copyFrom(event.data.global);
        onDrag([factor * (newPosition.x - lastPosition.x), factor * (newPosition.y - lastPosition.y)]);
        lastPosition.copyFrom(newPosition);
      }
    });

    return object;
  }

  export function resize(
    object: DisplayObject & { width: number; height: number },
    onResize?: (delta: [dx: number, dy: number]) => void
  ) {
    return makeDraggable.advanced(object, ([dx, dy]) => {
      object.width += dx;
      object.height += dy;
      onResize?.([dx, dy]);
    });
  }
}

/**
 * Use PIXI.Graphics to draw an arrow pointing up and to the left.
 */
export function addDraggableArrowTo(
  parent: Container,
  mods: Partial<Container> & { name?: string; color?: number; cbs?: Callbacks }
) {
  const { name = "__BUGGY__", color = 0xffffff, cbs = {} } = mods;

  const graphics = new Graphics();
  graphics.name = name;
  graphics.beginFill(color);
  graphics.drawPolygon([0, 0, -30, -50, 0, -25, 30, -50]);
  graphics.endFill();
  Object.assign(graphics, mods);

  parent.addChild(graphics);
  makeDraggable(graphics, 1, cbs);

  return graphics;
}
