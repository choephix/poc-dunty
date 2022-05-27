import { boot } from './boot';

import { Filter, Renderer, Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import {
  createTimeline,
  playTimeline,
  playTimelineInReverse,
} from './timeline';
import { onEnterFrame } from './sdk/onEnterFrame';
import { Graphics } from '@pixi/graphics';
import { Container } from '@pixi/display';

const __window__ = window as any;

const T = 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/Pok%C3%A9mon_Pikachu_art.png/220px-Pok%C3%A9mon_Pikachu_art.png';
class Pikachu extends Sprite {
  interactive: boolean;
  buttonMode: boolean;
  addListener: any;
}

export async function timelinetest(app: any) {
  const pika = (__window__.pika = new Pikachu());
  pika.interactive = true;
  pika.buttonMode = true;
  pika.x = 200;
  pika.y = 250;
  pika.scale.set(0.5);
  pika.anchor.set(0.3, 0.65);
  app.stage.addChild(pika);

  const tl = createTimeline();
  tl.addTween((p) => (pika.x = 200 + 100 * p), 0.5);
  tl.addTween((p) => (pika.y = 250 + 100 * p), 0.5);
  tl.addTween((p) => (pika.rotation = 2 * Math.PI * p), 0.5);
  __window__.tl = tl;

  onEnterFrame(() => {
    document.getElementById('debug').innerText = `
      ${tl.timelineProgress.toFixed(3)}
      `;
  });

  await playTimeline(tl, app.ticker);
  await playTimelineInReverse(tl, app.ticker);

  __window__.pika = pika;
}

function createObjectMask(o: Container) {
  const bounds = o.getBounds();
  const g = new Graphics();
  g.beginFill();
  g.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
  //g.drawRect(-30, -30, 600, 80);
  //g.drawRect(o.x, o.y, 800, 80);

  o.updateTransform();
  o.containerUpdateTransform();
  o.displayObjectUpdateTransform();
  console.log({
    _bounds: o._bounds,
    _localBounds: o._localBounds,

    bounds: o.getBounds(),
    localBounds: o.getLocalBounds(),

  })
  return g;
}


export async function masktest(app: any) {
  const texture = await Texture.fromURL(T);
  const pika = (__window__.pika = new Pikachu(texture));
  pika.interactive = true;
  pika.buttonMode = true;
  pika.x = 200;
  pika.y = 250;
  pika.scale.set(0.5);
  pika.anchor.set(0.5, 0.5);
  app.stage.addChild(pika);

  pika.visible = true;

  const mask = createObjectMask(pika);
  pika.mask = mask;
  pika.parent.addChild(mask);

  const tl = createTimeline();
  tl.addTween((p) => (pika.y = 150 + 100 * p), 0.5);
  tl.addTween((p) => (pika.rotation = 2 * Math.PI * p), 0.5);
  __window__.tl = tl;

  onEnterFrame(() => {
    document.getElementById('debug').innerText = `
      ${tl.timelineProgress.toFixed(3)}
      `;
  });

  await playTimeline(tl, app.ticker);
  await playTimelineInReverse(tl, app.ticker);

  pika.mask = null;
  mask.destroy();
  
  pika.visible = false;
}

