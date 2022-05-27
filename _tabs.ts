import { range } from 'chimichanga/dist/range/range';
import { arrangeInStraightLine } from './sdk/layout/line';
import { NavigationTabsManager } from './src/NavigationTabsManager';
import { Pikachu } from './src/pikachu';
import { gsap } from 'gsap';
import { Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { Application } from '@pixi/app';
import { Container } from '@pixi/display';
import { Text } from '@pixi/text';
import { PageObjectManager } from './src/PageObjectManager';

class Tab extends Pikachu {
  constructor(labelString: string) {
    super();

    this.alpha = 0.5;
    this.scale.set(0.25);

    const label = new Text(labelString.toUpperCase(), {
      fill: 0xffff00,
      fontSize: 64,
      fontWeight: 'bold',
    });
    label.x = this.texture.width + 50;
    this.addChild(label);

    this.setHiglighted(false);
  }

  setHiglighted(value: boolean) {
    gsap.to(this, {
      pixi: { pivotX: value ? -10 : this.texture.width },
      alpha: value ? 1 : 0.5,
      duration: 0.31,
      ease: `power.inOut`,
    });
  }
}

class Page extends Sprite {
  constructor(tint: number) {
    super(Texture.WHITE);

    this.tint = tint;
    this.width = 512;
    this.height = 512;
  }
}

export async function initTabs(app: Application) {
  await Pikachu.loadTexture();

  ////

  //// CREATE THE PAGES' CONTAINER, MANAGER AND FACTORY FUNCTIONS

  const pageContainer = new Container();
  pageContainer.position.set(100, 0);
  app.stage.addChild(pageContainer);

  const pageManager = new PageObjectManager<Page, number>(
    {
      [0]: () => new Page(0xff0000),
      [1]: () => new Page(0x00ff00),
      [2]: () => new Page(0x0000ff),
      [3]: () => new Page(0xffff00),
      [4]: () => new Page(0x00ffff),
      [5]: () => new Page(0xff00ff),
      [6]: () => new Page(0xffffff),
      [7]: () => new Page(0x000000),
    },
    pageContainer
  );

  //// CREATE AND ARRANGE THE TAB BUTTONS

  const tabButtonsContainer = new Container();
  app.stage.addChild(tabButtonsContainer);

  const tabButtonObjects = [
    tabButtonsContainer.addChild(new Tab('Red')),
    tabButtonsContainer.addChild(new Tab('Green')),
    tabButtonsContainer.addChild(new Tab('Blue')),
    tabButtonsContainer.addChild(new Tab('Yellow')),
    tabButtonsContainer.addChild(new Tab('Cyan')),
    tabButtonsContainer.addChild(new Tab('Magenta')),
    tabButtonsContainer.addChild(new Tab('White')),
    tabButtonsContainer.addChild(new Tab('Black')),
  ];

  arrangeInStraightLine(tabButtonObjects, { vertical: true });

  //// SET UP THE TAB BUTTONS MANAGER AND TELL IT HOW TO OPERATE OVER
  //// A TAB BUTTON INSTANCE TO MAKE IT HIGHLIGHTED

  const tabsManager = new NavigationTabsManager<Tab, number>(tabButtonObjects, {
    setSelected(tab, selected) {
      tab.setHiglighted(selected);
    },
  });

  //// HOOK UP THE TABS MANAGER TO THE PAGE MANAGER
  //// SO THAT WHEN A TAB IS SELECTED, THE APPROPRIATE PAGE IS DISLPAYED

  tabsManager.onSelectionChange = (tabIndex) => {
    pageManager.setCurrentPage(tabIndex);
  };

  //// FINALLY, SELECT THE FIRST TAB BY DEFAULT.

  tabsManager.setSelectedTabIndex(0);
  pageManager.setCurrentPage(0);
}
