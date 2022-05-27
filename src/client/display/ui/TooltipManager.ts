import { GameSingletons } from "@client/core/GameSingletons";
import { ToolTipComponent } from "@game/ui/popups/components/ToolTipComponent";
import { Container, DisplayObject } from "@pixi/display";
import type { InteractionManager } from "@pixi/interaction";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

type TooltipOptions = {
  content: string;
  horizontalAlign: number;
  verticalAlign: 1 | -1;
  position: { x: number; y: number };
  delay: number;
  wordWrapWidth: number;
};

const DEFAULT_DELAY = 700;

export class TooltipManager {
  private currentTooltip: ToolTipComponent | null = null;
  private currentTarget: DisplayObject | null = null;
  private timeoutHandle: NodeJS.Timeout | null = null;

  public readonly targets = new Map<DisplayObject, Partial<TooltipOptions>>();

  constructor(public readonly container: Container) {
    this.handleClearOnClick();
  }

  handleClearOnClick() {
    const clear = () => this.setCurrentTooltipTarget(null);
    document.addEventListener("click", clear);
    document.addEventListener("tap", clear);
  }

  clearDestroyedTargets() {
    for (const [target] of this.targets) {
      if (target.destroyed) {
        this.targets.delete(target);
      }
    }
  }

  registerTarget(target: DisplayObject, options: Partial<TooltipOptions> | string) {
    if (typeof options === "string") {
      options = { content: options };
    }

    this.targets.set(target, options);

    const { delay = DEFAULT_DELAY } = options;

    const clearCurrentTimeout = () => {
      if (this.timeoutHandle) {
        clearTimeout(this.timeoutHandle);
        this.timeoutHandle = null;
      }
    };

    const on = () => {
      clearCurrentTimeout();

      this.timeoutHandle = setTimeout(() => this.setCurrentTooltipTarget(target), delay);
    };

    const off = () => {
      clearCurrentTimeout();

      if (this.currentTarget === target) {
        this.setCurrentTooltipTarget(null);
      }

      requestAnimationFrame(() => this.clearDestroyedTargets());
    };

    target.interactive = true;
    target.on("pointerover", on);
    target.on("pointerout", off);
    target.on("removed", off);

    return () => {
      off();
      target.off("pointerover", on);
      target.off("pointerout", off);
      target.off("removed", off);
    };
  }

  private setCurrentTooltipTarget(target: DisplayObject | null) {
    if (this.currentTarget === target) {
      return;
    }

    if (this.currentTooltip) {
      this.hideAndDestroy(this.currentTooltip);
      this.currentTooltip = null;
      this.currentTarget = null;

      this.clearDestroyedTargets();
    }

    if (target == null) {
      return;
    }

    const options = this.targets.get(target);

    if (options == null || options.content == undefined) {
      return;
    }

    const app = GameSingletons.getPixiApplicaiton();
    const interaction = app.renderer.plugins.interaction as InteractionManager;
    const mousePosition = interaction.mouse.global;

    const getDefaultHorizontalAnchor = () => {
      return (mousePosition.x / app.view.width) * 2 - 1;
    };
    const getDefaultVerticalAnchor = () => {
      return mousePosition.y > app.view.height * 0.9 ? -1 : 1;
    };

    const { horizontalAlign = getDefaultHorizontalAnchor(), verticalAlign = getDefaultVerticalAnchor() } = options;

    const getDefaultPosition = () => {
      const bounds = target.getBounds(true);
      const x = bounds.x + bounds.width / 2;
      if (verticalAlign === 1) {
        return { x, y: bounds.y + bounds.height };
      } else {
        return { x, y: bounds.y };
      }
    };
    const { content, wordWrapWidth, position = getDefaultPosition() } = options;

    const tooltip = new ToolTipComponent(content, horizontalAlign, verticalAlign, wordWrapWidth);
    tooltip.position.copyFrom(position);
    tooltip.scale.set(0.6);

    this.container.addChild(tooltip);

    this.currentTarget = target;
    this.currentTooltip = tooltip;

    this.playShowAnimationOn(tooltip);
  }

  playShowAnimationOn(tooltip: ToolTipComponent) {
    const tweeener = new TemporaryTweeener(tooltip);
    return tweeener.from(tooltip, {
      pixi: { scale: 0, alpha: 0 },
      duration: 0.457,
      ease: "back.out",
    });
  }

  hideAndDestroy(tooltip: ToolTipComponent) {
    const tweeener = new TemporaryTweeener(tooltip);
    return tweeener.to(tooltip, {
      pixi: { scale: 0.3, alpha: 0 },
      duration: 0.14,
      ease: "power2.in",
      onComplete: () => tooltip.destroy(),
    });
  }
}
