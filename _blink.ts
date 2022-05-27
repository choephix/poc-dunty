import { range } from 'chimichanga/dist/range/range';
import { boot } from './boot';
import { arrangeInStraightLine } from './sdk/layout/line';
import { NavigationTabsManager } from './src/NavigationTabsManager';
import { Pikachu } from './src/pikachu';
import gsap from 'gsap';
import { Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { BLEND_MODES } from '@pixi/constants';
import { Application } from '@pixi/app';

export function initBlink(app: Application) {
  async function wave(t: string, mods: any, ani: any = {}) {
    const texture = await Texture.fromURL(t);
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    if (mods.parent) {
      mods.parent.addChild(sprite);
      delete mods.parent;
    }
    Object.assign(sprite, mods);

    await tween(2, (p) => {
      sprite.alpha = Math.sin(p * Math.PI);
      sprite.alpha *= sprite.alpha;
      sprite.scale.set(p * 0.5);
      sprite.rotation += ani.rot || 0;
    });
    sprite.destroy();
  }

  window.onclick = () => {
    const mouse = app.renderer.plugins.interaction.mouse.global;
    //wave(`https://public.cx/2/boom-w2.png`, {
    wave(`https://public.cx/2/flare-rb.png`, {
      //wave(`https://public.cx/2/ring-w.png`, {
      //wave(`https://public.cx/2/plus-x3b.png`, {
      parent: app.stage,
      x: mouse.x,
      y: mouse.y,
      blendMode: BLEND_MODES.ADD,
      angle: Math.random() * 360,
    });
    wave(
      `https://public.cx/2/plus-x3b.png`,
      {
        parent: app.stage,
        x: mouse.x,
        y: mouse.y,
        blendMode: BLEND_MODES.ADD,
        angle: Math.random() * 360,
      },
      {
        rot: 0.01,
      }
    );
  };

  function tween(seconds: number, fn: (p: number) => unknown) {
    const store = { progress: 0 };
    const animate = gsap.quickTo(store, 'progress', {
      duration: seconds,
      onUpdate() {
        fn(store.progress);
      },
      ease: `power3.out`,
    });
    return animate(1);
  }
}
