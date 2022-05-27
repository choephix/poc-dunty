export function debounce<T extends (...args: any[]) => void>(fn: T, wait: number = 0.25): T {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: any, ...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait * 1000);
  } as T;
}
