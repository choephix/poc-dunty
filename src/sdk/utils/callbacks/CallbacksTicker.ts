type CallbackWithCallerName = (() => void) & { __caller?: string };

export class CallbacksTicker {
  private readonly funcs: CallbackWithCallerName[] = [];
  constructor(public readonly debug: boolean = false) {
    this.startLoop();
  }
  private startLoop() {
    const funcs = this.funcs;
    function tick() {
      for (const callbackTickerFunction of funcs) {
        try {
          callbackTickerFunction();
        } catch (e) {
          console.error(callbackTickerFunction, e);
        }
      }
      requestAnimationFrame(tick);
    }
    tick();
  }
  public add(func: () => void) {
    const funcs = this.funcs;
    if (!func || !func.call) {
      console.error(`Tried add ${func} to functions ticker for some reasone... `);
      return () => {};
    }
    if (this.debug) {
      const __caller = new Error().stack?.split("\n    at ")[3] ?? "idk";
      func = Object.assign(func, { __caller });
    }
    funcs.push(func);
    return function () {
      const i = funcs.indexOf(func);
      i > -1 && funcs.splice(i, 1);
    };
  }
}
