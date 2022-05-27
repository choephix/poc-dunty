import * as core from "@pixi/core";
import * as sprite from "@pixi/sprite";
import * as display from "@pixi/display";
import * as mesh_extras from "@pixi/mesh-extras";
import * as sprite_tiling from "@pixi/sprite-tiling";
import * as accessibility from "@pixi/accessibility";
import * as app from "@pixi/app";
import * as basis from "@pixi/basis";
import * as compressed_textures from "@pixi/compressed-textures";
import * as constants from "@pixi/constants";
import * as extract from "@pixi/extract";
import * as filter_crt from "@pixi/filter-crt";
import * as filter_glitch from "@pixi/filter-glitch";
import * as filter_glow from "@pixi/filter-glow";
import * as filter_kawase_blur from "@pixi/filter-kawase-blur";
import * as filter_advanced_bloom from "@pixi/filter-advanced-bloom";
import * as filter_bulge_pinch from "@pixi/filter-bulge-pinch";
import * as filter_color_matrix from "@pixi/filter-color-matrix";
import * as filter_old_film from "@pixi/filter-old-film";
import * as filter_rgb_split from "@pixi/filter-rgb-split";
import * as filter_shockwave from "@pixi/filter-shockwave";
import * as filter_twist from "@pixi/filter-twist";
import * as graphics from "@pixi/graphics";
import * as interaction from "@pixi/interaction";
import * as loaders from "@pixi/loaders";
import * as math from "@pixi/math";
import * as math_extras from "@pixi/math-extras";
import * as mesh from "@pixi/mesh";
import * as particle_container from "@pixi/particle-container";
import * as particle_emitter from "@pixi/particle-emitter";
import * as runner from "@pixi/runner";
import * as settings from "@pixi/settings";
import * as sound from "@pixi/sound";
import * as sprite_animated from "@pixi/sprite-animated";
import * as text from "@pixi/text";
import * as text_bitmap from "@pixi/text-bitmap";
import * as ticker from "@pixi/ticker";
import * as utils from "@pixi/utils";
import * as gif from "@pixi/gif";
import * as svg from "@pixi-essentials/svg";

Object.assign(window, {
  ...app,
  ...core,
  ...basis,
  ...sprite,
  ...loaders,
  ...display,
  ...text,
  ...text_bitmap,
  ...graphics,
  ...interaction,
  ...sprite_tiling,
  ...sprite_animated,
  ...compressed_textures,
  ...accessibility,
  ...constants,
  ...extract,
  ...math,
  ...math_extras,
  ...mesh,
  ...mesh_extras,
  ...particle_container,
  ...particle_emitter,
  ...settings,
  ...runner,
  ...sound,
  ...ticker,
  ...utils,
  ...svg,
  ...gif,
  ...filter_crt,
  ...filter_glitch,
  ...filter_glow,
  ...filter_kawase_blur,
  ...filter_advanced_bloom,
  ...filter_bulge_pinch,
  ...filter_color_matrix,
  ...filter_old_film,
  ...filter_rgb_split,
  ...filter_shockwave,
  ...filter_twist,
});
