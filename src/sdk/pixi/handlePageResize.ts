import { Application } from "@pixi/app";
import { EnchantedInstance } from "./enchant/interfaces";

type GameContext = {
  app: Application;
  stage: EnchantedInstance;
  viewSize: {
    width: number;
    height: number;
  };
  viewport: {
    screenWidth: number;
    screenHeight: number;
  };
};

export function handlePageResize(
  { app, stage, viewSize, viewport }: GameContext,
  fn: (size: { width: number; height: number }) => void
) {
  stage.enchantments.watch.array(
    () => [window.innerWidth, window.innerHeight],
    ([width, height]) => {
      viewSize.width = width;
      viewSize.height = height;
      app.renderer.resize(width, height);
      viewport.screenWidth = width;
      viewport.screenHeight = height;
      fn(viewSize);
    },
    true
  );
}
