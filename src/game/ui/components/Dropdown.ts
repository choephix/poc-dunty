import { Texture } from "@pixi/core";
import { Container } from "@pixi/display";
import { Graphics } from "@pixi/graphics";
import { Rectangle } from "@pixi/math";
import { NineSlicePlane } from "@pixi/mesh-extras";
import { Sprite } from "@pixi/sprite";
import { ITextStyle, Text } from "@pixi/text";
import { AdvancedText } from "@sdk-pixi/display/AdvancedText";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

type Padding = {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
  [Symbol.iterator](): IterableIterator<number>;
};
type PaddingInput = number | [number, number] | [number, number, number, number] | Partial<Padding>;

export type DropdownStyle = {
  width: number;
  height: number;

  boxTextureId: string;
  boxScale: number;
  boxPadding: PaddingInput;
  boxTextureNineSlicing: PaddingInput;
  labelPadding: PaddingInput;
  labelStyle: Partial<ITextStyle>;
  labelTint: number;
  labelHoverTint: number;
  horizontalAlignment: number;

  optionsOffset: number | [number, number];
  optionsStyle: Partial<DropdownOptionStyle>;
};

export type DropdownOptionStyle = {
  itemHeight: number;

  boxTextureId: string;
  boxScale: number;
  boxPadding: PaddingInput;
  boxTextureNineSlicing: PaddingInput;
  labelPadding: PaddingInput;
  labelStyle: Partial<ITextStyle>;
  labelTint: number;
  labelHoverTint: number;
  horizontalAlignment: number;
};

export type DropdownOptionParams<T> = {
  text: string;
  value: T;
};

export class Dropdown<T = any> extends Container {
  onOptionSelected?: (optionValue: any) => void;

  private isOpen: boolean = false;
  private selectedOption?: DropdownOptionParams<T>;

  private readonly backgroundSprite;
  private readonly currentSelectionLabel;
  private readonly optionsList;
  private readonly arrow;

  private readonly processSelectionInput;
  private readonly tweeener = new TemporaryTweeener(this);

  constructor(
    options: DropdownOptionParams<T>[],
    style: Partial<DropdownStyle> = {},
    initialSelection?: DropdownOptionParams<T> | T | number
  ) {
    super();

    const { boxTextureId = "assets/images/ui-common/dropdown-pad.png", boxScale = 1.0 } = style;

    const boxTexture = Texture.from(boxTextureId);
    const sliceValues = processPaddingInput(
      style.boxTextureNineSlicing ?? [boxTexture.width * 0.5, boxTexture.height * 0.5]
    );
    this.backgroundSprite = new NineSlicePlane(boxTexture, ...sliceValues);
    this.backgroundSprite.scale.set(boxScale);
    this.addChild(this.backgroundSprite);

    const { width = this.backgroundSprite.width, height = this.backgroundSprite.height } = style;
    this.backgroundSprite.width = width / boxScale;
    this.backgroundSprite.height = height / boxScale;

    this.backgroundSprite.interactive = true;
    this.backgroundSprite.buttonMode = true;

    const boxPadding = processPaddingInput(style.boxPadding ?? 0);
    const labelPadding = processPaddingInput(style.labelPadding ?? 0);

    //// ARROW

    const arrowAreaSize = height - boxPadding.top - boxPadding.bottom;
    const arrowArea = new Rectangle(
      width - boxPadding.right - arrowAreaSize,
      boxPadding.top,
      arrowAreaSize,
      arrowAreaSize
    );

    this.arrow = this.makeToolTipArrow();
    this.arrow.scale.set(0.3);
    this.arrow.position.set(arrowArea.x + arrowArea.width * 0.5, arrowArea.y + arrowArea.height * 0.5);
    this.arrow.alpha = 0.2;
    this.addChild(this.arrow);

    this.backgroundSprite.on("pointerover", () => this.arrow.setHighlighted(true));
    this.backgroundSprite.on("pointerout", () => this.arrow.setHighlighted(false));

    //// LABEL

    const { horizontalAlignment = 0.5 } = style;
    const verticalAlignment = 0.5;

    this.currentSelectionLabel = new AdvancedText("", {
      fill: 0xffffff,
      fontSize: 24,
      ...style.labelStyle,
    });
    this.currentSelectionLabel.fitArea = {
      x: boxPadding.left + labelPadding.left,
      y: boxPadding.top + labelPadding.top,
      width: width - boxPadding.left - boxPadding.right - labelPadding.left - labelPadding.right - arrowAreaSize,
      height: height - boxPadding.top - boxPadding.bottom - labelPadding.top - labelPadding.bottom,
      alignment: { x: horizontalAlignment, y: verticalAlignment },
      maxScale: 1.0,
    };
    this.addChild(this.currentSelectionLabel);

    const { labelTint = 0xffffff, labelHoverTint = 0x00ffff } = style;
    this.currentSelectionLabel.tint = labelTint;
    this.backgroundSprite.on("pointerover", () => this.currentSelectionLabel.tweenTint(labelHoverTint, 0.2));
    this.backgroundSprite.on("pointerout", () => this.currentSelectionLabel.tweenTint(labelTint, 0.3));

    ////

    let { optionsOffset = 0 } = style;
    if (typeof optionsOffset === "number") {
      optionsOffset = [optionsOffset, optionsOffset];
    }
    this.optionsList = new DropdownComponentOptionsList(options, style.optionsStyle, width);
    this.optionsList.position.set(optionsOffset[0], height + optionsOffset[1]);
    this.optionsList.visible = false;
    this.optionsList.onOptionSelected = option => this.setCurrentSelection(option);
    this.addChild(this.optionsList);

    this.backgroundSprite.on("pointerup", () => this.setOptionsListOpen(!this.isOpen));

    this.processSelectionInput = (candidate?: typeof initialSelection): DropdownOptionParams<T> => {
      function isValidOptionReference(target: any): target is DropdownOptionParams<T> {
        return options.includes(target);
      }

      if (candidate != undefined) {
        if (isValidOptionReference(candidate)) return candidate;

        const optionWithCandidateAsValue = options.find(option => option.value === candidate);
        if (optionWithCandidateAsValue) return optionWithCandidateAsValue;

        if (typeof candidate === "number") {
          const optionWithCandidateAsIndex = options[candidate];
          if (optionWithCandidateAsIndex) return optionWithCandidateAsIndex;
        }
      }
      return options[0];
    };

    this.setCurrentSelection(this.processSelectionInput(initialSelection));
  }

