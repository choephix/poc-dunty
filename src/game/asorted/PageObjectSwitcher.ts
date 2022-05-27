import { GameSingletons } from "@game/app/GameSingletons";
import { Container, DisplayObject } from "@pixi/display";
import { EventBus } from "@sdk/core/EventBus";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";
import { destroySafely } from "@sdk/pixi/helpers/destroySafely";

export type PageObjectAugmentations<T = any> = {
  loaded?: boolean;
  load?(): Promise<T>;

  initialized?: boolean;
  initialize?: (data: T) => unknown;

  playShowAnimation?(): unknown;
  playHideAnimation?(): unknown;
};

export type PageObject<T = any> = Container & PageObjectAugmentations<T>;

function defaultShouldDeleteProperty(value: any, key: string): boolean {
  return typeof value === "function" || typeof value === "object";
}

export class PageObjectSwitcher<T extends PageObject = PageObject> {
  public readonly events = new EventBus<{
    pageRemoved: (page: T) => void;
    pageAdded: (page: T) => void;
    pageChanged: (page: T | null, prevPage: T | null) => void;

    pageShowAnimationComplete: (page: T) => void;
    pageHideAnimationComplete: (page: T) => void;
  }>();

  public destroyPreviousPage = true;
  public awaitHideAnimation = false;
  public awaitShowAnimation = true;

  private current: T | null = null;
  private spinner = GameSingletons.getSpinner();
  private tweener: TemporaryTweeener = new TemporaryTweeener(this.parent);

  public readonly pageDestructionOptions = {
    children: false,
    shouldDeleteProperty: defaultShouldDeleteProperty,
  };

  constructor(protected readonly parent: Container = new Container()) {}

  get currentPage() {
    return this.current;
  }

  async setPage(nextPage: T | null) {
    const prevPage = this.current;
    this.current = null;

    if (prevPage) {
      this.events.dispatch("pageRemoved", prevPage);

      const hideAnimationPromise = this.playHideAnimation(prevPage);
      hideAnimationPromise.then(() => this.events.dispatch("pageHideAnimationComplete", prevPage));

      if (this.destroyPreviousPage) {
        hideAnimationPromise.then(() => destroySafely(prevPage, this.pageDestructionOptions));
      } else {
        hideAnimationPromise.then(() => prevPage.parent.removeChild(prevPage));
      }

      if (this.awaitHideAnimation) {
        await hideAnimationPromise;
      }
    }

    this.current = nextPage;
    this.events.dispatch("pageChanged", nextPage, prevPage);

    if (nextPage) {
      this.events.dispatch("pageAdded", nextPage);

      let loadedData: unknown = undefined;
      if (nextPage.load && !nextPage.loaded) {
        const loadPromise = Promise.resolve(nextPage.load());
        loadedData = await this.spinner.showDuring(loadPromise);
      }

      if (nextPage.initialize && !nextPage.initialized) {
        const initializePromise = Promise.resolve(nextPage.initialize(loadedData));
        await initializePromise;
      }

      this.parent.addChild(nextPage);

      const showAnimationPromise = this.playShowAnimation(nextPage);
      showAnimationPromise.then(() => this.events.dispatch("pageShowAnimationComplete", nextPage));

      if (this.awaitShowAnimation) {
        await showAnimationPromise;
      }
    }
  }

  private playShowAnimation(page: T) {
    if (page.playShowAnimation) {
      return Promise.resolve(page.playShowAnimation());
    } else {
      return this.playDefaultShowAnimation(page);
    }
  }

  private playHideAnimation(page: T) {
    if (page.playHideAnimation) {
      return Promise.resolve(page.playHideAnimation());
    } else {
      return this.playDefaultHideAnimation(page);
    }
  }

  private playDefaultShowAnimation(page: T) {
    const staggerPeriod = 0.1;

    const timeline = this.tweener.createTimeline();
    const promises = [] as { then: Function }[];

    let delay = 0;
    for (const child of page.children as (DisplayObject & { playShowAnimation?: () => any })[]) {
      if (!child.visible) {
        continue;
      }

      child.visible = false;
      if (child.playShowAnimation) {
        const promise = this.tweener.delay(delay).then(() => {
          child.visible = true;
          child.playShowAnimation?.();
        });
        promises.push(promise);
      } else {
        timeline.fromTo(
          child,
          {
            alpha: 0,
          },
          {
            alpha: 1,
            duration: 0.51,
            onStart: () => {
              child.visible = true;
            },
          },
          delay
        );
      }
      delay += staggerPeriod;
    }

    promises.push(timeline.play());

    return Promise.all(promises);
  }

  private playDefaultHideAnimation(page: T) {
    const staggerPeriod = 0.05;

    const timeline = this.tweener.createTimeline();
    const promises = [] as { then: Function }[];

    let delay = 0;
    for (const child of page.children as (DisplayObject & { playHideAnimation?: () => any })[]) {
      if (child.playHideAnimation) {
        const promise = this.tweener.delay(delay).then(() => child.playHideAnimation?.());
        promises.push(promise);
      } else {
        timeline.to(
          child,
          {
            alpha: 0,
            duration: 0.22,
          },
          delay
        );
      }
      delay += staggerPeriod;
    }

    promises.push(timeline.play());

    return Promise.all(promises);
  }
}
