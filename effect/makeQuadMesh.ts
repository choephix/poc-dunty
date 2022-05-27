import { Geometry, Shader, State } from "@pixi/core";
import { Mesh } from "@pixi/mesh";

function makeQuadGeometry(
  size: number,
  [anchorX, anchorY]: [number, number]
): Geometry {
  /**
   * @constant [number, number]
   * Calculate mesh pivot according to the anchor argument.
   * * [0.0, 0.0] for top left,
   * * [1.0, 1.0] for bottom right,
   * * [0.5, 0.5] for center.
   * * etc.
   **/
  const [x, y] = [anchorX * size, anchorY * size]; //// Pivots
  return new Geometry()
    .addAttribute(
      'aVert',
      [x, y, /**/ x + size, y, /**/ x + size, y + size, /**/ x, y + size],
      2
    )
    .addAttribute('aUvs', [0, 0, /**/ 1, 0, /**/ 1, 1, /**/ 0, 1], 2)
    .addIndex([0, 1, 2, 0, 2, 3]);
}

export function makeQuadMesh(
  size: number,
  anchor: [number, number],
  vertexSrc: string,
  fragmentSrc: string,
  uniforms: Record<string, any>
): Mesh<Shader> {
  return new Mesh(
    makeQuadGeometry(size, anchor),
    Shader.from(vertexSrc, fragmentSrc, uniforms),
    State.for2d()
  );
}
