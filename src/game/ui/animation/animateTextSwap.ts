import { Graphics } from "@pixi/graphics";
import { IPointData, Rectangle } from "@pixi/math";
import { Text } from "@pixi/text";
import { fitObjectInRectangle } from "@sdk-pixi/layout/fitObjectInRectangle";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

export async function animateTextSwap(
  source: Text,
  newTextValue: string,
  maskRect: { x: number; y: number; width: number; height: number },
  direction: IPointData = { x: 0, y: 1 }
) {
  if (!maskRect) {
    source.text = newTextValue;
    return;
  }

  const temp = new Text(source.text);
  temp.style = source.style;
  temp.position.set(source.x, source.y);
  temp.anchor.set(source.anchor.x, source.anchor.y);
  temp.scale.set(source.scale.x, source.scale.y);
  temp.alpha = source.alpha;
  temp.rotation = source.rotation;
  temp.tint = source.tint;
  source.parent.addChild(temp);

  // Draw graphics rectangle
  const mask = new Graphics();
  mask.beginFill(~~(Math.random() * 0xffffff), 0.5);
  mask.drawRect(maskRect.x, maskRect.y, maskRect.width, maskRect.height);
  mask.endFill();
  source.parent.addChild(mask);

  {
    source.mask = mask;
    temp.mask = mask;

    source.text = newTextValue;
    fitObjectInRectangle(source, maskRect);

    const tweenVars_Common: gsap.AnimationVars = {
      duration: 0.43,
      ease: "power2.out",
      pixi: { x: source.x, y: source.y },
      overwrite: "auto",
    };
    const tweenVars_Enter: gsap.AnimationVars = {
      ...tweenVars_Common,
      pixi: {
        x: source.x + direction.x * maskRect.width,
        y: source.y + direction.y * maskRect.height,
      },
    };
    const tweenVars_Exit: gsap.AnimationVars = {
      ...tweenVars_Common,
      pixi: {
        x: source.x - direction.x * maskRect.width,
        y: source.y - direction.y * maskRect.height,
      },
    };

    const tweenSource = new TemporaryTweeener(source).from(source, tweenVars_Enter);
    const tweenTemp = new TemporaryTweeener(temp).to(temp, tweenVars_Exit);

    await Promise.all([tweenSource, tweenTemp]);

    source.mask = null;
    temp.mask = null;

    mask.destroy();
    temp.destroy({ texture: true, baseTexture: true });
  }
}
