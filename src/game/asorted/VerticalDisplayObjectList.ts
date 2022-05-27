import { Texture } from "@pixi/core";
import { Container, DisplayObject } from "@pixi/display";
import { Sprite } from "@pixi/sprite";

export class VerticalDisplayObjectList extends Container {
  onEnterFrame() {
    let y = 0;
    for (const child of this.children) {
      const { height = 0 } = child as DisplayObject & { height?: number };
      child.y = y;
      y += height;
    }
  }

  addInvisibleBox(width: number, height: number) {
    const box = new Sprite(Texture.EMPTY);
    box.width = width + 1;
    box.height = height;
    // box.renderable = false;
    return this.addChild(box);
  }
}
