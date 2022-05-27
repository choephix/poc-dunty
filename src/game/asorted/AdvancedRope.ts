import { Texture } from "@pixi/core";
import { RopeGeometry, SimpleRope } from "@pixi/mesh-extras";
import { findLRTB } from "@sdk/utils/math2D";

export class AdvancedRope extends SimpleRope {
  /**
   * Make sure SimpleRope.autoUpdate is set to false by default,
   * for possible performance gains.
   */
  public autoUpdate = false;

  /**
   * Simple getter for SimpleRope.geometry, pre-typed as RopeGeometry.
   *
   * Also overrides the 'textureScale' property to be settable,
   * as opposed to read-only, as it is in the base SimpleRope class.
   *
   * We'll need that if we want to change the width of the track dynamically
   * (via the RailTrackVisual.textureScale property).
   *
   * Not sure why PixiJS defines RopeGeometry.textureScale as read-only.
   * Updating the property at runtime seemingly does not break anything,
   * even if it can come with a slight performance cost if called on
   * many instances every frame.
   */
  public get ropeGeometry() {
    return this.geometry as RopeGeometry & { textureScale: number };
  }

  /**
   * Wraps the SimpleRope.textureScale property,
   *
   * Positive values scale rope texture keeping its aspect ratio.
   * This means textureScale will essentially set the width of the track
   * (devided by the texture's height).
   *
   * If set to zero, texture will be stretched instead.
   */
  public set textureScale(value: number) {
    this.ropeGeometry.textureScale = value;
    this.ropeGeometry.update();
  }

  public get textureScale() {
    return this.ropeGeometry.textureScale;
  }

  /**
   * Pre-baked left, right, top and bottom bounds of the mesh.
   *
   * Useful for determining if a rail-track mesh is likely to intersect with a rectangle.
   *
   * Culling tasks would be a common example for when you would want to skip rendering
   * objects that are not in the viewport.
   */
  public readonly lrtb = findLRTB(this.ropeGeometry.points) as [number, number, number, number];

  constructor(texture: Texture, points: { x: number; y: number }[], textureScale?: number) {
    super(texture, points as any, textureScale);
  }
}
