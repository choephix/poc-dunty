type Func = (...data: any[]) => unknown | Promise<unknown>;

type ListenerParams<T extends Record<TKey, Func>, TKey extends keyof T> = [T[TKey], any, number];

/**
 * @template T ListenerMap type. Pass an object definition which uses all possible event types as keys, and accepted callback types as value.
 *
 * Example usage:
 * ```
 * new EventBus<{
 *   'loaded': () => Promise<void>,
 *   'resize': (x:number,y:number) => void,
 * }>
 * ```
 * @template TKey type of allowed keys (you generally don't need to ever define this)
 */
export class EventBus<T extends Record<string, Func> = Record<string, Func>, TKey extends keyof T = keyof T> {
  /**
   * Dictionary with a list of [Function,thisParam] tuples for each event key.
   */
  private readonly __: Partial<Record<TKey, ListenerParams<T, TKey>[]>> = {};

  /**
   * @param listenerMap
   *
   * A map of listener functions to be added
   *
   *
   *
   * Example usage:
   * ```
   * eventBus.on({
   *   'loaded': () => console.log("app loaded"),
   *   'resize': () => console.log("app resized"),
   * })
   * ```
   *
   * @return
   * Returns a single method, that when called clears all listeners you just added.
   *
   * This can make your life easier when using anonymous functions as listeners.
   *
   * Example usage:
   * ```
   * this.addEventListener( "added", () => {
   *   const removeGameListeners = eventBus.on({
   *     'loaded': () => console.log("app loaded"),
   *     'resize': () => console.log("app resized"),
   *   })
   *   const onRemoved = () => {
   *     removeGameListeners()
   *     this.removeEventListener( "removed", onRemoved )
   *   }
   *   this.addEventListener( "removed", onRemoved )
   * })
   * ```
   */
  public on(listenerMap: Partial<T>, $this?: any): () => void {
    const pairs = Object.entries(listenerMap) as [TKey, T[TKey]][];
    for (const [eventType, func] of pairs) {
      this.addListener(eventType, func, $this);
    }
    return () => this.off(listenerMap);
  }

  /**
   * @param listenerMap : {}
   *
   * A map of existing listener functions to be removed
   *
   * { [eventType] : listener }
   *
   * Example usage:
   * ```
   * eventBus.off({
   *   'loaded': this.onLoaded,
   *   'resize': this.onResize,
   * })
   * ```
   */
  public off(listenerMap: Partial<T>) {
    const pairs = Object.entries(listenerMap) as [TKey, T[TKey]][];
    for (const [eventType, func] of pairs) {
      this.removeListener(eventType, func);
    }
  }

  /**
   * Returns a promise that resolves the first time the specified event is dispatched.
   *
   * Example usage:
   * ```ts
   * await eventBus.waitFor( 'loaded' )
   * console.log("App loaded")
   * ```
   *
   * @param eventType
   */
  public waitFor<K extends TKey = TKey>(eventType: K) {
    type Params = Parameters<T[K]>;
    return new Promise<Params>(resolve => {
      const handleEvent: any = (...args: Params) => {
        resolve(args);
        this.removeListener(eventType, handleEvent);
      };
      this.addListener(eventType, handleEvent);
    });
  }

  public addListener<K extends TKey = TKey>(eventType: K, func: T[K], $this?: any, priority: number = 0) {
    type LP = ListenerParams<T, K>;
    const currentList = (this.__[eventType] ?? (this.__[eventType] = [])) as LP[];
    currentList.push([func, $this, priority]);
    currentList.sort((a, b) => b[2] - a[2]);
  }

  public removeListener<K extends TKey = TKey>(eventType: K, func: T[K]) {
    type LP = ListenerParams<T, K>;
    const lps = this.__[eventType] as LP[] | undefined;
    if (!!lps?.length) {
      for (let i = lps.length - 1; i >= 0; i--) {
        if (lps[i][0] === func) {
          lps.splice(i, 1);
        }
      }
    }
  }

  /**
   * @param eventType
   *
   * @param data This data will be passed to all listener functions
   *
   * @return
   *
   * Call all listener functions registered for specified event type.
   *
   * Currently these can be both synchronous functions and promises.
   *
   * In order to work easily with game animations, the listeners will be called thusly:
   * - First all synchronous functions will be called
   * - Then all async functions will be awaited parallelly
   *
   * TODO: Add either multiple dispatch methods or an options param,
   * to make this functionality optional per 'dispatch' call in the future.
   */
  public async dispatch<K extends TKey = TKey>(eventType: K, ...data: Parameters<T[K]>) {
    if (!!this.__[eventType]) {
      await Promise.all(this.__[eventType]!.map(([func, $this]) => func.apply($this, data)));
    }
  }

  public clear() {
    for (const key in this.__) {
      delete this.__[key];
    }
  }
}

export type EventBusKey<E> = E extends EventBus<infer K> ? K : never;
