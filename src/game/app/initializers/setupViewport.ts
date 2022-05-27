import { __window__ } from "@debug/__";
import { Rectangle } from "@pixi/math";
import { lerp } from "@sdk/utils/math";
import { IAnimateOptions, Viewport } from "pixi-viewport";
import { ViewSize } from "../services/ViewSize";
import { Ticker } from "../ticker";
import { setupViewportKeyboardController } from "./setupViewportKeyboardController";
import { __urlParams__ } from "../__urlParams__";
export type ZoomTier = 1 | 2 | 3;

const zoomTierConfigs: Record<string, number[]> & { default: number[] } = {
  decor: [0.5, 0.0019, 0.009],
  stations: [0.5, 0.4, 0.009],
  true: [0.5, 0.4, 0.009],

  default: [0.2, 0.059, 0.018],
};

// export const ZOOM_TIERS = [10, 0.075, 0.005, 0.00175];
// export const ZOOM_TIERS = [10, 0.65, 0.084, 0.015];
// export const ZOOM_TIERS = [0.65, 0.084, 0.015];
// export const ZOOM_TIERS = [0.5, 0.065, 0.019];
export const ZOOM_TIERS = zoomTierConfigs["" + __urlParams__.edit] || zoomTierConfigs.default;

export function setupViewport(context: { viewSize: ViewSize; ticker: Ticker }) {
  const { viewSize, ticker } = context;

  const worldWidth = 2048 * 32;
  const worldHeight = 2048 * 32;

  const viewport: Viewport = new Viewport({
    screenWidth: innerWidth,
    screenHeight: innerHeight,
    worldWidth,
    worldHeight,
    stopPropagation: true,
  });

  viewport
    // .drag({ mouseButtons: 'left, middle, right' })
    // .drag({ mouseButtons: 'right' })
    .drag({ mouseButtons: "left, middle" })
    .decelerate({ friction: 0.9 })
    .pinch({
      percent: 2,
    })
    .wheel({
      wheelZoom: true,
      smooth: 25,
      percent: 1,
    })
    .clampZoom({
      minScale: ZOOM_TIERS[ZOOM_TIERS.length - 1],
      maxScale: ZOOM_TIERS[0],
    });

  let boundsEnabled = true;
  function assureWithinAllowedRegion() {
    if (!boundsEnabled) {
      return;
    }

    const screenRect = new Rectangle(0, 0, viewSize.width, viewSize.height);
    const screenCenter = {
      x: viewSize.width / 2,
      y: viewSize.height / 2,
    };
    const worldPosition = viewport.position;
    const worldSize = {
      width: viewport.worldWidth * viewport.scaled,
      height: viewport.worldHeight * viewport.scaled,
    };
    const worldRect = new Rectangle(
      worldPosition.x - 0.5 * worldSize.width,
      worldPosition.y - 0.5 * worldSize.height,
      worldSize.width,
      worldSize.height
    );
    const gap = {
      left: worldRect.left - screenRect.left,
      top: worldRect.top - screenRect.top,
      right: screenRect.width - worldRect.right,
      bottom: screenRect.height - worldRect.bottom,
    };

    let position = {
      x: undefined as undefined | number,
      y: undefined as undefined | number,
    };

    if (worldWidth <= screenRect.width) {
      position.x = screenCenter.x;
    } else if (gap.left > 0 && gap.right > 0) {
      position.x = screenCenter.x;
    } else if (gap.left > 0) {
      position.x = screenRect.left + worldRect.width * 0.5;
    } else if (gap.right > 0) {
      position.x = screenRect.right - worldRect.width * 0.5;
    }

    if (worldHeight <= screenRect.height) {
      position.y = screenCenter.y;
    } else if (gap.top > 0 && gap.bottom > 0) {
      position.y = screenCenter.y;
    } else if (gap.top > 0) {
      position.y = screenRect.top + worldRect.height * 0.5;
    } else if (gap.bottom > 0) {
      position.y = screenRect.bottom - worldRect.height * 0.5;
    }

    if (position.x !== undefined) {
      viewport.x = position.x;
    }

    if (position.y !== undefined) {
      viewport.y = position.y;
    }
  }

  viewport.on("moved", () => assureWithinAllowedRegion());

  ticker.add(() => {
    viewport.resize(viewSize.width, viewSize.height);
  });

  // viewport.setZoom(lerp(ZOOM_TIERS[0], ZOOM_TIERS[1], 0.75), true);
  viewport.setZoom(lerp(ZOOM_TIERS[0], ZOOM_TIERS[2], 0.75), true);

  const worldViewport = Object.assign(viewport, {
    get boundsEnabled() {
      return boundsEnabled;
    },
    set boundsEnabled(value) {
      boundsEnabled = value;
      if (boundsEnabled) {
        assureWithinAllowedRegion();
      }
    },

    assureWithinAllowedRegion,

    getCurrentZoomTier() {
      return ZOOM_TIERS.findIndex(zoom => viewport.scaled >= zoom);
    },

    moveTo(x: number, y: number, seconds: number = 0.4) {
      const animateSnapTo: Partial<IAnimateOptions> = {
        position: { x, y },
        scale: 0.085,
        time: seconds * 1000,
        ease: "easeInOutQuad",
      };
      viewport.animate(animateSnapTo);
    },
  });

  setupViewportKeyboardController(worldViewport);

  return worldViewport;
}

export type WorldViewport = ReturnType<typeof setupViewport>;
