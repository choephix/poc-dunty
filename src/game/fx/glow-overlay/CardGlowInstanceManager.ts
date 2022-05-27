import { CARD_SPRITE_DIMENSIONS } from "@game/ui/cards/CardSprite";
import { WRAP_MODES } from "@pixi/constants";
import { Texture } from "@pixi/core";
import { Container } from "@pixi/display";
import { IPointData, Point } from "@pixi/math";
import { CardGlowMesh } from "./CardGlowMesh";

// this.textureMask = Texture.from('https://public.cx/1/glo.png');
// this.textureMask = Texture.from("https://public.cx/1/card-glow.png");
// this.textureNoise = Texture.from("uSamplerNoises");
// this.textureNoise = Texture.from("https://public.cx/1/perlin.png");
// this.textureNoise.baseTexture.wrapMode = WRAP_MODES.REPEAT;

// https://public.cx/1/card-glow/g.png

export class CardGlowInstanceManager {
  private readonly textureMask: Texture;
  private readonly textureNoise: Texture;

  public readonly scaleMultiplier: IPointData = new Point(1, 1);

  public maskTextureId: string = "cardGlow";
  public noiseTextureId: string = "perlin";
  public colorLow?: [number, number, number];
  public colorHigh?: [number, number, number];

  constructor() {
    this.textureMask = Texture.from(this.maskTextureId);
    this.textureNoise = Texture.from(this.noiseTextureId);
    this.textureNoise.baseTexture.wrapMode = WRAP_MODES.MIRRORED_REPEAT;
  }

  readonly current: CardGlowMesh[] = [];

  setParents(cards: Container[]) {
    for (const glow of this.current) {
      glow.playHideAnimation().finally(() => glow.destroy());
    }

    this.current.length = 0;

    for (const card of cards) {
      const glow = new CardGlowMesh(this.textureMask, this.textureNoise, {
        colorLow: this.colorLow,
        colorHigh: this.colorHigh,
      });

      card.addChild(glow);
      this.current.push(glow);

      glow.pivot.set(64);
      glow.scale.set(this.scaleMultiplier.x * 8, this.scaleMultiplier.y * 8);
      glow.position.set(CARD_SPRITE_DIMENSIONS.width / 2, CARD_SPRITE_DIMENSIONS.height / 2);

      glow.playShowAnimation();
    }
  }
}
