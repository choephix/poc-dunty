import { __window__ } from "@debug/__";
import { Ease } from "@sdk/time/Ease";
import { createSimpleTicker } from "@sdk/time/SimpleTicker";
import { createSimpleTweener } from "@sdk/time/SimpleTweener";

const ticker = createSimpleTicker();

export function createValueAnimator_Counter($get: number | (() => number), $set?: (value: number) => void) {
  const tweener = createSimpleTweener(ticker);

  const cleanupFunctions = [] as (() => unknown)[];

  let valueReal = typeof $get === "function" ? $get() : $get;
  let valueOnScreen = valueReal;
  const update =
    $set != undefined
      ? (val: number) => {
          valueOnScreen = val;
          $set(val);
        }
      : (val: number) => {
          valueOnScreen = val;
        };
  const service = {
    animationDuration: 0.88,
    animationRunning: false,

    get valueReal() {
      return valueReal;
    },
    get valueOnScreen() {
      return valueOnScreen;
    },
    animateTo(newValue: number, duration: number) {
      service.animationRunning = true;
      const tween = tweener.fromTo(valueOnScreen, newValue, update, {
        duration,
        easeFunc: Ease.Linear,
      });
      tween.finally(() => (service.animationRunning = false));
      return tween;
    },
    destroy() {
      cleanupFunctions.forEach(f => f());
      cleanupFunctions.length = 0;
    },
  };

  if (typeof $get === "function") {
    if (!ticker) {
      throw new Error("ticker is required when $get is a function");
    }
    const stopTicker = ticker.add(() => {
      const newValue = $get();
      if (valueReal !== newValue) {
        valueReal = newValue;
        service.animateTo(newValue, service.animationDuration);
      }
    });
    cleanupFunctions.push(() => stopTicker);
  }

  return service;
}

__window__.createValueAnimator_Counter = createValueAnimator_Counter;
