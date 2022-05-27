import { Container, DisplayObject } from "@pixi/display";

export class MultiStateContainer extends Container {
  constructor(public readonly states: Readonly<DisplayObject[]>) {
    super();
  }

  setStateIndex(v: number) {
    this.removeChildren();

    const newState = this.states[v];
    newState && this.addChild(newState);
  }
}
