import { Renderer, Texture } from '@pixi/core';

export let totalSeconds = performance.now();
export let deltaSeconds = 0;
function __onEnterFrameGlobal() {
  const now = performance.now() * .001;
  deltaSeconds = now - totalSeconds;
  totalSeconds = now;
  requestAnimationFrame(__onEnterFrameGlobal);
}
__onEnterFrameGlobal();

type ConstructorReturnType<T> = T extends { new (...args: any[]): infer U; } ? U : never;
type Constructor<T = {}> = new (...args: any[]) => T;
type Renderable = { render: (renderer: Renderer) => void };
export function WithOnEnterFrame<TBase extends Constructor<Renderable>>(Base: TBase) {
  const Result = class WithOnEnterFrame extends Base {
    onEnterFrame = null as null | ((deltaTime: number) => void);
    render = (renderer: Renderer) => {
      this.onEnterFrame?.(deltaSeconds);
      return super.render(renderer);
    };
  };
  return Result;
}

export type IWithOnEnterFrame<T = {}> = T & ConstructorReturnType<ReturnType<typeof WithOnEnterFrame>>;

export function isWithOnEnterFrame<T extends Constructor<Renderable>>(Base: T): Base is IWithOnEnterFrame<T> {
  return Base.prototype.onEnterFrame !== undefined;
}