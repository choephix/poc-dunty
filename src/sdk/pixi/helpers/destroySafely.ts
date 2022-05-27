import { DisplayObject } from "@pixi/display";

export type DestroySafelyOptions = {
  children: boolean;
  shouldDeleteProperty: (value: any, key: string) => boolean;
};

function defaultShouldDeleteProperty(value: any, key: string): boolean {
  return typeof value === "function" || typeof value === "object";
}

export function destroySafely(
  target: DisplayObject,
  { children = true, shouldDeleteProperty = defaultShouldDeleteProperty }: Partial<DestroySafelyOptions> = {}
) {
  try {
    if (!target.destroyed && target.destroy) {
      target.destroy({ children });
    }
  } catch (error) {
    console.error(error);
  }

  //// Clean up any possible dangling refs
  // const keys = Object.keys(target) as (keyof typeof target)[];
  // for (const key of keys) {
  //   if (!target.hasOwnProperty(key)) continue;
  //   if (shouldDeleteProperty(target[key], key)) {
  //     delete target[key];
  //   }
  // }
}
