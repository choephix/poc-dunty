import { tweenTintProperty } from "@game/asorted/animations/tweenTintProperty";
import { ITextStyle, Text } from "@pixi/text";
import { fitObjectInRectangle } from "@sdk-pixi/layout/fitObjectInRectangle";
import { invokeOnlyIfValueChanged } from "@sdk/utils/callbacks/invokeOnlyIfValueChanged";

type FitArea = Parameters<typeof fitObjectInRectangle>[1];

/**
 * Extension of PixiJs's Text class, with built-in support for:
 * - tint tweening
 * - auto-sizing and placement inside provided area
 */
export class AdvancedText extends Text {
  public fitArea: FitArea | null = null;

  constructor(text: string, style: Partial<ITextStyle> = {}) {
    super(text, style);

    this.tweenTint = tweenTintProperty.makeServiceMethod(this, { duration: 0.4, ease: "power.out" });

    this.fitAreaIfSizeChanged = _fitAreaIfSizeChanged(this);

    this.fitAreaIfSizeChanged.forceInvoke();
  }

  public readonly tweenTint;

  public readonly fitAreaIfSizeChanged;

  updateTransform() {
    this.fitAreaIfSizeChanged();
    super.updateTransform();
  }
}

function _fitAreaIfSizeChanged(target: AdvancedText) {
  function getCurrentSize() {
    return target.width * target.height;
  }

  function updateSizeAndPositionToFitArea() {
    if (target.fitArea == null) return;
    fitObjectInRectangle(target, target.fitArea);
  }

  return invokeOnlyIfValueChanged(updateSizeAndPositionToFitArea, getCurrentSize);
}
