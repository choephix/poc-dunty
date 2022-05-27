import { UninitializedGameContext } from "../app";

const REASON_TO_DIM = "page_invisible";

export function stopAppOnPageInvisible(context: UninitializedGameContext) {
  const {
    app: { stage, renderer },
    ticker,
    dimmer,
  } = context;

  document.onvisibilitychange = async e => {
    const visible = document.visibilityState === "visible";

    stage.renderable = visible;

    if (visible) {
      ticker.start();
    } else {
      ticker.stop();
    }

    if (stage.renderable) {
      const color = renderer.backgroundColor;
      renderer.backgroundColor = 0x0;

      (<any>renderer).clear();

      dimmer.reasonsToShow.add(REASON_TO_DIM);
      dimmer.forceShow();

      await ticker.delayFrames(6);

      dimmer.reasonsToShow.remove(REASON_TO_DIM);

      if (color > 0x0) {
        renderer.backgroundColor = color;
      }
    }
  };
}
