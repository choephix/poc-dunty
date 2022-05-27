import { DisplayObject } from 'pixi.js';
import { Point } from 'pixi.js';
import { InteractionEvent } from 'pixi.js';
import { getTopParent } from './getTopParent';
import { waitUntil } from './waitUntil';

export function makeDraggable(object: DisplayObject) {
  object.interactive = true;
  object.buttonMode = true;

  const lastPosition: Point = new Point();
  const newPosition: Point = new Point();
  let isDragging: boolean = false;

  const stage = getTopParent(object);
  if (!stage) return;

  object.interactive = true;
  object.on('pointerdown', (event: InteractionEvent) => {
    const parent = object.parent;
    if (!parent) return;
    parent.setChildIndex(object, parent.children.length - 1);

    lastPosition.copyFrom(event.data.global);
    // event.stopPropagation();
    isDragging = true;
  });

  object.on('pointerup', (event: InteractionEvent) => {
    isDragging = false;
  });

  object.on('pointerupoutside', (event: InteractionEvent) => {
    isDragging = false;
  });

  object.on('pointermove', (event: InteractionEvent) => {
    if (isDragging) {
      const factor = !event.data.originalEvent.shiftKey ? 1 : .25;
      newPosition.copyFrom(event.data.global);
      object.x += factor * (newPosition.x - lastPosition.x);
      object.y += factor * (newPosition.y - lastPosition.y);
      lastPosition.copyFrom(newPosition);
    }
  });
  
  return object;
}

export namespace makeDraggable {
  export async function advanced(object: DisplayObject, onDrag: (delta:[dx: number, dy: number]) => void) {
    object.interactive = true;
    object.buttonMode = true;

    const lastPosition: Point = new Point();
    const newPosition: Point = new Point();
    let isDragging: boolean = false;

    await waitUntil(() => object.parent);

    const stage = getTopParent(object);
    if (!stage) return;

    object.interactive = true;
    object.on('pointerdown', (event: InteractionEvent) => {
      lastPosition.copyFrom(event.data.global);
      // event.stopPropagation();
      isDragging = true;
    });

    object.on('pointerup', (event: InteractionEvent) => {
      isDragging = false;
    });

    object.on('pointerupoutside', (event: InteractionEvent) => {
      isDragging = false;
    });

    object.on('pointermove', (event: InteractionEvent) => {
      if (isDragging) {
        const factor = !event.data.originalEvent.shiftKey ? 1 : .25;
        newPosition.copyFrom(event.data.global);
        onDrag([
          factor * (newPosition.x - lastPosition.x),
          factor * (newPosition.y - lastPosition.y),
        ]);
        lastPosition.copyFrom(newPosition);
      }
    });

    return object;
  }

  export function resize(
    object: DisplayObject & { width: number, height: number }, 
    target: { width: number, height: number } = object, 
    onResize?: (delta:[dx: number, dy: number]) => void
  ) {
    return makeDraggable.advanced(object, ([dx, dy]) => {
      target.width += dx;
      target.height += dy;
      onResize?.([dx, dy]);
    });
  }
}

