import { GameSingletons } from "@client/core/GameSingletons";
import { Card } from "@client/game/game";
import { StatusEffectBlueprints, StatusEffectKey } from "@client/game/StatusEffectBlueprints";
import { Sprite } from "@pixi/sprite";
import { VCard } from "../entities/VCard";

export module ToolTipFactory {
  export function addToCard(card: VCard) {
    const { data } = card;
    const tooltipHintText = {
      atk: `Play and select enemy\nto ATTACK for ${data.value} damage.`,
      def: `Play to BLOCK up to\n${data.value} of damage until your next turn.`,
      func: data.mods
        ? `Play to apply\n${Object.entries(data.mods)
            .map(([k, v]) => `${v}x ${k.toUpperCase()}`)
            .join(", ")} to self.`
        : "Play to perform a special action.",
    }[data.type];

    const tooltips = GameSingletons.getTooltipManager();
    tooltips.registerTarget(card, tooltipHintText || `Unknown card type: ${data.type}`);
  }

  export function addIntentionIndicator(sprite: Sprite, data: Card | string) {
    const tooltipHintText =
      typeof data === "string"
        ? data
        : {
            atk: `Enemy intends to\nATTACK you for ${data.value} damage next turn.`,
            def: `Enemy intends to apply\n${data.value}x BLOCK to self next turn.`,
            func: data.mods
              ? `Enemy intends to apply\n${Object.entries(data.mods)
                  .map(([k, v]) => `${v}x ${k.toUpperCase()}`)
                  .join(", ")} to self next turn.`
              : "Play to perform\na special action next turn.",
          }[data.type] || `Unknown card type: ${data.type}`;

    const tooltips = GameSingletons.getTooltipManager();
    tooltips.registerTarget(sprite, tooltipHintText);
  }

  export function addToStatusEffect(sprite: Sprite, statusEffect: StatusEffectKey, value: number) {
    const { displayName = statusEffect.toUpperCase(), description = `Unknown status effect` } =
      StatusEffectBlueprints[statusEffect] || {};

    const tooltipHintText = `${displayName.toUpperCase()}\n${description}`.trim().replace(/ X /g, ` ${value} `);

    const tooltips = GameSingletons.getTooltipManager();
    tooltips.registerTarget(sprite, {
      content: tooltipHintText,
      wordWrapWidth: 300,
    });
  }

  export function addToEnergyIndicator(sprite: Sprite, value: number) {
    const tooltipHintText = `Energy is used to play cards.\nYou have ${value} energy.`;
    const tooltips = GameSingletons.getTooltipManager();
    tooltips.registerTarget(sprite, {
      content: tooltipHintText,
      wordWrapWidth: 300,
    });
  }
}
