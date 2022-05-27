import { Renderer, Texture } from '@pixi/core';
import { IWithOnEnterFrame } from './WithOnEnterFrame';

interface Fadable {
  render: (renderer: Renderer) => void;
  alpha: number;
  //get alpha(): number;
  //set alpha(v: number);
}

type ConstructorReturnType<T> = T extends { new (...args: any[]): infer U; } ? U : never;
type Constructor<T = {}> = new (...args: any[]) => T;
export function WithFadingAnimator<TBase extends Constructor<IWithOnEnterFrame<Fadable>>>(Base: TBase) {
  const Result = class WithFadingAnimator extends Base {
    private alphaBase: number = 1.0;
    public shouldShow: boolean = true;
    //public showAnimationTimeScale: number = 1.0;
    //public hideAnimationTimeScale: number = 1.0;
    public showTweenDuration: number = 1.0;
    public hideTweenDuration: number = 1.0;
    onEnterFrame = (dt: number) => {
      if (this.shouldShow && this.alpha < this.alphaBase) {
        this.alpha += dt / this.showTweenDuration;
      } else if (!this.shouldShow && this.alpha > 0) {
        this.alpha -= dt / this.hideTweenDuration;
      }
    }
    set alpha(v: number) {
      this.alphaBase = super.alpha = v;
    }
  };
  return Result;
}

export type IWithFadingAnimator<T = {}> = T & ConstructorReturnType<ReturnType<typeof WithFadingAnimator>>;