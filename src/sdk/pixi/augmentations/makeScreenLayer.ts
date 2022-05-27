import { __window__ } from "@debug/__";
import { Container } from "@pixi/display";
import { Point } from "@pixi/math";
import { getTopParent } from "@sdk/utils/pixi/getTopParent";

export function makeScreenLayer<T extends Container>(target: T) {
  const originalMethod = target.render;

  const POINT_ZERO = Object.freeze(new Point(0, 0));
  const localTopLeft = new Point();
  const screenSize = new Point();

  target.render = function (renderer) {
    target.position.set(0, 0);
    target.scale.set(1, 1);

    const stage = getTopParent(target);
    if (stage) {
      screenSize.set(renderer.width, renderer.height);
      screenSize.multiplyScalar(1 / renderer.resolution, screenSize);
      // screenSize.multiplyScalar(__window__.devicePixelRatio);
      target.toLocal(POINT_ZERO, stage, localTopLeft);
      target.toLocal(screenSize, stage, screenSize);
      screenSize.subtract(localTopLeft, screenSize);

      target.position.copyFrom(localTopLeft);
      target.width = screenSize.x;
      target.height = screenSize.y;

      target.updateTransform();
    }

    return originalMethod.call(this, renderer);
  };
}
