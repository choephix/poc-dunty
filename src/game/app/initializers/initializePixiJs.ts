import { Renderer } from "@pixi/core";
import { BatchRenderer } from "@pixi/core";
Renderer.registerPlugin("batch", BatchRenderer);
import { InteractionManager } from "@pixi/interaction";
Renderer.registerPlugin("interaction", InteractionManager);
import { ParticleRenderer } from "@pixi/particle-container";
Renderer.registerPlugin("particle", ParticleRenderer);
import { TilingSpriteRenderer } from "@pixi/sprite-tiling";
Renderer.registerPlugin("tilingSprite", TilingSpriteRenderer);

import { Application } from "@pixi/app";
import { AppLoaderPlugin } from "@pixi/loaders";
Application.registerPlugin(AppLoaderPlugin);
// import { TickerPlugin } from '@pixi/ticker';
// Application.registerPlugin(TickerPlugin);

import { Loader } from "@pixi/loaders";
import { SpritesheetLoader } from "@pixi/spritesheet";
Loader.registerPlugin(SpritesheetLoader);
import { BitmapFontLoader } from "@pixi/text-bitmap";
Loader.registerPlugin(BitmapFontLoader);

import "@pixi/math-extras";
import "@pixi/mixin-cache-as-bitmap";
import "@pixi/mixin-get-child-by-name";

export * from "@pixi/basis";

// import * as utils from '@pixi/utils';

// export * from '@pixi/constants';
// export * from '@pixi/math';
// export * from '@pixi/runner';
// export * from '@pixi/settings';
// export * from '@pixi/ticker';
// export { utils };
// export * from '@pixi/display';
// export * from '@pixi/core';
// export * from '@pixi/loaders';
// export * from '@pixi/mesh';
// export * from '@pixi/sprite';
// export * from '@pixi/app';
// export * from '@pixi/graphics';
// export * from '@pixi/mesh-extras';
// export * from '@pixi/text-bitmap';
// export * from '@pixi/text';
// export * from '@pixi/interaction';

// export * from '@pixi/particle-container';
// export * from '@pixi/sprite-tiling';
// export * from '@pixi/spritesheet';
