import { Renderer } from "@pixi/core";

type Renderable = {
  render(renderer: Renderer): unknown;
};

export function copycat<T1 extends Renderable, T2 extends Renderable>(
  imitator: T1,
  source: T2,
  sourceKeys: (keyof (T1 | T2))[]
): void {
  const originalRenderFunciton = imitator.render;
  imitator.render = function (renderer: Renderer): void {
    sourceKeys.forEach(key => {
      imitator[key] = source[key] as any;
    });
    originalRenderFunciton.call(imitator, renderer);
  };
}
