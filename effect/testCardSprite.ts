import { makeQuadMesh } from './makeQuadMesh';
import { fragmentSrc, vertexSrc } from './glsl';
import { Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { Application } from '@pixi/app';
import { BLEND_MODES, WRAP_MODES } from '@pixi/constants';

export function testCardSprite(app: Application) {
  const texC = Texture.from(
    'https://public.cx/toc/cards-png/3f2f5b788a9b8529bf481d63cd4904a9.png'
  );
  //const tex0 = Texture.from('https://public.cx/1/card-glow.png');
  //const tex0 = Texture.from('https://public.cx/1/glo.png');
  const tex0 = Texture.from('https://public.cx/1/card-glow/g.png');
  const tex1 = Texture.from('https://public.cx/1/perlin.png');
  tex1.baseTexture.wrapMode = WRAP_MODES.MIRRORED_REPEAT;

  const uniforms = {
    time: 0,
    tex0,
    tex1,
    noiseScale: 0.2,
    //colorLow: [0, 0.5, 0.5],
    //colorHigh: [4, 14, 12],
    //colorLow: [0.8, 0, 0],
    //colorHigh: [0, 6, 12],
    //colorLow: [0.0, 0, 1],
    //colorHigh: [8, 6, 2],

    //colorLow: [-1, -1, 2],
    //colorHigh: [4, 8, 6],
    //colorLow: [-1, -1, 2],
    //colorHigh: [8, 4, 6],
    colorLow: [1.5, -1, -1],
    colorHigh: [1.5, 16, 48],
  };


  const card = new Sprite(texC);
  card.scale.set(0.455);
  card.anchor.set(0.5);
  card.position.set(app.view.clientWidth * 0.5, app.view.clientHeight * 0.5);
  app.stage.addChild(card);

  const sprite = makeQuadMesh(1024, [0, 0], vertexSrc, fragmentSrc, uniforms);
  sprite.pivot.set(512);
  sprite.position.set(app.view.clientWidth * 0.5, app.view.clientHeight * 0.5);
  sprite.tint = 0xffbb00;
  sprite.blendMode = BLEND_MODES.NORMAL;
  //sprite.blendMode = BLEND_MODES.ADD;
  sprite.blendMode = BLEND_MODES.SCREEN;
  app.stage.addChild(sprite);

  app.ticker.add((dt) => (uniforms.time += 0.75 * dt));
}

//export function testCardSprite(app: Application) {
//  const texC = Texture.from(
//    'https://public.cx/toc/cards-png/3f2f5b788a9b8529bf481d63cd4904a9.png'
//  );
//  const tex0 = Texture.from('https://public.cx/1/card-glow.png');
//  //const tex0 = Texture.from('https://public.cx/1/glo.png');
//  //const tex0 = Texture.from('https://public.cx/1/card-glow/f.png');
//  const tex1 = Texture.from('https://public.cx/1/perlin.png');
//  tex1.baseTexture.wrapMode = WRAP_MODES.MIRRORED_REPEAT;
//
//  const uniforms = {
//    time: 0,
//    tex0,
//    tex1,
//    noiseScale: 0.1,
//    colorLow: [0, 0.5, 0.5],
//    colorHigh: [4, 14, 12],
//    //colorLow: [1, 0, 0],
//    //colorHigh: [0, 6, 16],
//  };
//
//  const card = new Sprite(texC);
//  card.scale.set(0.455);
//  card.anchor.set(0.5);
//  card.position.set(app.view.clientWidth * 0.5, app.view.clientHeight * 0.5);
//  app.stage.addChild(card);
//
//  const sprite = makeQuadMesh(1024, [0, 0], vertexSrc, fragmentSrc, uniforms);
//  sprite.pivot.set(512);
//  sprite.position.set(app.view.clientWidth * 0.5, app.view.clientHeight * 0.5);
//  sprite.tint = 0xffbb00;
//  sprite.blendMode = BLEND_MODES.ADD;
//  app.stage.addChild(sprite);
//
//  app.ticker.add((dt) => (uniforms.time += 0.75 * dt));
//}