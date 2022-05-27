import { Texture } from "@pixi/core";
import { Sprite } from "@pixi/sprite";

export function createInvisibleInteractiveArea(width: number, height: number) {
  const sprite = new Sprite(Texture.WHITE);
  sprite.width = width;
  sprite.height = height;
  sprite.interactive = true;
  sprite.buttonMode = true;
  sprite.renderable = false;
  return sprite;
}
