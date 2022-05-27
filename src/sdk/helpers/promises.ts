export type AsyncReturnType<T extends (...args: any) => any> = T extends (...args: any) => Promise<infer U>
  ? U
  : T extends (...args: any) => infer U
  ? U
  : any;

export function isPromiseLike(subject: any): subject is PromiseLike<unknown> {
  return subject && typeof subject.then === "function";
}
