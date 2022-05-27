import { Container, DisplayObject } from '@pixi/display';
import { EventBus } from './EventBus';
import gsap from 'gsap';

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
  return typeof value === 'function' || typeof value === 'object';
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
      this.events.dispatch('pageRemoved', prevPage);

      const hideAnimationPromise = this.playHideAnimation(prevPage);
      hideAnimationPromise.then(() =>
        this.events.dispatch('pageHideAnimationComplete', prevPage)
      );

      if (this.destroyPreviousPage) {
        hideAnimationPromise.then(() => prevPage.destroy());
      } else {
        hideAnimationPromise.then(() => prevPage.parent.removeChild(prevPage));
      }

      if (this.awaitHideAnimation) {
        await hideAnimationPromise;
      }
    }

    this.current = nextPage;
    this.events.dispatch('pageChanged', nextPage, prevPage);

    if (nextPage) {
      this.events.dispatch('pageAdded', nextPage);

      let loadedData: unknown = undefined;
      if (nextPage.load && !nextPage.loaded) {
        const loadPromise = Promise.resolve(nextPage.load());
        loadedData = await loadPromise;
      }

      if (nextPage.initialize && !nextPage.initialized) {
        const initializePromise = Promise.resolve(
          nextPage.initialize(loadedData)
        );
        await initializePromise;
      }

      this.parent.addChild(nextPage);

      const showAnimationPromise = this.playShowAnimation(nextPage);
      showAnimationPromise.then(() =>
        this.events.dispatch('pageShowAnimationComplete', nextPage)
      );

      if (this.awaitShowAnimation) {
        await showAnimationPromise;
      }
    }
  }

  private playShowAnimation(page: T) {
    if (page.playShowAnimation) {
      return Promise.resolve(page.playShowAnimation());
    }
    return Promise.resolve(gsap.fromTo(page, { alpha: 0 }, { alpha: 1 }));
  }

  private playHideAnimation(page: T) {
    if (page.playHideAnimation) {
      return Promise.resolve(page.playHideAnimation());
    }
    return Promise.resolve(gsap.to(page, { alpha: 0 }));
  }
}
