import { Texture } from "@pixi/core";
import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import gsap from "gsap";

const PIKACHU_TEXTURE = Texture.from(`https://upload.wikimedia.org/wikipedia/en/a/a6/Pok%C3%A9mon_Pikachu_art.png`);

type PickByValueType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type Mods = Partial<PickByValueType<Sprite, number | string | boolean> & { scale: number; anchor: number }>;

const __window__ = window as any;

export function __createPikachu(mods: Mods = {}) {
  let scale = 1;
  if (mods.scale) {
    scale = mods.scale;
    delete mods.scale;
  }

  let anchor = 0.5;
  if (mods.anchor) {
    anchor = mods.anchor;
    delete mods.anchor;
  }

  const pikachu = new Sprite(PIKACHU_TEXTURE);
  pikachu.scale.set(scale);
  pikachu.anchor.set(anchor);

  // const tweener = new TemporaryTweeener(pikachu);
  const tweener = gsap;

  const playShowAnimation = () => {
    return tweener.from(pikachu, {
      pixi: { scale: 0 },
      duration: 0.79,
      ease: `elastic.out`,
    });
  };

  const playHideAnimation = () => {
    return tweener.to(pikachu, {
      pixi: { scale: 0 },
      duration: 0.17,
      ease: `power2.in`,
    });
  };

  __window__.pika = pikachu;

  return Object.assign(pikachu, mods, { tweener, playShowAnimation, playHideAnimation });
}

export function __addPikachu(parent: Container = __window__.stage, mods: Mods = {}) {
  return parent.addChild(__createPikachu(mods));
}

__window__.__createPikachu = __createPikachu;
__window__.__addPikachu = __addPikachu;
