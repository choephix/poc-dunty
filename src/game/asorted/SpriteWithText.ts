import { DefaultTextStyle } from "@game/constants/defaults/DefaultTextStyle";
import { Texture } from "@pixi/core";
import { Point } from "@pixi/math";
import { Sprite } from "@pixi/sprite";
import { ITextStyle, Text } from "@pixi/text";
import { fitObjectInRectangle } from "@sdk-pixi/layout/fitObjectInRectangle";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

export class SpriteWithText extends Sprite {
  // public padding = 35;

  public readonly labelAnchor = new Point(0.5, 0.5);
  public label: Text | null = null;

  constructor(textureId?: string, text: string = "", style: Partial<ITextStyle> = {}) {
    super(textureId ? Texture.from(textureId) : undefined);

    this.setText(text, style);

    const originalAnchorCb = this.anchor.cb;
    this.anchor.cb = () => {
      originalAnchorCb.call(this);
      this.updateLabelPosition();
    };
  }

  public setText(text: string | null, style: Partial<ITextStyle> = {}) {
    this.clearText();

    if (text) {
      this.label = new Text(text, { ...DefaultTextStyle, ...style });

      this.addChild(this.label);

      this.updateLabelPosition();

      this.animateTextIn(this.label);
    }
  }

  public updateLabelPosition() {
    const { width, height } = this.texture;

    if (this.label) {
      this.label.anchor.copyFrom(this.labelAnchor);
      this.label.position.set(
        (this.labelAnchor.x - this.anchor.x) * width,
        (this.labelAnchor.y - this.anchor.y) * height
      );
    }
  }

  public clearText() {
    if (this.label) {
      const label = this.label;
      this.animateTextOut(label).then(() => label?.destroy());
    }
  }

  public centerPivot() {
    const bounds = this.getLocalBounds();
    this.pivot.set(bounds.x + bounds.width * this.labelAnchor.x, bounds.y + bounds.height * this.labelAnchor.y);
  }

  async animateTextIn(label: Text) {
    const tweeener = new TemporaryTweeener(label);
    await tweeener.from(label, {
      pixi: { alpha: 0 /* pivotX: label.width * 0.5 */ },
      duration: 0.5,
      ease: "power.inOut",
    });
  }

  async animateTextOut(label: Text) {
    const tweeener = new TemporaryTweeener(label);
    await tweeener.to(label, {
      pixi: { alpha: 0 },
      duration: 0.5,
      ease: "power.inOut",
    });
  }
}

export module SpriteWithText {
  export function assignSwipeTransition(target: SpriteWithText) {
    target.animateTextOut = async function (label: Text) {
      const tweeener = new TemporaryTweeener(label);
      await tweeener.to(label, {
        pixi: { alpha: 0, pivotX: -label.width * 0.25 },
        duration: 0.3,
        ease: "power.out",
        // onStart: () => void (label.mask = target),
        // onComplete: () => void (label.mask = null),
      });
    };

    target.animateTextIn = async function (label: Text) {
      const tweeener = new TemporaryTweeener(label);
      await tweeener.from(label, {
        pixi: { alpha: 0, pivotX: label.width * 0.25 },
        duration: 0.3,
        ease: "power.out",
        // onStart: () => void (label.mask = target),
        // onComplete: () => void (label.mask = null),
      });
    };
  }
}
