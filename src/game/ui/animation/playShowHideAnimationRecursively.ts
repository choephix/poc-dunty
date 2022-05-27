import { Container, DisplayObject } from "@pixi/display";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

interface WithShowAnimationMaybe {
  playShowAnimation?(): unknown | Promise<unknown>;
}
interface WithHideAnimationMaybe {
  playHideAnimation?(): unknown | Promise<unknown>;
}

export function playShowAnimationRecursively<T extends Container & WithShowAnimationMaybe>(page: T) {
  if (page.playShowAnimation) {
    return Promise.resolve(page.playShowAnimation());
  }

  const staggerPeriod = 0.1;

  const tweeener = new TemporaryTweeener(page);
  const timeline = tweeener.createTimeline();
  const promises = [] as { then: Function }[];

  let delay = 0;
  for (const child of page.children as (DisplayObject & WithShowAnimationMaybe)[]) {
    if (!child.visible) {
      continue;
    }

    child.visible = false;
    if (child.playShowAnimation) {
      const promise = tweeener.delay(delay).then(() => {
        child.visible = true;
        child.playShowAnimation?.();
      });
      promises.push(promise);
    } else {
      timeline.fromTo(
        child,
        {
          alpha: 0,
        },
        {
          alpha: 1,
          duration: 0.51,
          onStart: () => {
            child.visible = true;
          },
        },
        delay
      );
    }
    delay += staggerPeriod;
  }

  promises.push(timeline.play());

  return Promise.all(promises);
}

export function playHidenimationRecursively<T extends Container & WithHideAnimationMaybe>(page: T) {
  if (page.playHideAnimation) {
    return Promise.resolve(page.playHideAnimation());
  }

  const staggerPeriod = 0.05;

  const tweeener = new TemporaryTweeener(page);
  const timeline = tweeener.createTimeline();
  const promises = [] as { then: Function }[];

  let delay = 0;
  for (const child of page.children as (DisplayObject & WithHideAnimationMaybe)[]) {
    if (child.playHideAnimation) {
      const promise = tweeener.delay(delay).then(() => child.playHideAnimation?.());
      promises.push(promise);
    } else {
      timeline.to(
        child,
        {
          alpha: 0,
          duration: 0.22,
        },
        delay
      );
    }
    delay += staggerPeriod;
  }

  promises.push(timeline.play());

  return Promise.all(promises);
}

export function playHidenimationRecursivelyThenDestroy<T extends Container & WithHideAnimationMaybe>(page: T) {
  const awaitable = playHidenimationRecursively(page);
  awaitable.then(() => page.destroy());
  return awaitable;
}
