import { gsap } from "gsap/all";
import { Loader } from "@pixi/loaders";
import { Filter, filters, IMediaInstance, Sound } from "@pixi/sound";
import { AudioSettingsStorageController } from "./AudioSettingsStorageController";
import { CallbackList } from "@sdk/utils/callbacks/CallbackList";
import { startAnimationFrameLoop } from "./startAnimationFrameLoop";
import { Enchantments } from "@sdk/pixi/enchant/Enchantments";

type MusicTrack = {
  sound: Sound | null;
  instance: IMediaInstance | null;
  volumeMultiplier: number;
  stop: () => void;
};

const MusicManagerGlobalVolumeMultiplier = 1.0;

const NULL_TRACK: MusicTrack = Object.freeze({
  sound: null,
  instance: null,
  volumeMultiplier: 0,
  stop: () => console.warn(`MusicManager: Null track (which failed to load) would now have stopped.`),
});

export class MusicManager {
  private readonly storage = new AudioSettingsStorageController("musicVolume", "musicMuted");

  private readonly telephoneFilter = new filters.TelephoneFilter();
  private readonly equalizerFilter = new filters.EqualizerFilter();
  private readonly reverbFilter = new filters.ReverbFilter(1, 0);
  private readonly activeFilters = new Set<Filter>();

  private readonly trackStack: Array<MusicTrack> = [];
  get currentTrack() {
    return this.trackStack[this.trackStack.length - 1] as MusicTrack | undefined;
  }

  private _isMuted: boolean;
  get muted() {
    return this._isMuted;
  }
  set muted(value: boolean) {
    this.storage.muted = this._isMuted = value;
  }

  private _volume: number;
  get volume() {
    return this._volume;
  }
  set volume(value) {
    this.storage.volume = this._volume = value;
  }

  public fadeStrength = 0.0;

  private readonly enchantments = new Enchantments();

  constructor(private readonly pixiLoader: Loader) {
    this._volume = this.storage.volume;
    this._isMuted = this.storage.muted;

    startAnimationFrameLoop(this.enchantments.onEnterFrame.bind(this));

    this.enchantments.watch.array(
      () => [this.muted, this.volume, this.currentTrack, this.fadeStrength],
      () => {
        for (let i = 0; i < this.trackStack.length; i++) {
          const track = this.trackStack[i];
          this.updateTrackProperties(track);
        }
      },
      true
    );
  }

  private updateTrackProperties(track: MusicTrack) {
    // const controllable = track.sound;
    const controllable = track.instance;
    if (controllable) {
      controllable.muted = this.muted;
      controllable.volume =
        MusicManagerGlobalVolumeMultiplier * this.volume * track.volumeMultiplier * (1.0 - this.fadeStrength);
      // controllable.paused = track != this.currentTrack;
    }
  }

  addTrack(track: MusicTrack) {
    this.currentTrack?.sound?.pause();

    this.trackStack.push(track);
    this.updateTrackProperties(track);
  }

  removeTrack(track: MusicTrack) {
    track.sound?.stop();

    const index = this.trackStack.indexOf(track);
    this.trackStack.splice(index, 1);

    if (this.currentTrack) {
      this.currentTrack.sound?.resume();
      this.updateTrackProperties(this.currentTrack);
    }
  }

