import { DestroyableDisplayObject, TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

export type IWithAlpha = DestroyableDisplayObject & { alpha: number };

export function playFadeInAnimation(target: IWithAlpha, vars: gsap.TweenVars | number = 0.85) {
  if (typeof vars == "number") vars = { duration: vars };
  const tweeener = new TemporaryTweeener(target);
  return tweeener.from(target, {
    overwrite: "auto",
    ease: "power.out",
    alpha: 0,
    ...vars,
  });
}

export function playFadeOutAnimation(target: IWithAlpha, vars: gsap.TweenVars | number = 0.35) {
  if (typeof vars == "number") vars = { duration: vars };
  const tweeener = new TemporaryTweeener(target);
  return tweeener.to(target, {
    overwrite: "auto",
    ease: "power.out",
    alpha: 0,
    ...vars,
  });
}
