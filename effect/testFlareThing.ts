import { makeQuadMesh } from './makeQuadMesh';
import { fragmentSrc, vertexSrc } from './glsl';
import { Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { Application } from '@pixi/app';
import { BLEND_MODES, WRAP_MODES } from '@pixi/constants';

function addFlareThing(app: Application, textureId: string, mods: any) {
  //const tex0 = Texture.from('https://public.cx/1/dot-a.png');
  const tex0 = Texture.from(textureId);
  const tex1 = Texture.from('https://public.cx/1/perlin.png');
  tex1.baseTexture.wrapMode = WRAP_MODES.MIRRORED_REPEAT;

  const uniforms = {
    time: -Math.random() * 90_719,
    tex0,
    tex1,
    noiseScale: 0.1,

    // colorLow: [4, 0, 0],
    // colorHigh: [4, 8, 2],

    colorLow: [0, 0, 2],
    colorHigh: [10, 1, 0],

    //colorLow: [1, 0, 0],
    //colorHigh: [0, 12, 40],

    // colorLow: [0, 0, 4],
    // colorHigh: [5, 12, 5],
  };

  app.ticker.add((dt) => (uniforms.time += dt));

  const sprite = makeQuadMesh(1024, [0, 0], vertexSrc, fragmentSrc, uniforms);
  sprite.blendMode = BLEND_MODES.ADD;
  sprite.pivot.set(512);
  sprite.position.set(app.view.clientWidth * 0.5, app.view.clientHeight * 0.5);
  sprite.scale.set(0.2, 0.8);
  Object.assign(sprite, mods);
  app.stage.addChild(sprite);

  sprite.rotation = 1.57;

  app.ticker.add((dt) => void (uniforms.time += 0.125 * dt));
  //app.ticker.add((dt) => void (sprite.rotation += 0.01 * dt));
}

export function testFlareThing(app: Application) {
  const tests = ['a', 'b', 'c', 'd', 'e', 'f'];

  const count = tests.length;
  const yDelta = app.view.clientHeight / (count + 1);
  for (const [index, suffix] of tests.entries()) {
    addFlareThing(app, `https://public.cx/1/blink-${suffix}.png`, {
      y: yDelta * (index + 1),
    });
  }
}
