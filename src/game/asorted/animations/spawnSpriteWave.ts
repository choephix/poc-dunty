import { Texture } from "@pixi/core";
import { Sprite } from "@pixi/sprite";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

export function spawnSpriteWave<T extends Sprite, TMods extends Partial<T> = {}>(
  textureId: string,
  tweenVars?: gsap.TweenVars,
  mods?: TMods
) {
  const sprite = new Sprite(Texture.from(textureId));
  sprite.anchor.set(0.5);

  const tweeener = new TemporaryTweeener(sprite);
  const tween = tweeener
    .to(sprite, {
      pixi: { scale: 2 },
      alpha: 0,
      duration: 0.87,
      ease: `power3.out`,
      ...tweenVars,
    })
    .then(() => sprite.destroy());

  if (mods) {
    if (mods.parent) {
      mods.parent.addChild(sprite);
      delete mods.parent;
    }
    Object.assign(sprite, mods);
  }

  return Object.assign(sprite, { tween });
  // return sprite as T & TMods;
}
