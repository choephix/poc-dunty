import { makeDraggable } from "./utils/makeDraggable";
import { __add } from "./__";

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
export const __window__ = Object.assign(
  window as any as Record<string, any> & Window,
  { __MIDDLE_MOUSE_BUTTON__: false },
  { add: __add, makeDraggable, ["👁"]: new Array<any>() },
);
