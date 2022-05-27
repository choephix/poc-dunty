import { Renderer, Texture } from "@pixi/core";
import { Sprite } from "@pixi/sprite";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

export class SolidDimmer extends Sprite {
  private static readonly TEXTURE_URL_BLACK_PIXEL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

  private readonly tweeener = new TemporaryTweeener(this);
  public maxAlpha = 0.6;

  constructor() {
    super(Texture.from(SolidDimmer.TEXTURE_URL_BLACK_PIXEL));
    this.alpha = 0;
    this.name = "Dimmer";
  }

  render(renderer: Renderer): void {
    this.visible = this.alpha > 0.001;

    if (this.visible) {
      const { width, height } = renderer.view;
      this.width = width;
      this.height = height;

      super.render(renderer);
    }
  }

  show() {
    return this.tweeener.to(this, {
      alpha: this.maxAlpha,
      duration: 0.5,
      overwrite: true,
    });
  }

  hide() {
    return this.tweeener.to(this, {
      alpha: 0,
      duration: 0.5,
      overwrite: true,
    });
  }
}
