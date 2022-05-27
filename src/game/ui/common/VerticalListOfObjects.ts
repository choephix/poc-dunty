import { Container, DisplayObject } from "@pixi/display";
import { Text } from "@pixi/text";

export class VerticalListOfObjects extends Container {
  private __yNeedle = 0;

  append(
    element: DisplayObject & { height: number; anchor?: { y: number } },
    spacingBefore: number = 0,
    spacingAfter: number = 0
  ) {
    const yOffset = element.anchor ? element.anchor.y * element.height : element.pivot.y * element.scale.y;
    element.y = this.__yNeedle + spacingBefore + yOffset;
    this.addChild(element);
    this.__yNeedle += spacingBefore + element.height + spacingAfter;
    return element;
  }

  appendSpacing(px: number) {
    this.__yNeedle += px;
  }

  get height() {
    return this.__yNeedle;
  }

  clear() {
    for (const child of this.children) {
      const isText = child instanceof Text;
      child.destroy({ children: true, texture: isText, baseTexture: isText });
    }
    this.removeChildren();
    this.__yNeedle = 0;
  }
}
