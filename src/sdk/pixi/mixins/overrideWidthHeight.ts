import { Point } from "@pixi/math";

interface WithWidthAndHeight {
  width: number;
  height: number;
}

type Constructor<T = {}> = new (...args: any[]) => T;

export function overrideWidthHeight<T extends Constructor<WithWidthAndHeight>>(Constructor: T) {
  return Object.defineProperty(
    class CustomizedDisplayObject extends Constructor {
      #width = 1;
      #height = 1;
      // #bounds = new Rectangle(0, 0, this.#width, this.#height);

      public readonly anchor = new Point(0, 0);

      get width() {
        return this.#width;
      }

      set width(value: number) {
        this.#width = value;
      }

      get height() {
        return this.#height;
      }

      set height(value: number) {
        this.#height = value;
      }

      // getBounds() {
      //   const { width, height } = this;
      //   this.#bounds.x = this.x - width * this.anchor.x;
      //   this.#bounds.y = this.x - height * this.anchor.y;
      //   this.#bounds.width = width;
      //   this.#bounds.height = height;
      //   return this.#bounds;
      // }
    },
    "name",
    {
      value: `Customized` + Constructor.name,
    }
  );
}
