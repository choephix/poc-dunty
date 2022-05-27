export function generate<T>(count: number, generator: (i: number) => T) {
  return new Array(count).fill(0).map((_, i) => generator(i));
}

export function getRandomItemFrom<T>(list: Readonly<T[]>, power?: number) {
  if (power && !isNaN(power)) {
    return list[~~(Math.pow(Math.random(), power) * list.length)];
  }
  return list[~~(Math.random() * list.length)];
}

export function getSeveralRandomItemsFrom<T>(originalList: Readonly<T[]>, count: number) {
  const list = [...originalList];
  const result = new Array<T>();
  for (let i = 0; i < count; i++) {
    const index = ~~(Math.random() * originalList.length);
    result.push(originalList[index]);
    list.splice(index, 1);
  }
  return result;
}

//// Feturns a shuffled copy of the original array
export function shuffled<T>(original: Readonly<T[]>): T[] {
  return shuffle([...original]);
}

/** Shuffle an existing array */
export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

export function rotate<T>(arr: T[], count: number) {
  count -= arr.length * Math.floor(count / arr.length);
  arr.push.apply(arr, arr.splice(0, count));
  return arr;
}

export function withoutDuplicates<T>(array: Readonly<T[]>): T[] {
  return [...new Set(array)];
}

export function count<T>(a: Readonly<T[]>, cb: (o: T) => boolean) {
  return a.reduce((a, c) => a + (cb(c) ? 1 : 0), 0);
}

export function groupBy<T extends { [key: string]: any }>(
  xs: Readonly<T[]>,
  keyProperty: keyof T,
  keyItems: string = "items"
) {
  const map = xs.reduce(function (rv, x) {
    const g: any[] = (rv[x[keyProperty]] = rv[x[keyProperty]] || []);
    g.push(x);
    return rv;
  }, [] as any[]);

  return Object.entries(map).map(([key, value]) => ({
    [keyProperty]: key,
    [keyItems]: value,
  }));
}

export function removeFalsies<T>(array: Readonly<T[]>) {
  return array.filter(Boolean) as NonNullable<T>[];
}
