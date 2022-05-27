type IPoint = { x: number; y: number };
type IBounds = {
  x?: number;
  y?: number;
  width: number;
  height: number;
  alignment?: IPoint;
  maxScale?: number;
};

export function fitObjectInRectangle(
  target: {
    width: number;
    height: number;
    pivot: IPoint;
    position: IPoint;
    scale: IPoint;
    anchor?: IPoint;
  },
  bounds: IBounds
) {
  const { alignment = { x: 0.5, y: 0.5 }, maxScale = 1 } = bounds;

  const targetScaleX = (bounds.width * target.scale.x) / target.width;
  const targetScaleY = (bounds.height * target.scale.y) / target.height;
  const targetScale = Math.min(targetScaleX, targetScaleY, maxScale);
  target.scale.x = target.scale.y = targetScale;

  const boundsAnchorPositionX = bounds.x + alignment.x * bounds.width;
  const boundsAnchorPositionY = bounds.y + alignment.y * bounds.height;
  const targetAnchor = target.anchor ?? { x: 0, y: 0 };
  target.position.x =
    boundsAnchorPositionX +
    target.pivot.x * target.scale.x +
    (targetAnchor.x - alignment.x) * target.width;
  target.position.y =
    boundsAnchorPositionY +
    target.pivot.y * target.scale.y +
    (targetAnchor.y - alignment.y) * target.height;
}
