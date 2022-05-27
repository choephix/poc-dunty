import { Geometry, Shader, State, Texture } from "@pixi/core";
import { IPointData } from "@pixi/math";
import { Mesh } from "@pixi/mesh";
import { deleteUndefinedObjectProperties } from "@sdk/helpers/objects";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";
import { EnchantmentGlobals } from "@sdk/pixi/enchant/EnchantmentGlobals";
import { fragmentSrc } from "./shader.frag";
import { vertexSrc } from "./shader.vert";

function makeQuadGeometry(size: number, [anchorX, anchorY]: [number, number]): Geometry {
  const [x1, y1] = [anchorX * size, anchorY * size]; //// Pivot
  const [x2, y2] = [x1 + size, y1 + size];
  return new Geometry()
    .addAttribute("aVert", [x1, y1, /**/ x2, y1, /**/ x2, y2, /**/ x1, y2], 2)
    .addAttribute("aUvs", [0, 0, /**/ 1, 0, /**/ 1, 1, /**/ 0, 1], 2)
    .addIndex([0, 1, 2, 0, 2, 3]);
}

export class CardGlowMesh extends Mesh<Shader> {
  readonly tweeener = new TemporaryTweeener(this);

  constructor(
    textureMask: Texture,
    textureNoise: Texture,
    uniformOverrides?: Partial<{ colorLow: [number, number, number]; colorHigh: [number, number, number] }>
  ) {
    const uniforms = {
      time: performance.now() - Math.random() * 10000,
      tex0: textureMask,
      tex1: textureNoise,
      alpha: 1.0,

      // noiseScale: 0.1,
      // colorLow: [1, 0, 0],
      // colorHigh: [0, 6, 16],

      noiseScale: 0.1,
      colorLow: [0, 0.6, 0.9],
      colorHigh: [4, 16, 12],
      // colorLow: [0.8, 0, 0],
      // colorHigh: [0, 6, 12],

      ...(uniformOverrides && deleteUndefinedObjectProperties(uniformOverrides)),
    };

    super(makeQuadGeometry(128, [0.0, 0.0]), Shader.from(vertexSrc, fragmentSrc, uniforms), State.for2d());
  }

  onEnterFrame() {
    this.advanceTime(50 * EnchantmentGlobals.timeDelta);
  }

  private advanceTime(dt: number) {
    this.shader.uniforms.time += dt;
    this.shader.uniforms.alpha = this.worldAlpha;
  }

  async playShowAnimation() {
    this.alpha = 0;
    await this.tweeener.to(this, { alpha: 1, duration: 0.9, ease: "back(9.5).out" });
  }

  async playHideAnimation() {
    await this.tweeener.to(this, { alpha: 0, duration: 1.4, ease: "power4.out" });
  }

  containsPoint({ x, y }: IPointData): boolean {
    if (x < 0) return false;
    if (y < 0) return false;
    if (x > this.width) return false;
    if (y > this.height) return false;
    return true;
  }
}
