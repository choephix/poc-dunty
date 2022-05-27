export function createObservableFunction<
  T extends (...args: any[]) => unknown = () => void
>(this: any, fn?: T) {
  const callbacks: T[] = [];
  let callbacksLen = 0;

  if (fn) {
    callbacks.push(fn);
  }

  const $this = this ?? null;

  const func = (...args: Parameters<T>) => {
    if (result.enabled && callbacksLen) {
      const _cbs = [...callbacks];
      for (let i = 0; i < callbacksLen; i++) {
        _cbs[i].apply($this, args);
      }
    } else {
    }
  }

  function add(...cbs: T[]) {
    callbacksLen = callbacks.push(...cbs);
    return () => {
      remove(...cbs);
    };
  }

  function remove(...cbs: T[]) {
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

  const result = Object.assign(func, {    
    enabled: true,
    callbacks,
    add,
    remove,
    clear,
  });

  return result;
}
