import { DisplayObject } from "@pixi/display";

export type NavigationTabInput<T> = { displayObject: DisplayObject; value: T };

export class NavigationTabsManager<TObject extends DisplayObject, TValue = number> {
  public currentlySelectedIndex = null as null | number;

  constructor(
    tabs: { displayObject: TObject; value: TValue }[] | TObject[],
    behavior: {
      setSelected: (tab: TObject, selected: boolean) => unknown;
      setPressed?: (tab: TObject, pressed: boolean) => unknown;
      setHovered?: (tab: TObject, hover: boolean) => unknown;
      isDisabled?: (tabValue: TValue) => boolean;
    },
    public onSelectionChange?: (value: TValue) => unknown
  ) {
    const { setSelected, setPressed, setHovered: setHover, isDisabled = () => false } = behavior;

    function getDisplayObjectAndValue(o: typeof tabs[number], index: number): [TObject | undefined, TValue] {
      if ("displayObject" in o && o.displayObject instanceof DisplayObject) {
        return [o.displayObject, o.value];
      }
      return [o, index] as any;
    }

    const tabObjects = new Array<TObject | undefined>();
    const values = new Array<TValue>();

    for (const [index, input] of tabs.entries()) {
      const [tabObject, value] = getDisplayObjectAndValue(input, index);

      tabObjects.push(tabObject);
      values.push(value);

      if (!tabObject) continue;

      const isClickable = () => {
        if (this.currentlySelectedIndex == index) return false;
        if (isDisabled(value)) return false;
        return true;
      };

      if (setPressed) {
        let pressed = false;
        const onPressed = () => {
          if (isClickable()) {
            setPressed(tabObject, true);
            pressed = true;
          }
        };
        const onUnpressed = () => {
          if (pressed) {
            setPressed(tabObject, false);
            pressed = false;
          }
        };

        tabObject.on("pointerdown", onPressed);
        tabObject.on("pointerup", onUnpressed);
        tabObject.on("pointerout", onUnpressed);
      }

      if (setHover) {
        tabObject.on("pointerover", () => setHover(tabObject, true));
        tabObject.on("pointerout", () => setHover(tabObject, false));
      }

      tabObject.interactive = true;
      tabObject.buttonMode = true;
      tabObject.on("pointerup", () => {
        if (this.currentlySelectedIndex == index) return;
        if (isDisabled(value)) return;
        this.setSelectedTabIndex(index);
        this.onSelectionChange?.(value);
      });
    }

    this.resetStates = function () {
      for (const [index, tab] of tabObjects.entries()) {
        if (!tab) continue;
        setHover?.(tab, false);
        setPressed?.(tab, false);
        setSelected(tab, index === this.currentlySelectedIndex);
      }
    };

    this.setSelectedTabIndex = function (selectedIndex: number | null) {
      this.currentlySelectedIndex = selectedIndex;
      for (const [index, tab] of tabObjects.entries()) {
        if (!tab) continue;
        setSelected(tab, index === selectedIndex);
      }
    };

    this.setSelectedValue = function (selectedValue: TValue | null) {
      let index = values.findIndex(v => v == selectedValue) as any;

      //// Check if a tab really exists with the given index, else set index to null
      if (!tabObjects[index]) {
        index = null;
      }

      this.setSelectedTabIndex(index);
    };
  }

  public readonly resetStates;
  public readonly setSelectedTabIndex;
  public readonly setSelectedValue;
}

export module NavigationTabsManager {
  export function tabOptionsFromDictionary<
    TObject extends DisplayObject,
    TValue extends number | string | symbol = number
  >(dict: Record<TValue, TObject>): { displayObject: TObject; value: TValue }[] {
    return Object.entries(dict).map(([value, displayObject]) => {
      return {
        displayObject: displayObject as TObject,
        value: value as TValue,
      };
    });
  }

  export function tabOptionsFromFactoryFunction<
    TObject extends DisplayObject,
    TValue extends number | string | symbol = number
  >(values: Iterable<TValue>, createTab: (value: TValue) => TObject): { displayObject: TObject; value: TValue }[] {
    return Array.from(values).map(value => {
      return { displayObject: createTab(value), value };
    });
  }
}
