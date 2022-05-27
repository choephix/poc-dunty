import { Texture } from "@pixi/core";
import { Sprite } from "@pixi/sprite";

export class MultiStateSprite extends Sprite {
  public currentStateIndex: number = 0;

  constructor(private readonly stateTextures: Texture[]) {
    super();
    this.setStateIndex(0);
  }

  setStateIndex(stateIndex: number) {
    this.currentStateIndex = stateIndex;
    this.texture = this.stateTextures[stateIndex];
  }
}