  playTrack(source: string | Sound, loop: boolean = true) {
    try {
      if (typeof source === "string") {
        const res = this.pixiLoader.resources[source];

        if (!res) {
          console.warn(`Could not find sound resource ["${source}"]`);
          return NULL_TRACK;
        }

        if (!res.sound) {
          throw new Error(`Could not find sound property on resource ["${source}"]`);
        }

        source = res.sound;
      }

      const sound = source;

      let stopped = false;
      const onStop = new CallbackList();
      const stopTrack = () => {
        stopped = true;
        onStop.callAllAndClear();
        this.removeTrack(track);
      };

      const track: MusicTrack = {
        sound: sound,
        instance: null,
        volumeMultiplier: 1,
        stop: stopTrack,
      };
      this.addTrack(track);

      //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP ////
      onStop.add(() => sound.stop()); // Temp fix, should figure out why music is not stopping wihtout it ////
      //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP //// TEMP ////
      Promise.resolve(sound.play())
        .then(instance => {
          if (stopped) {
            instance.stop();
          } else {
            track.instance = instance;
            instance.loop = loop;
            if (track != this.currentTrack) {
              instance.paused = true;
            }
            // onStop.add(() => instance.stop());

            this.updateTrackProperties(track);
          }
        })
        .catch(console.error);

      return track;
    } catch (e) {
      console.error(e);
      return NULL_TRACK;
    }
  }

  playSilence() {
    const stop = () => {
      this.removeTrack(track);
    };

    const track: MusicTrack = {
      sound: null,
      instance: null,
      volumeMultiplier: 0,
      stop,
    };
    this.addTrack(track);

    return stop;
  }

  mute() {
    this.muted = true;
  }

  unmute() {
    this.muted = false;
  }

  setVolume(volume: number) {
    this.volume = volume;
  }

  getVolume() {
    return this._volume;
  }

  fadeOutAllTracks(duration: number = 1) {
    return gsap.to(this, { fadeStrength: 1, duration, overwrite: true });
  }

  fadeInAllTracks(duration: number = 1) {
    return gsap.to(this, { fadeStrength: 0, duration, overwrite: true });
  }

  setLowPassFilter(str: number, fadeDuration: number | false = 1.0) {
    if (typeof fadeDuration === 'number' && fadeDuration > 0) {
      this.setFilterEnabled(this.equalizerFilter, true);
      gsap.to(this.equalizerFilter, {
        f1k: -20 * str,
        f2k: -20 * str,
        f4k: -30 * str,
        f8k: -30 * str,
        duration: fadeDuration,
        overwrite: true,
      });
    } else {
      this.setFilterEnabled(this.equalizerFilter, str > 0);
      this.equalizerFilter.f1k = -20 * str;
      this.equalizerFilter.f2k = -20 * str;
      this.equalizerFilter.f4k = -30 * str;
      this.equalizerFilter.f8k = -30 * str;
    }
  }

  setTelephoneFilter(enabled: boolean, instant: boolean = false) {
    const applyFilter = () => this.setFilterEnabled(this.telephoneFilter, enabled);
    const currentTrack = this.currentTrack;
    if (!instant && currentTrack) {
      MusicManager.fadeOutCallFunctionFadeIn(currentTrack, 0.8, applyFilter);
    } else {
      applyFilter();
    }
  }

  setReverbFilter(enabled: boolean, instant: boolean = false) {
    const applyFilter = () => this.setFilterEnabled(this.reverbFilter, enabled);
    const currentTrack = this.currentTrack;
    if (!instant && currentTrack) {
      MusicManager.fadeOutCallFunctionFadeIn(currentTrack, 0.8, applyFilter);
    } else {
      applyFilter();
    }
  }

  private setFilterEnabled(filter: Filter, enabled: boolean) {
    if (enabled) {
      this.activeFilters.add(filter);
    } else {
      this.activeFilters.delete(filter);
    }

    for (const track of this.trackStack) {
      if (track.sound) {
        track.sound.filters = [...this.activeFilters];
      }
    }
  }
}

export module MusicManager {
  export function fadeOutCallFunctionFadeIn(track: MusicTrack, duration: number, fn: () => void) {
    if (!track.sound) return Promise.resolve();

    const originalVolume = track.sound.volume;
    const tl = gsap.timeline();
    tl.to(track.sound, { volume: 0, duration: duration / 2 });
    tl.call(fn);
    tl.to(track.sound, { volume: originalVolume, duration: duration / 2 });
    return tl.play();
  }
}
