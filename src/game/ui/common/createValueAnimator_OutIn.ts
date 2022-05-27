export function createValueAnimator_OutIn<T>(cb: {
  change: (value: T) => unknown | Promise<unknown>;
  howToShow: (immediate: boolean) => PromiseLike<unknown>;
  howToHide: (immediate: boolean) => PromiseLike<unknown>;
}) {
  return {
    setValue: async (value: T) => {
      await cb.howToHide(true);
      await cb.change(value);
      await cb.howToShow(true);
    },
  };
}
