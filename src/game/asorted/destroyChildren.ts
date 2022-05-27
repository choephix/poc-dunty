import { Container } from "@pixi/display";

export function destroyChildren(container: Container) {
  while (container.children.length > 0) {
    container.removeChildAt(0).destroy();
  }
}
