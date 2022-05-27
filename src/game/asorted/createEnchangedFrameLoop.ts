import { DisplayObject } from "@pixi/display";
import { makeImitateService } from "@sdk/pixi/enchant/services/imitate";
import { makeWaitUntilService } from "@sdk/pixi/enchant/services/waitUntil";
import { makeWatchService } from "@sdk/pixi/enchant/services/watch";

export type EnchantableInstance = Pick<DisplayObject, "updateTransform" | "render" | "destroy">;
export type TFn = () => unknown;

export function createEnchantedFrameLoop<T extends EnchantableInstance>(this: T | void, target: T) {
  const callbacks: TFn[] = [];
  let callbacksLen = 0;

  const $this = this ?? target;

  const observableFunction = (...args: Parameters<TFn>) => {
    if (!result.enabled) return;
    if (!callbacksLen) return;
    const _cbs = [...callbacks];
    for (let i = 0; i < callbacksLen; i++) {
      _cbs[i].apply($this, args);
    }
  };

  function add(...cbs: TFn[]) {
    callbacksLen = callbacks.push(...cbs);
    return () => {
      remove(...cbs);
    };
  }

  function remove(...cbs: TFn[]) {
    if (callbacksLen) {
      for (const cb of cbs) {
        const i = callbacks.indexOf(cb);
        if (i !== -1) {
          callbacks.splice(i, 1);
          callbacksLen--;
        }
      }
    }
  }

  function clear() {
    callbacks.length = callbacksLen = 0;
  }

  const makeShiftTicker = { add, remove };
  const result = Object.assign(observableFunction, {
    enabled: true,
    callbacks,
    add,
    remove,
    clear,
    watch: makeWatchService(makeShiftTicker),
    waitUntil: makeWaitUntilService(makeShiftTicker),
    imitate: makeImitateService(makeShiftTicker),
  });

  return result;
}
