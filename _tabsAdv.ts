import { range } from 'chimichanga/dist/range/range';
import { arrangeInStraightLine } from './sdk/layout/line';
import { NavigationTabsManager } from './src/NavigationTabsManager';
import { Pikachu } from './src/pikachu';
import { gsap } from 'gsap';
import { Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { Text } from '@pixi/text';
import { Application } from '@pixi/app';
import { Container } from '@pixi/display';
import { PageObjectManager } from './src/PageObjectManager';
import { AnimatedFlagProperty } from './sdk/ani/simpleTween';
import { Ease } from 'chimichanga/dist/animation/Ease';
import { lerp } from './sdk/math/lerp';

class Tab extends Container {
  public readonly highlighted: AnimatedFlagProperty;
  public readonly icon: Sprite;

  constructor(labelString: string) {
    super();

    this.icon = new Pikachu();
    this.icon.anchor.set(0.5);
    this.icon.scale.set(0.2);
    this.icon.x = -this.icon.width * .5;

    this.addChild(this.icon)

    this.alpha = 0.5;

    const label = new Text(labelString.toUpperCase(), {
      fill: 0xffff00,
      fontSize: 24,
      fontWeight: 'bold',
      stroke: 0x404040,
      strokeThickness: 5,
    });
    label.x = 12;
    label.anchor.set(0., 0.5);
    this.addChild(label);

    this.highlighted = new AnimatedFlagProperty(false);
    this.highlighted.onChange = (animated) => {
      animated = Ease.InOutQuad(animated);
      this.alpha = 0.5 + 0.5 * animated;
      this.pivot.x = 45 - 60 * animated;
    };
    this.highlighted.set(false, true);
  }
}

class Page extends Sprite {
  constructor(tint: number) {
    super(Texture.WHITE);

    this.tint = tint;
    this.width = 512;
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
  pageContainer.position.set(10, 0);
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
  const addTabButton = (label: string) => {
    const button = new Tab(label);
    tabButtonsContainer.addChild(button);
    return button;
  };
  const tabsConfiguration = NavigationTabsManager.tabOptionsFromDictionary({
    [PageKey.Red]: addTabButton('Red'),
    [PageKey.Green]: addTabButton('Green'),
    [PageKey.Blue]: addTabButton('Blue'),
    [PageKey.Yellow]: addTabButton('Yellow'),
    [PageKey.Cyan]: addTabButton('Cyan'),
    [PageKey.Magenta]: addTabButton('Magenta'),
    [PageKey.White]: addTabButton('White'),
    [PageKey.Black]: addTabButton('Black'),
  });

  arrangeInStraightLine(tabButtonsContainer.children, { vertical: true, alignment: 0 });

  //// SET UP THE TAB BUTTONS MANAGER AND TELL IT HOW TO OPERATE OVER
  //// A TAB BUTTON INSTANCE TO MAKE IT HIGHLIGHTED

  const tabsManager = new NavigationTabsManager(tabsConfiguration, {
    setSelected(tab, selected) {
      tab.highlighted.set(selected);
    },
  });

  //// HOOK UP THE TABS MANAGER TO THE PAGE MANAGER
  //// SO THAT WHEN A TAB IS SELECTED, THE APPROPRIATE PAGE IS DISLPAYED

  tabsManager.onSelectionChange = (tabIndex) => {
    pageManager.setCurrentPage(tabIndex);
  };

  //// FINALLY, SELECT THE THIRD TAB BY DEFAULT.

  pageManager.setCurrentPage(PageKey.Blue);
  tabsManager.setSelectedValue(PageKey.Blue);
}
