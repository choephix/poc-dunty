import { gsap } from 'gsap';

async function simpleTween(
  duration: number,
  onUpdate: (progress: number) => unknown
) {
  const state = { progress: 0 };
  const func = gsap.quickTo(state, 'progress', {
    duration,
    ease: 'linear',
    onUpdate: () => onUpdate(state.progress),
    onComplete: () => onUpdate(state.progress),
  });
  return await func(1);
}

export class AnimatedFlagProperty {
  public actual: boolean;
  public animated: number;

  public onChange?: (animated: number, actual: boolean) => unknown;

  private readonly tween;

  constructor(initialValue: boolean) {
    this.actual = initialValue;
    this.animated = initialValue ? 1 : 0;

    const onChange = () => this.onChange?.(this.animated, this.actual);

    this.tween = gsap.quickTo(this, 'animated', {
      duration: .3,
      ease: 'linear',
      onUpdate: onChange,
      onComplete: onChange,
    });

    console.log(this.tween )
  }

  set(value: boolean, instant: boolean = false) {
    this.actual = value;
    if (instant) {
      this.animated = value ? 1 : 0;
    } else {
      this.tween(value, );
    }
  }
}
