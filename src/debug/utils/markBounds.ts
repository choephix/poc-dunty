import { GameContext } from "@game/app/app";
import { GameSingletons } from "@game/app/GameSingletons";
import { Container, DisplayObject } from "@pixi/display";
import { Graphics } from "@pixi/graphics";
import { IRect } from "@sdk/core/common.types";
import { onEnterFrame } from "@sdk/utils/frameloops/onEnterFrame";
import { waitUntil } from "@sdk/utils/frameloops/waitUntil";
import { getTopParent } from "@sdk/utils/pixi/getTopParent";
import { __window__ } from "../__";

type AreaGetter =
  | {
      getBounds: () => { x: number; y: number; width: number; height: number };
      toGlobal?: (point: { x: number; y: number }) => { x: number; y: number };
    }
  | {
      __getBounds: () => { x: number; y: number; width: number; height: number };
    };

function getGameContext() {
  return GameSingletons.getGameContext() as GameContext;
}

export function markBounds(target: DisplayObject | AreaGetter | {}, color: number = 0xff00ff, thickness: number = 1) {
  const {
    app: { stage },
  } = getGameContext();

  const g = new Graphics();
  g.zIndex = Number.MAX_SAFE_INTEGER;
  stage?.addChild(g);

  const end = onEnterFrame(() => {
    if (target instanceof Container) {
      if (!target.parent) {
        g.alpha = 0.5;
        return;
      }
    }

    g.alpha = 1.0;

    const bounds = "getBounds" in target ? target.getBounds() : "__getBounds" in target ? target.__getBounds() : null;

    if (bounds) {
      g.clear();
      g.lineStyle(thickness, color);
      g.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);

      const origin = "toGlobal" in target && target.toGlobal?.({ x: 0, y: 0 });
      if (origin) {
        let { x, y } = origin;
        g.lineStyle(thickness, color);
        g.drawCircle(x, y, 4);
        g.drawCircle(x, y, 8);
        g.drawCircle(x, y, 12);
        g.drawCircle(x, y, 16);
        g.drawCircle(x, y, 20);
      }
    }
  });

  return () => {
    end();
    stage?.removeChild(g);
  };
}

export function markRect(target: Container, rect: IRect, color: number = 0xff00ff, thickness: number = 1) {
  const {
    app: { stage },
  } = getGameContext();

  const g = new Graphics();
  g.zIndex = Number.MAX_SAFE_INTEGER;
  target.addChild(g);

  g.alpha = 0.5;

  g.clear();
  g.lineStyle(thickness, color);
  g.drawRect(rect.x, rect.y, rect.width, rect.height);

  return () => {
    target.removeChild(g);
  };
}
