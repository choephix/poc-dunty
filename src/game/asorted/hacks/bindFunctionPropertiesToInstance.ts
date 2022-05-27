export function bindFunctionPropertiesToInstance<T extends {}>(target: T, $this: T = target) {
  const logg = (key: string | number | symbol) =>
    console.log(
      `✎ %c ${target.constructor?.name}.${String(key)}() OVERRIDEN by bindFunctionPropertiesToInstance`,
      "color: #259;"
    );
  const keys = Object.getOwnPropertyNames(target.constructor.prototype) as (keyof T)[];
  for (const key of keys) {
    try {
      const func = target[key];
      if (typeof func !== "function") continue;
      target[key] = func.bind($this);
      // logg(key);
    } catch (error) {
      console.error(error);
    }
  }
  return target;
}
