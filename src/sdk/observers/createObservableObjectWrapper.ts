type PropertyChangeCallback = <T, K extends keyof T>(p: K, value: T[K], target: T, receiver: any) => unknown;

export function createObservableObjectWrapper<T extends {}>(object: T, onPropertyChange: PropertyChangeCallback) {
  return new Proxy<T>(object, {
    set<K extends keyof T>(target: T, p: any, v: T[K], receiver: any): boolean {
      target[p as keyof T] = v;
      onPropertyChange?.(p, v, target, receiver);
      return true;
    },
  }) as T;
}

// export function createObservableObjectWrapper<T extends {}>(object: T, onPropertyChange?: PropertyChangeCallback) {
//   const result = new Proxy<T>(object, {
//     set<K extends keyof T>(target: T, p: any, v: T[K], receiver: any): boolean {
//       target[p as keyof T] = v;
//       result.onPropertyChange?.(p, v, target, receiver);
//       return true;
//     },
//   }) as T & { onPropertyChange?: PropertyChangeCallback };
//   result.onPropertyChange = onPropertyChange;
//   return result;
// }
