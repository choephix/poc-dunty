import { MusicManager } from "../sound/MusicManager";
import { SfxManager } from "../sound/sfxManager";
import { sound as pixiSound } from "@pixi/sound";
import { Loader } from "@pixi/loaders";

export function setupAudioManagers(pixiLoader: Loader) {
  /**
   * We need to figure out why this import is needed for @pixi/sound to work.
   */
  [pixiSound];

  return {
    music: new MusicManager(pixiLoader),
    sfx: new SfxManager(),
    disableGlobalAudioWhilePageNotVisible: () => {
      function onVisibilityChange() {
        const shouldMute = document.visibilityState == "hidden";
        pixiSound.volumeAll = shouldMute ? 0 : 1;
      }

      document.addEventListener("visibilitychange", onVisibilityChange);

      /**
       * For good manners, return a function that will remove the event listener we just added.
       */
      return () => {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    },
  };
}
