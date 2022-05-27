import { Container } from "@pixi/display";
import { Rectangle } from "@pixi/math";

export function OverrideWidthAndHeight(width: number = 1, height: number = width) {
  return function <T extends { new (...args: any[]): Container }>(constructor: T) {
    OverrideWidthAndHeight.modifyInstance(constructor.prototype, width, height);
  };
}

export module OverrideWidthAndHeight {
  export function modifyInstance<T extends Container>(instance: T, width: number = 1, height: number = width) {
    const cast = instance as typeof instance & { _width?: number; _height?: number };

    cast._width = width;
    cast._height = height;

    // Object.defineProperty(Element.prototype, "width", {
    //   get: function () {
    //     return this._width * this.scale.x;
    //   },
    //   set: function (value) {
    //     this._width = value / this.scale.x;
    //   },
    //   enumerable: false,
    //   configurable: true,
    // });

    // Object.defineProperty(Element.prototype, "height", {
    //   get: function () {
    //     return this._height * this.scale.y;
    //   },
    //   set: function (value) {
    //     this._height = value / this.scale.y;
    //   },
    //   enumerable: false,
    //   configurable: true,
    // });

    cast.getLocalBounds = function getLocalBounds(this: Container, rect?: Rectangle) {
      if (!rect) {
        if (!this._localBoundsRect) {
          this._localBoundsRect = new Rectangle();
        }
        rect = this._localBoundsRect;
      }

      rect.x = this.x;
      rect.y = this.y;
      rect.width = this._width || 0;
      rect.height = this._height || 0;

      return rect;
    };
  }
}
