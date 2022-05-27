import { Texture } from "@pixi/core";
import { Sprite } from "@pixi/sprite";

export class MultiStateSprite<TStates extends { [key: number | string]: Texture } | Texture[]> extends Sprite {
  constructor(private readonly textures: TStates) {
    super();
  }

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  currentStateKey = null as null | (TStates extends Texture[] ? number : keyof TStates);

  setStateKey(stateKey: TStates extends Texture[] ? number : keyof TStates) {
    const texture = this.textures[stateKey];
    this.texture = texture as Texture;
    this.currentStateKey = stateKey;
  }
}
