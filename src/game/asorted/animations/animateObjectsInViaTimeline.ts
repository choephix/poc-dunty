import type { DisplayObject } from "@pixi/display";
import type { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

type StepParams =
  | [target: DisplayObject | undefined | null, vars: gsap.TweenVars, playHeadAdvance?: number]
  | [fn: Function | undefined, this: any, playHeadAdvance?: number];

export async function animateObjectsInViaTimeline(
  objects: StepParams[],
  tweeener: TemporaryTweeener,
  delay: number = 0
) {
  const tl = tweeener.createTimeline();

  objects.forEach(([object]) => {
    if (object && "visible" in object) {
      object.visible = false;
    }
  });
  tl.delay(delay);

  let playHead = 0;
  for (const [object, vars, playHeadAdvance] of objects) {
    if (!object) continue;

    playHead += playHeadAdvance || 0;

    if (typeof object === "function") {
      tl.call(() => object.call(vars || null), undefined, playHead);
    } else {
      tl.call(() => void (object.visible = true), undefined, playHead);
      tl.from(object, vars, playHead);
    }
  }

  return await tl.play();
}

export async function animateObjectsOutViaTimeline(
  objects: StepParams[],
  tweeener: TemporaryTweeener,
  delay: number = 0
) {
  const tl = tweeener.createTimeline();

  tl.delay(delay);

  let playHead = 0;
  for (const [object, vars, playHeadAdvance] of objects) {
    if (!object) continue;

    playHead += playHeadAdvance || 0;

    if (typeof object === "function") {
      tl.call(() => object.call(vars || null), undefined, playHead);
    } else {
      tl.to(object, vars, playHead).then(() => void (object.visible = false));
    }
  }

  return await tl.play();
}
