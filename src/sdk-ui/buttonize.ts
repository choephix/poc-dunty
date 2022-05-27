import { DisplayObject, Container } from "@pixi/display";
import { InteractionData, InteractionEvent } from "@pixi/interaction";
import { EventBus } from "@sdk/core/EventBus";

export class ObservableValue<T> {
  private _value: T;
  private _observers: ((value: T) => void)[] = [];

  constructor(value: T) {
    this._value = value;
  }

  public get value(): T {
    return this._value;
  }

  public set value(value: T) {
    if (this._value !== value) {
      this._value = value;
      this._observers.forEach(observer => observer(value));
    }
  }

  public onChange(observer: (value: T) => void) {
    this._observers.push(observer);
  }
}

type Buttonizable = DisplayObject | Container;

export function buttonizeInstance<T extends Buttonizable, TModifications extends Record<string, any> = {}>(
  target: T,
  mods: TModifications = {} as TModifications
) {
  const behavior = Object.assign(
    new EventBus<{
      trigger: (e: InteractionData) => unknown;
      hoverIn: () => unknown;
      hoverOut: () => unknown;
      down: () => unknown;
      up: () => unknown;
    }>(),
    {
      isDown: new ObservableValue(false),
      isHover: new ObservableValue(false),
    }
  );

  target.interactive = true;
  target.buttonMode = true;

  target.on("pointerdown", (e: InteractionEvent) => {
    behavior.isDown.value = true;
  });
  target.on("pointerup", (e: InteractionEvent) => {
    behavior.isDown.value = false;
  });
  target.on("pointerupoutside", (e: InteractionEvent) => {
    behavior.isDown.value = false;
  });
  target.on("pointerover", (e: InteractionEvent) => {
    behavior.isHover.value = true;
  });
  target.on("pointerout", (e: InteractionEvent) => {
    behavior.isHover.value = false;
    behavior.isDown.value = false;
  });
  target.on("click", (e: InteractionEvent) => {
    behavior.dispatch("trigger", e.data);
  });
  target.on("tap", (e: InteractionEvent) => {
    behavior.dispatch("trigger", e.data);
  });

  behavior.isDown.onChange(isDown => behavior.dispatch(isDown ? "down" : "up"));
  behavior.isHover.onChange(isHover => behavior.dispatch(isHover ? "hoverIn" : "hoverOut"));

  const result = Object.assign(target, { behavior }, mods);

  return result;
}

export type Buttonized<T = unknown> = T & ReturnType<typeof buttonizeInstance>;
