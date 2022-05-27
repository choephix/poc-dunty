import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";
import { VCard } from "@client/display/entities/VCard";

export module VCardAnimations {
  export function playShowAnimation(card: VCard) {
    const tweeener = new TemporaryTweeener(card);
    return tweeener.from(card, { alpha: 0 });
  }
}
