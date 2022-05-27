export function createShowHideService(options: {
  onUpdate?: (visiblityProgress: number) => void;
  showTweenDuration?: number;
  hideTweenDuration?: number;
  initialVisibility?: number;
  ease?: (visiblityProgress: number) => number;
}) {
  const {
    onUpdate = () => void 0,
    showTweenDuration = 0.7,
    hideTweenDuration = 0.7,
    initialVisibility = 1.0,
    ease = x => x,
  } = options;

  const showAnimationTimeScale = 1 / showTweenDuration;
  const hideAnimationTimeScale = 1 / hideTweenDuration;

  let progress: number = initialVisibility;

  function update(deltaTime: number) {
    if (service.shouldShow && service.progress < 1.0) {
      service.progress += deltaTime * showAnimationTimeScale;
      if (service.progress > 1.0) {
        service.progress = 1.0;
      }
      onUpdate(ease(service.progress));
    } else if (!service.shouldShow && service.progress > 0) {
      service.progress -= deltaTime * hideAnimationTimeScale;
      if (service.progress < 0) {
        service.progress = 0;
      }
      onUpdate(ease(service.progress));
    }
  }

  const service = {
    shouldShow: progress > 0.01,

    get progress() {
      return progress;
    },
    set progress(value: number) {
      progress = value;
      onUpdate(ease(progress));
    },

    /**
     * Call this each frame for the animation sevice to work.
     */
    update,
  };

  onUpdate(ease(service.progress));

  return service;
}
