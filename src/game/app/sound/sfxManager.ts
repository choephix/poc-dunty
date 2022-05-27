import { Loader } from "@pixi/loaders";
import { Sound } from "@pixi/sound";

type SfxSound = Sound & { name?: string };

export class SfxManager {
  sfxPlaying: Array<SfxSound> = [];
  globalVolume: number = 1;

  get isMuted() {
    if (localStorage.getItem("sfxIsMuted") == "true") {
      return true;
    } else {
      return false;
    }
  }

  constructor() {
    const supportedTypes = this.getSupportedAudioFileTypes();
    console.log("Supported Sound Types", supportedTypes);

    this.globalVolume = parseFloat(localStorage.getItem("sfxGlobalVolume") || "1");
  }

  play(
    sndName: string,
    loop: boolean = false,
    multipleInstanceStrategy: SfxManager.MultipleInstanceStrategy = SfxManager.MultipleInstanceStrategy.IgnoreNew,
    speed: number = 1
  ) {
    let sound: SfxSound | undefined;

    if (multipleInstanceStrategy === SfxManager.MultipleInstanceStrategy.IgnoreNew) {
      for (const s of this.sfxPlaying) {
        if (s.name != sndName) continue;
        return Object.assign(() => void 0, {});
      }
    } else if (multipleInstanceStrategy === SfxManager.MultipleInstanceStrategy.StopPrevious) {
      for (const s of this.sfxPlaying) {
        if (s.name != sndName) continue;
        s.stop();
      }
    }

    Loader.shared.load(async resources => {
      if (resources.resources[sndName]) {
        let vol;
        vol = this.globalVolume;

        sound = Sound.from(resources.resources[sndName]) as SfxSound;
        sound.loop = loop;
        sound.volume = vol;
        sound.name = sndName;
        sound.singleInstance = false;
        this.sfxPlaying.push(sound);

        const mediaInstance = await sound.play();
        mediaInstance.speed = speed;
        mediaInstance.on("end", () => {
          this.updateSfxArray();
        });
      } else {
        console.log(sndName + " doesn't exist");
      }
    });

    const stop = () => {
      sound?.stop();
      this.updateSfxArray();
    };

    return Object.assign(stop, {});
  }

  mute() {
    this.setVolume(0);
    localStorage.setItem("sfxIsMuted", "true");
  }

  unmute() {
    localStorage.setItem("sfxIsMuted", "false");
    this.setVolume(+(localStorage.getItem("sfxGlobalVolume") || "1"));
  }

  setVolume(volume: number, saveVolume: boolean = false) {
    for (let i = 0; i < this.sfxPlaying.length; i++) {
      this.sfxPlaying[i].volume = volume;
    }
    if (saveVolume) {
      localStorage.setItem("sfxGlobalVolume", volume.toString());
    }

    this.globalVolume = volume;
  }

  getVolume() {
    return this.globalVolume;
  }

  updateSfxArray() {
    //remove the first sound that isn't playing
    const i = this.sfxPlaying.findIndex(sound => sound.isPlaying);
    this.sfxPlaying.splice(i, 1);
  }

  getSupportedAudioFileTypes() {
    let audio = document.createElement("audio");
    const supportedTypes = {
      OGG: "",
      MP3: "",
      AAC: "",
      WAV: "",
      Opus: "",
      WEBM: "",
      ThreeGP: "",
      ThreeGP2: "",
      MID: "",
      MIDI: "",
    };
    supportedTypes["OGG"] = audio.canPlayType("audio/ogg");
    supportedTypes["MP3"] = audio.canPlayType("audio/mpeg");
    supportedTypes["AAC"] = audio.canPlayType("audio/aac");
    supportedTypes["WAV"] = audio.canPlayType("audio/wav");
    supportedTypes["Opus"] = audio.canPlayType("audio/opus");
    supportedTypes["WEBM"] = audio.canPlayType("audio/webm");
    supportedTypes["ThreeGP"] = audio.canPlayType("audio/3gpp");
    supportedTypes["ThreeGP2"] = audio.canPlayType("audio/3gpp2");
    supportedTypes["MID"] = audio.canPlayType("audio/midi");
    supportedTypes["MIDI"] = audio.canPlayType("audio/x-midi");
    audio.remove();
    return supportedTypes;
  }
}

export module SfxManager {
  export enum MultipleInstanceStrategy {
    IgnoreNew = "ignoreNew",
    StopPrevious = "stopPrevious",
    None = "none",
  }
}
