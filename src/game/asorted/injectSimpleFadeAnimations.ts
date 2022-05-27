import { DisplayObject } from "@pixi/display";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

export function injectSimpleFadeAnimations<T extends DisplayObject>(
  target: T,
  tweener: TemporaryTweeener = new TemporaryTweeener(target),
  additionalModifications?: Partial<T> & Partial<HideShowAnimations>
): WithHideShowAnimations<T> {
  const modifiedTarget = Object.assign(target, {
    async playShowAnimation() {
      await tweener.from(target, { alpha: 0.0, duration: 0.28 });
    },
    async playHideAnimation() {
      await tweener.to(target, { alpha: 0.0, duration: 0.73 });
    },
    async playHideAnimationAndDestroy() {
      await modifiedTarget.playHideAnimation().then(() => target.destroy());
    },
    ...additionalModifications,
  });

  return modifiedTarget;
}

export type HideShowAnimations = {
  playShowAnimation(): Promise<unknown>;
  playHideAnimation(): Promise<unknown>;
  playHideAnimationAndDestroy(): Promise<unknown>;
};

export type WithHideShowAnimations<T extends DisplayObject> = T & HideShowAnimations;
