import { deleteAllObjectProperties, isIterable } from "@sdk/helpers/objects";
import { gsap } from "gsap";

export type ValueAnimator_OutInTimeline = ReturnType<typeof createValueAnimator_OutInViaTimeline>;

export function createValueAnimator_OutInViaTimeline<T>(
  options: {
    howToApplyValue: (value: T | null, tl: gsap.core.Timeline) => unknown | Promise<unknown>;
    howToShow?: (tl: gsap.core.Timeline) => unknown;
    howToHide?: (tl: gsap.core.Timeline) => unknown;
  },
  initialValue: T | null
) {
  let currentTimeline: gsap.core.Timeline | null = null;
  let currentValue = initialValue;
  let onScreenValue = initialValue;

  /**
   * Will call `setValue()`, sandwiched between the `hide` and `show` animations.
   *
   * @param value The value to pass to the `setValue()` callback.
   * @param instant Skips right to the result of the animation. Useful for setting an inital state.
   * @param force Skips the change-check (will run even if value is the same as the currently set one)
   * @returns
   */
  function setValue(value: T | null, instant: boolean = false, force: boolean = false) {
    if (!force && currentValue === value) {
      return;
    }

    currentValue = value;

    currentTimeline?.kill();
    const tl = (currentTimeline = gsap.timeline());
    const clear = (): void => void (tl === currentTimeline && (currentTimeline = null));
    if (onScreenValue !== null || force) {
      options.howToHide?.(tl);
    }
    tl.call(() => void (onScreenValue = value));
    tl.call(() => void options.howToApplyValue(value, tl));
    if (currentValue !== null) {
      options.howToShow?.(tl);
    }

    if (instant) {
      tl.totalProgress(1.0);
      return clear();
    } else {
      tl.then(clear);
      return tl.play();
    }
  }

  function getCurrentValue() {
    return currentValue;
  }

  function getOnScreenValue() {
    return onScreenValue;
  }

  function attachToGetter(getter: () => T | null) {
    const onEnterFrame = () => {
      const value = getter();
      if (value !== currentValue) {
        setValue(value);
      }
    };
    gsap.ticker.add(onEnterFrame);
    return () => {
      currentTimeline?.clear();
      currentTimeline?.kill();
      gsap.ticker.remove(onEnterFrame);
    };
  }

  function attachToGetterWhichMayBeAnArray(getter: () => T | null) {
    const onEnterFrame = () => {
      const value = getter();
      if (isIterable(value) && isIterable(currentValue)) {
        let dirty = false;
        for (const i in value) {
          if (value[i] !== currentValue[i]) {
            dirty = true;
            break;
          }
        }
        if (dirty) {
          setValue(value);
        }
      }
      if (value !== currentValue) {
        setValue(value);
      }
    };
    gsap.ticker.add(onEnterFrame);
    return () => {
      gsap.ticker.remove(onEnterFrame);
      currentTimeline?.clear();
      currentTimeline?.kill();
    };
  }

  function destroy() {
    deleteAllObjectProperties(options);
    deleteAllObjectProperties(service);
  }

  setValue(initialValue, true, true);

  const service = {
    setValue,
    getCurrentValue,
    getOnScreenValue,
    attachToGetter,
    attachToGetterWhichMayBeAnArray,
    destroy,
  };

  return service;
}
