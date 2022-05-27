import { gsap } from "gsap";

export function createAnimator_InOutViaTimeline(
  options: {
    howToShow: (tl: gsap.core.Timeline) => unknown;
    howToHide: (tl: gsap.core.Timeline) => unknown;
  },
  startHidden: boolean = true
) {
  const { howToShow, howToHide } = options;

  let currentStateShown = !startHidden;
  let currentAnimation = null as null | gsap.core.Timeline;
  type Animation = gsap.core.Timeline;

  function makeAnimationSequenceFunction(
    ...modifierFunctions: ((tl: Animation) => unknown)[]
  ): (instant?: boolean) => Animation {
    return function (instant: boolean = false) {
      if (currentAnimation) {
        currentAnimation.kill();
      }

      currentAnimation = gsap.timeline({ onComplete: () => (currentAnimation = null) });

      for (const modifyTimeline of modifierFunctions) {
        modifyTimeline(currentAnimation);
      }

      if (instant) {
        currentAnimation.totalProgress(1.0);
      }

      return currentAnimation;
    };
  }

  const show = makeAnimationSequenceFunction(() => (currentStateShown = true), howToShow);
  const hide = makeAnimationSequenceFunction(() => (currentStateShown = false), howToHide);

  const hideThenUpdateThenShow = (update: (tl: gsap.core.Timeline) => unknown) => {
    const func = makeAnimationSequenceFunction(howToHide, update, howToShow);
    return func();
  };

  if (startHidden) {
    hide(true);
  }

  return { show, hide, hideThenUpdateThenShow };
}
