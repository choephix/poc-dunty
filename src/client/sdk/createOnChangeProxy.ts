export function createOnChangeProxy<T extends object>(onPropertyChange: Function, target: T) {
  return new Proxy(target, {
    get(target: any, property: any): T {
      const item = target[property];
      if (item && typeof item === "object") return createOnChangeProxy(onPropertyChange, item);
      return item;
    },
    set(target, property, newValue) {
      target[property] = newValue;
      if (newValue instanceof Object) {
        onPropertyChange.call(target, property, newValue, target);
      }
      return true;
    },
  });
}
