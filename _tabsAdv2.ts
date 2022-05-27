import { range } from 'chimichanga/dist/range/range';
import { arrangeInStraightLine } from './sdk/layout/line';
import { NavigationTabsManager } from './src/NavigationTabsManager';
import { Pikachu } from './src/pikachu';
import gsap from 'gsap';
import { Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { Text } from '@pixi/text';
import { Application } from '@pixi/app';
import { Container } from '@pixi/display';
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
    this.width = 384;
    this.height = 512;
  }

  playShowAnimation() {
    return gsap.from(this, {
      pixi: { alpha: 0, pivotX: this.texture.width },
      ease: 'back.out',
    });
  }

  playHideAnimation() {
    return gsap.to(this, {
      pixi: { alpha: 0, pivotX: -this.texture.width },
      ease: 'back.out',
    });
  }
}

enum PageKey {
  Red = 11,
  Green = 22,
  Blue = 33,
  Yellow = 44,
  Cyan = 55,
  Magenta = 66,
  White = 77,
  Black = 88,
}

export async function initTabsAdv(app: Application) {
  await Pikachu.loadTexture();

  //// CREATE THE PAGES' CONTAINER, MANAGER AND FACTORY FUNCTIONS

  const pageContainer = new Container();
  pageContainer.position.set(200, 0);
  app.stage.addChild(pageContainer);

  const pageManager = new PageObjectManager(
    {
      [PageKey.Red]: () => new Page(0xff0000),
      [PageKey.Green]: () => new Page(0x00ff00),
      [PageKey.Blue]: () => new Page(0x0000ff),
      [PageKey.Yellow]: () => new Page(0xffff00),
      [PageKey.Cyan]: () => new Page(0x00ffff),
      [PageKey.Magenta]: () => new Page(0xff00ff),
      [PageKey.White]: () => new Page(0xffffff),
      [PageKey.Black]: () => new Page(0x000000),
    },
    pageContainer
  );
  pageManager.setCurrentPage(0);

  //// CREATE AND ARRANGE THE TAB BUTTONS

  const tabButtonsContainer = new Container();
  app.stage.addChild(tabButtonsContainer);
  const tabsConfiguration = NavigationTabsManager.tabOptionsFromFactoryFunction(
    [
      PageKey.Red,
      PageKey.Green,
      PageKey.Blue,
      PageKey.Yellow,
      PageKey.Cyan,
      PageKey.Magenta,
      PageKey.White,
      PageKey.Black,
    ],
    (pg: PageKey) => {
      const buttonLabel = `[ ${PageKey[pg]} ]`;
      const button = new Tab(buttonLabel);
      tabButtonsContainer.addChild(button);
      return button;
    }
  );

  arrangeInStraightLine(tabButtonsContainer.children, { vertical: true });

  //// SET UP THE TAB BUTTONS MANAGER AND TELL IT HOW TO OPERATE OVER
  //// A TAB BUTTON INSTANCE TO MAKE IT HIGHLIGHTED

  const tabsManager = new NavigationTabsManager(tabsConfiguration, {
    setSelected(tab, selected) {
      tab.setHiglighted(selected);
    },
  });

  //// HOOK UP THE TABS MANAGER TO THE PAGE MANAGER
  //// SO THAT WHEN A TAB IS SELECTED, THE APPROPRIATE PAGE IS DISLPAYED

  tabsManager.onSelectionChange = (key) => {
    pageManager.setCurrentPage(key);

    console.log(`Page selected: ${key} (${PageKey[key]})`);
  };

  //// FINALLY, SELECT THE THIRD TAB BY DEFAULT.

  tabsManager.setSelectedValue(PageKey.Blue);
  pageManager.setCurrentPage(PageKey.Blue);
}
