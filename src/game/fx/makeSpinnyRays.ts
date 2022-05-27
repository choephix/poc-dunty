import { BLEND_MODES } from "@pixi/constants";
import { Texture } from "@pixi/core";
import { Sprite } from "@pixi/sprite";
import { Ticker } from "@pixi/ticker";

export type RaysLayerConfiguration = {
  texture: Texture;
  speed?: number;
  scale?: number;
  alpha?: number;
  tint?: number;
  blendMode?: BLEND_MODES;
};

export function makeSpinnyRays(configs: RaysLayerConfiguration[], ticker?: Ticker): Sprite[] {
  const layers = configs.map(config => {
    const { texture, speed = 0, scale = 1, alpha = 1, tint = 0xffffff, blendMode = BLEND_MODES.NORMAL } = config;
    const layer = Object.assign(new Sprite(texture), {
      onEnterFrame: (dt: number) => (layer.rotation += dt * speed),
    });
    layer.anchor.set(0.5, 0.5);
    layer.scale.set(scale, scale);
    layer.alpha = alpha;
    layer.tint = tint;
    layer.blendMode = blendMode;
    return layer;
  });
  ticker?.add(() => layers.forEach(o => o.onEnterFrame(ticker.elapsedMS * 0.001)));
  return layers;
}
