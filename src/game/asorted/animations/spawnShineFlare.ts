import { BLEND_MODES } from "@pixi/constants";
import { Texture } from "@pixi/core";
import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

export function spawnShineFlare<TMods extends Partial<Sprite> = {}>(
  { textureId = "", fromX = 0, fromY = 0, toX = 0, toY = 0, duration = 0.5, parent = null as Container | null },
  mods?: TMods
) {
  const sprite = Object.assign(new Sprite(Texture.from(textureId)), { animationProgress: 0 });
  sprite.anchor.set(0.5);
  sprite.blendMode = BLEND_MODES.ADD;

  function updateAlpha() {
    sprite.alpha = Math.sin(sprite.animationProgress * Math.PI);
  }

  const tweeener = new TemporaryTweeener(sprite);
  const tween = tweeener
    .fromTo(
      sprite,
      {
        x: fromX,
        y: fromY,
      },
      {
        x: toX,
        y: toY,
        animationProgress: 1,
        duration,
        ease: `power2.inOut`,
        onStart: updateAlpha,
        onUpdate: updateAlpha,
        onComplete: updateAlpha,
      }
    )
    .then(() => sprite.destroy());

  parent?.addChild(sprite);

  return Object.assign(sprite, mods, { tween });
}
