import { Scrollbox } from "pixi-scrollbox";

export class SafeScrollbox extends Scrollbox {
  /**
   * destroy the scrollbar (hopefully prevents zoom dead zones)
   */
  destroy(...args: any[]) {
    this.content.input.destroy();
    try {
      this.content.destroy({ children: true });
    } catch (error) {
      console.warn(error);
    }
    super.destroy(...args);
  }
}
