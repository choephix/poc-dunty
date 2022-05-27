import { GameSingletons } from "@client/core/GameSingletons";
import { BLEND_MODES } from "@pixi/constants";
import { Container } from "@pixi/display";
import { Graphics } from "@pixi/graphics";
import { Sprite } from "@pixi/sprite";
import { TilingSprite } from "@pixi/sprite-tiling";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

// const T_BACKDROP = `https://public.cx/dunty/bg-1080x1920/gb60.jpg`;

const BACKDROP_PRESETS = [
  [`https://public.cx/dunty/bg-1920x1920/4.jpg`, 0xc0d0f0, true, BLEND_MODES.SUBTRACT, 0xffffff, 0.2] as const, // Slope
  [`https://public.cx/3/bg/grid2.webp`, 0x404050, true, BLEND_MODES.ADD, 0xf03030, 0.3] as const, // Grid
];

const DESIGN_SPECS = {
  width: 1080,
  height: 1920,
};

export class VCombatScene extends Container {
  readonly designWidth = DESIGN_SPECS.width;
  readonly designHeight = DESIGN_SPECS.height;

  readonly backdrop;
  readonly ln;

  readonly tweeener = new TemporaryTweeener(this);

  constructor() {
    super();

    const BACKDROP_PRESET_INDEX = 0;

    {
      const [backdropTextureId, backdropTint, backdropStretch, lnBlendMode, lnTint, lnAlpha] =
        BACKDROP_PRESETS[BACKDROP_PRESET_INDEX];
      this.backdrop = Sprite.from(backdropTextureId);
      this.backdrop.anchor.set(0.5);
      this.backdrop.position.set(this.designWidth / 2, this.designHeight / 2);
      this.backdrop.tint = backdropTint;
      this.addChild(this.backdrop);
      Object.assign(this.backdrop, {
        onEnterFrame(this: Sprite) {
          const app = GameSingletons.getPixiApplicaiton();
          const { width, height } = app.screen;
          if (backdropStretch) {
            const scaleX = width / this.texture.width / this.parent.scale.x;
            const scaleY = height / this.texture.height / this.parent.scale.y;
            this.scale.set(scaleX, scaleY);
          } else {
            this.scale.set(1);
          }
        },
      });

      const lnTextureId = "https://public.cx/mock/ln2.jpg";
      this.ln = TilingSprite.from(lnTextureId, { width: this.designWidth, height: this.designHeight });
      this.ln.blendMode = lnBlendMode;
      this.ln.tint = lnTint;
      this.ln.scale.y = 2;
      this.ln.tileScale.y = 4;
      this.ln.alpha = lnAlpha;
      this.addChild(this.ln);
    }

    this.ln.visible = false;

    const border = new Graphics();
    border.lineStyle(4, 0xffffff);
    border.drawRect(0, 0, this.designWidth, this.designHeight);
    border.alpha = 0.05;
    this.addChild(border);
  }

  onEnterFrame() {
    const app = GameSingletons.getPixiApplicaiton();
    const SCALE = Math.min(app.screen.width / this.designWidth, app.screen.height / this.designHeight);
    this.scale.set(SCALE);
    this.position.set(
      0.5 * (app.screen.width - this.designWidth * SCALE),
      0.5 * (app.screen.height - this.designHeight * SCALE)
    );

    this.ln.tilePosition.y -= 20;
  }

  // addChildAtFractionalPosition(child: Sprite, x: number, y: number) {
  //   child.position.copyFrom(this.getFractionalPosition(x, y));
  //   this.addChild(child);
  // }

  getFractionalPosition(x: number, y: number) {
    return { x: x * this.designWidth, y: y * this.designHeight };
  }

  playShowAnimation() {
    return this.tweeener.from(this, { alpha: 0, duration: 0.5 });
  }

  playHideAnimation() {
    return this.tweeener.to(this, { alpha: 0, duration: 1.5 });
  }
}