  setCurrentSelection(option: DropdownOptionParams<T> | T | number) {
    this.setOptionsListOpen(false);

    option = this.processSelectionInput(option);

    if (this.selectedOption === option) {
      return;
    }

    this.selectedOption = option;

    this.onOptionSelected?.(option.value);

    const label = this.currentSelectionLabel;
    const newLabelText = option.text.toUpperCase();
    if (!label.text) {
      label.text = newLabelText;
    } else {
      animateTextSwap(label, newLabelText);
    }
  }

  setOptionsListOpen(isOpen: boolean) {
    this.isOpen = isOpen;
    this.arrow.setExpanded(isOpen);
    this.optionsList.visible = isOpen;
    if (isOpen) {
      this.optionsList.playShowAnimation();
    }
  }

  makeToolTipArrow(color: number = 0xffffff) {
    const graphics = new Graphics();
    graphics.beginFill(color);
    graphics.drawPolygon([0, 35, -40, -30, 40, -30]);
    graphics.endFill();

    const tweeener = new TemporaryTweeener(graphics);
    const tweenAlpha = tweeener.quickTo(graphics, "alpha", {
      duration: 0.24,
      ease: "back.out",
      overwrite: "auto",
    });
    const tweenRotation = tweeener.quickTo(graphics, "rotation", {
      duration: 0.18,
      ease: "power.inOut",
      overwrite: "auto",
    });
    return Object.assign(graphics, {
      setHighlighted: (isHighlighted: boolean) => tweenAlpha(isHighlighted ? 0.6 : 0.2),
      setExpanded: (isExpanded: boolean) => tweenRotation(isExpanded ? Math.PI : 0),
    });
  }

  async playShowAnimation() {
    this.backgroundSprite.interactive = false;
    this.currentSelectionLabel.alpha = 0;
    this.arrow.visible = false;
    await this.tweeener.from(this.backgroundSprite, { width: this.backgroundSprite.height, duration: 0.38 });
    await this.tweeener.to(this.currentSelectionLabel, { alpha: 1, duration: 0.31 });
    this.arrow.visible = true;
    await this.tweeener.from(this.arrow, { pixi: { scale: 0 }, ease: "back.out", duration: 0.18 });
    this.backgroundSprite.interactive = true;
  }
}

class DropdownComponentOptionsList<T> extends Container {
  onOptionSelected?: (optionProperties: DropdownOptionParams<T>) => void;

