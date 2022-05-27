import { Container } from "@pixi/display";
import type { PageObject, PageObjectAugmentations } from "@sdk-pixi/ui-helpers/PageObjectSwitcher";

export function createPageObject<TData>(augmentations: PageObjectAugmentations<TData>, container = new Container()) {
  return Object.assign(container, augmentations) as PageObject<TData>;
}
