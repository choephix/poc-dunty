import { Graphics } from "@pixi/graphics";

type IBounds = {
  x?: number;
  y?: number;
  width: number;
  height: number;
};

export function drawRect(area: IBounds, color = ~~(0xFfFfFf * Math.random())) {
  const { x = 0, y = 0, width, height } = area;
  const g = new Graphics();
  g.beginFill(color)
  g.drawRect(x, y, width , height);
  return g;
}