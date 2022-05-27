import { Container } from "@pixi/display";
import { EventBus } from "@sdk/core/EventBus";
import { PageObject, PageObjectSwitcher } from "./PageObjectSwitcher";

export type PageConfiguration<TDisplayObject extends PageObject = PageObject> =
  | {
      construct(): TDisplayObject | null;
    }
  | (() => TDisplayObject | null)
  | ((new () => TDisplayObject) | null);

function isPageClass(obj: PageConfiguration & { prototype?: unknown }): obj is new () => Container {
  return !!obj.prototype && !!obj.prototype.constructor.name;
}

export class PageObjectManager<
  TDisplayObject extends PageObject = PageObject,
  K extends string | number = string,
  T extends PageConfiguration<TDisplayObject> = PageConfiguration<TDisplayObject>
> {
  private _currentPageKey: K | null = null;

  public readonly switcher = new PageObjectSwitcher(this.container);

  public readonly events = new EventBus<{
    beforeChange: (pageKey: K | null, pageConfig: T | null) => void;
    pageConstructed: (page: TDisplayObject) => void;
    afterChange: (pageKey: K | null, pageConfig: T | null) => void;
  }>();

  constructor(
    public readonly pageConfigurations: Record<K, T>,
    public readonly container: Container = new Container()
  ) {}

  get currentPageKey() {
    return this._currentPageKey;
  }

  get currentPage() {
    return this.switcher.currentPage as TDisplayObject | null;
  }

  private createPage(pageConfiguration: T) {
    if (pageConfiguration == null) return null;

    if (isPageClass(pageConfiguration)) {
      return new pageConfiguration();
    }

    if (typeof pageConfiguration === "function") {
      return pageConfiguration();
    }

    return pageConfiguration.construct();
  }

  async setCurrentPage(pageKey: K | null, ignoreIfSamePage = true) {
    if (ignoreIfSamePage && pageKey === this._currentPageKey) {
      return;
    }

    this._currentPageKey = pageKey;

    const pageConfiguration = pageKey == null ? null : this.pageConfigurations[pageKey];

    this.events.dispatch("beforeChange", pageKey, pageConfiguration);

    if (pageConfiguration) {
      const page = this.createPage(pageConfiguration) as TDisplayObject | null;
      if (page) {
        this.events.dispatch("pageConstructed", page);
      }
      await this.switcher.setPage(page);
    } else {
      await this.switcher.setPage(null);
    }

    this.events.dispatch("afterChange", pageKey, pageConfiguration);
  }
}
