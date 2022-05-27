import { Texture } from "@pixi/core";
import { Sprite } from "@pixi/sprite";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

export function fadeChangeSpriteTexture(target: Sprite, texture: Texture, duration: number = 1) {
  const clone = new Sprite(target.texture);
  clone.transform.setFromMatrix(target.transform.localTransform);
  clone.anchor.copyFrom(target.anchor);
  clone.alpha = target.alpha;
  clone.tint = target.tint;

  const targetChildIndex = target.parent.getChildIndex(target);
  target.parent.addChildAt(clone, targetChildIndex);
  target.texture = texture;

  return Promise.all([
    new TemporaryTweeener(clone).to(clone, { alpha: 0, duration }),
    new TemporaryTweeener(target).from(target, { alpha: 0, duration }),
  ]);
}
