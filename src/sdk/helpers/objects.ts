import { JsonValue } from "type-fest";

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: any): boolean {
  return item != null && typeof item === "object" && !Array.isArray(item);
}

export function isIterable(obj: any): obj is unknown[] {
  return obj != null && typeof obj[Symbol.iterator] === "function";
}

/**
 * Deep merge two objects, and return the resulting copy
 * @param target
 * @param ...sources
 */
export function mergeDeep<T>(target: Partial<T>, ...sources: (Partial<T> | undefined | null)[]): T {
  if (!sources.length) {
    throw new Error(`No sources for mergeDeep()`);
  }

  if (!isObject(target)) {
    throw new Error(`Target is not an object\n` + target);
  }

  return [target, ...sources].reduce<T>((a, c) => {
    if (c !== undefined && c !== null) {
      for (const key in c) {
        if (c[key] !== undefined) {
          if (isObject(c[key])) {
            a[key] = mergeDeep(isObject(a[key]) ? a[key] : {}, c[key]);
          } else {
            a[key] = c[key]!;
          }
        }
      }
    }
    return a;
  }, {} as any);
}

export function shallowEquals(a: any, b: any) {
  for (const key of [...Object.keys(a), ...Object.keys(b)]) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

export function deepEquals(a: JsonValue, b: JsonValue): boolean {
  return JSON.stringify(a) == JSON.stringify(b);
}

export function deepCopy<T extends {} | any[]>(a: T): T {
  return JSON.parse(JSON.stringify(a));
}

export function omit<T>(obj: T, ...keys: (keyof T)[]) {
  return keys.reduce(
    (result, key) => {
      delete result[key];
      return result;
    },
    { ...obj }
  );
}

export function pick<T>(obj: T, ...keys: (keyof T)[]) {
  return keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
}

export function deleteAllObjectProperties(obj: any) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    delete obj[key];
  }
  return obj;
}

export function deleteUndefinedObjectProperties<T extends {}>(obj: T) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    if ((obj as any)[key] === undefined) {
      delete (obj as any)[key];
    }
  }
  return obj;
}

export function map<T extends {}, R>(obj: T, fn: <K extends keyof T>(key: K, value: T[K], obj: T) => R) {
  const result = {} as Partial<{ readonly [K in keyof T]: any }>;
  for (const [key, value] of Object.entries(obj)) {
    (result as any)[key] = fn(key as keyof T, value as T[keyof T], obj);
  }
  return result as { readonly [K in keyof T]: R };
}

export function* iterateObjectProperties<T extends {}>(obj: T) {
  for (const [index, [key, value]] of Object.entries(obj).entries()) {
    yield [key as keyof T, value as T[keyof T], index] as const;
  }
}
