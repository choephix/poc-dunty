import { MultipleReasons } from "../core/MultipleReasons";
import { observe } from "../utils/frameloops/observe";

declare module "../core/MultipleReasons" {
  interface MultipleReasons {
    observe(condition: () => boolean, reason: string | symbol): () => void;
  }
}

MultipleReasons.prototype.observe = function (condition, reason) {
  return observe(
    () => !!condition(),
    flag => (flag ? this.add(reason) : this.remove(reason)),
    true
  );
};
