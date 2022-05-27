import { Application, IApplicationOptions } from "@pixi/app";
import { Renderer } from "@pixi/core";

import "@pixi/events";

import { InteractionManager } from "@pixi/interaction";
Renderer.registerPlugin("interaction", InteractionManager);

import { BatchRenderer } from "@pixi/core";
Renderer.registerPlugin("batch", BatchRenderer);

import { TilingSpriteRenderer } from "@pixi/sprite-tiling";
Renderer.registerPlugin("tilingSprite", TilingSpriteRenderer);

import { AppLoaderPlugin, Loader } from "@pixi/loaders";
import { SpritesheetLoader } from "@pixi/spritesheet";
Application.registerPlugin(AppLoaderPlugin);
Loader.registerPlugin(SpritesheetLoader);

import "@pixi/math-extras";
import { Ticker } from "@pixi/ticker";

import { skipHello } from "@pixi/utils";

import * as PIXI from "@pixi/display";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { callOnEnterFrameRecursively } from "@sdk/pixi/enchant/oef/callOnEnterFrameRecursively";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

gsap.defaults({ overwrite: "auto" });
gsap.ticker.lagSmoothing(33, 33);

skipHello();

const APP_DIV_ID = "app";
const CANVAS_ID = "canvas";

export function boot(applicationOptions: Partial<IApplicationOptions> = {}) {
  const parentElement = document.getElementById(APP_DIV_ID) ?? document.body;
  const canvas = document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;

  const app = new Application({
    backgroundColor: 0x1f1f1f,
    //backgroundColor: 0xFFFFFF,
    resolution: window.devicePixelRatio || 1,
    view: canvas || undefined,
    resizeTo: parentElement,
    autoDensity: true,
    antialias: true,
    sharedTicker: true,
    autoStart: true,
    ...applicationOptions,
  });

  parentElement.innerHTML = ``;
  parentElement.appendChild(app.view);

  const onlyIfPageVisible = (callback: () => void) => () => void (document.visibilityState === "visible" && callback());
  const ticker = new Ticker();
  ticker.start();
  ticker.add(
    onlyIfPageVisible(() => app.render()),
    null,
    -100
  );
  ticker.add(
    onlyIfPageVisible(() => callOnEnterFrameRecursively(app.stage)),
    null,
    99
  );
  app.ticker = ticker;

  return app;
}
