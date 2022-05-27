import { Ticker } from "@game/app/ticker";
import { Text, TextStyle } from "@pixi/text";
import { Enchant } from "@sdk/pixi/enchant/Enchant";

type valueOrGetter<T> = T | (() => T);

type DynamicStyle = { [key in keyof TextStyle]?: valueOrGetter<any> };

export class AutoUpdatingText extends Enchant(Text) {
  constructor(text: valueOrGetter<string | number>, ticker: Ticker, style?: DynamicStyle) {
    super("");

    if (typeof text === "function") {
      this.enchantments.watch(
        text,
        s => {
          this.text = s.toString();
          this.emit("change", this);
        },
        true
      );
    } else {
      this.text = text.toString();
      this.emit("change", this);
    }

    for (const key in style) {
      const value = style[key as keyof TextStyle];
      if (typeof value === "function") {
        this.enchantments.watch(value as () => any, value => ((<any>this.style)[key] = value), true);
      } else {
        (<any>this.style)[key] = value;
      }
    }
  }
}
