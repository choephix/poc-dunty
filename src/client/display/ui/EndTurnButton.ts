import { Container } from "@pixi/display";
import { Text } from "@pixi/text";

export class EndTurnButton extends Container {
  label;

  constructor() {
    super();

    this.label = new Text("End Turn".toUpperCase(), {
      fill: 0xffffff,
      fontFamily: "Impact, fantasy",
      fontSize: 60,
      stroke: 0x0,
      strokeThickness: 8,
    });
    this.label.anchor.set(0.5);
    this.addChild(this.label);
  }
}
