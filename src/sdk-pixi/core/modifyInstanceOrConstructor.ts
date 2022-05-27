function isConstructor<T>(target: (new () => T) | any): target is new () => T {
  return target && !!target.prototype && !!target.prototype.constructor.name;
}

type Constructor<T> = new (...args: any[]) => T;
type NotFunction<T> = T extends Function ? never : T;

export function modifyInstanceOrConstructor<T, Result extends T, Rest extends any[]>(
  modifyInstance: (o: T, ...rest: Rest) => Result,
  newClassPrefix: string = modifyInstance.name + "_"
) {
  function modify(target: Constructor<T>, ...rest: Rest): new () => T & Result;
  function modify(target: NotFunction<T>, ...rest: Rest): T & Result;
  function modify(target: NotFunction<T> | Constructor<T>, ...rest: Rest) {
    if (isConstructor(target)) {
      //newClassPrefix = newClassPrefix.charAt(0).toUpperCase() + newClassPrefix.slice(1);
      return Object.defineProperty(
        class extends (target as any) {
          constructor(...args: any[]) {
            super(...args);
            modifyInstance(this as any, ...rest);
          }
        },
        "name",
        { value: newClassPrefix + target.name }
      );
    } else if (typeof target === "object") {
      return modifyInstance(target, ...rest);
    } else {
      throw new Error("this is nothing...");
    }
  }

  return modify;
}