  constructor(options: DropdownOptionParams<T>[], style: Partial<DropdownOptionStyle> = {}, width: number) {
    super();

    const { boxTextureId = "assets/images/ui-common/dropdown-pad.png", boxScale = 1.0 } = style;

    const boxTexture = Texture.from(boxTextureId);
    const sliceValues = processPaddingInput(
      style.boxTextureNineSlicing ?? [boxTexture.width * 0.5, boxTexture.height * 0.5]
    );
    const backgroundSprite = new NineSlicePlane(boxTexture, ...sliceValues);
    backgroundSprite.scale.set(boxScale);
    this.addChild(backgroundSprite);

    backgroundSprite.width = width / boxScale;

    const { itemHeight = 50 } = style;

    const verticalAlignment = 0.5;
    const { horizontalAlignment = 0.5 } = style;
    const boxPadding = processPaddingInput(style.boxPadding ?? 0);
    const labelPadding = processPaddingInput(style.labelPadding ?? 0);

    const labels = [] as AdvancedText[];
    const itemWidth = width - boxPadding.left - boxPadding.right;
    let y = boxPadding.top;
    for (const optionProperties of options) {
      const { text } = optionProperties;
      const pad = new Sprite(Texture.WHITE);
      pad.tint = ~~(Math.random() * 0xffffff);
      pad.alpha = 0.4;
      pad.renderable = false;
      pad.interactive = true;
      pad.buttonMode = true;
      pad.position.set(boxPadding.left, y);
      pad.width = itemWidth;
      pad.height = itemHeight;
      pad.on("pointerup", () => this.onOptionSelected?.(optionProperties));
      this.addChild(pad);

      const label = new AdvancedText(text.toUpperCase(), {
        fill: 0xffffff,
        fontSize: 24,
        ...style.labelStyle,
      });
      label.fitArea = {
        x: pad.x + labelPadding.left,
        y: pad.y + labelPadding.top,
        width: itemWidth - labelPadding.left - labelPadding.right,
        height: itemHeight - labelPadding.top - labelPadding.bottom,
        alignment: { x: horizontalAlignment, y: verticalAlignment },
        maxScale: 1.0,
      };
      label.fitAreaIfSizeChanged.forceInvoke(); // TODO: Figure out why this is necessary

      labels.push(label);
      this.addChild(label);

      const { labelTint = 0xffffff, labelHoverTint = 0x00ffff } = style;
      label.tint = labelTint;
      pad.on("pointerover", () => label.tweenTint(labelHoverTint, 0.05));
      pad.on("pointerout", () => label.tweenTint(labelTint, 0.35));

      y += itemHeight;
    }
    y += boxPadding.bottom;

    const fullHeight = y / boxScale;
    backgroundSprite.height = fullHeight;

    const tweeener = new TemporaryTweeener(this);
    this.playShowAnimation = async () => {
      const tl = tweeener.createTimeline();
      const stagger = Math.min(0.075, 0.5 / labels.length);
      if (horizontalAlignment == 0.5) tl.from(labels, { alpha: 0, stagger, duration: 0.83 });
      else tl.from(labels, { alpha: 0, x: boxPadding.left, stagger, ease: "back.out" });
      tl.fromTo(backgroundSprite, { height: itemHeight }, { height: fullHeight, duration: labels.length * stagger }, 0);
      await tl.play();
    };
  }

  playShowAnimation: () => Promise<void>;
}

async function animateTextSwap(source: AdvancedText, newTextValue: string) {
  const maskRect = source.fitArea;

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
    source.fitAreaIfSizeChanged();

    source.fitArea = null;

    const tweenVars_Common: gsap.AnimationVars = {
      duration: 0.43,
      ease: "back.inOut",
      pixi: { y: source.y },
      overwrite: "auto",
    };
    const tweenVars_Enter: gsap.AnimationVars = {
      ...tweenVars_Common,
      pixi: { y: source.y + maskRect.height },
    };
    const tweenVars_Exit: gsap.AnimationVars = {
      ...tweenVars_Common,
      pixi: { y: source.y - maskRect.height },
    };

    // const tweenSource = new TemporaryTweeener(source).fromTo(source, tweenVars_Enter, tweenVars_Common);
    // const tweenTemp = new TemporaryTweeener(temp).fromTo(temp, tweenVars_Common, tweenVars_Exit);

    const tweenSource = new TemporaryTweeener(source).from(source, tweenVars_Enter);
    const tweenTemp = new TemporaryTweeener(temp).to(temp, tweenVars_Exit);

    await Promise.all([tweenSource, tweenTemp]);

    source.fitArea = maskRect;

    source.mask = null;
    temp.mask = null;

    mask.destroy();
    temp.destroy({ texture: true, baseTexture: true });
  }
}

const DEFAULT_PADDING = { top: 0, right: 0, bottom: 0, left: 0 };
function processPaddingInput(padding: PaddingInput): Padding {
  function makePaddingObject(top: number, right: number, bottom: number, left: number) {
    return {
      top,
      right,
      bottom,
      left,
      *[Symbol.iterator]() {
        yield top;
        yield right;
        yield bottom;
        yield left;
      },
    };
  }
  if (typeof padding === "number") {
    return makePaddingObject(padding, padding, padding, padding);
  }
  if (Array.isArray(padding)) {
    if (padding.length === 2) {
      return makePaddingObject(padding[0], padding[1], padding[0], padding[1]);
    }
    if (padding.length === 4) {
      return makePaddingObject(padding[0], padding[1], padding[2], padding[3]);
    }
  }
  return makePaddingObject(
    padding.top ?? DEFAULT_PADDING.top,
    padding.right ?? DEFAULT_PADDING.right,
    padding.bottom ?? DEFAULT_PADDING.bottom,
    padding.left ?? DEFAULT_PADDING.left
  );
}
