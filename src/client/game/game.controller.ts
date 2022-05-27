import { game } from "@client/main";
import { getRandomItemFrom } from "@sdk/helpers/arrays";
import { delay } from "@sdk/utils/promises";
import { range } from "@sdk/utils/range";
import { Card, CardPiles, CardTarget, Combatant, CombatantStatus, CombatGroup } from "./game";
import { generateDaggerCard } from "./game.factory";
import { StatusEffectBlueprints, StatusEffectExpiryType } from "./StatusEffectBlueprints";

export module GameController {
  async function assureDrawPileHasCards(cards: CardPiles) {
    if (cards.drawPile.length === 0) {
      while (cards.discardPile.length > 0) {
        const card = cards.discardPile[0];
        cards.moveCardTo(card, cards.drawPile);
        await delay(0.07);
      }
    }
  }

  export async function drawCards(count: number, cards: CardPiles) {
    for (const _ of range(count)) {
      await assureDrawPileHasCards(cards);
      const card = cards.drawPile[0];
      if (!card) return console.error("drawCards: drawPile is empty");
      cards.moveCardTo(card, cards.hand);
      await delay(0.07);
    }
    await assureDrawPileHasCards(cards);
  }

  export async function discardHand(cards: CardPiles) {
    while (cards.hand.length > 0) {
      const card = cards.hand[0];
      cards.moveCardTo(card, cards.discardPile);
      await delay(0.07);
    }
  }

  export async function activateCombatantTurnStartStatusEffects(side: CombatGroup) {
    const dict: Partial<Record<keyof CombatantStatus, (unit: Combatant) => void>> = {
      regeneration: u => (u.status.health += u.status.regeneration),
      tactical: u => drawCards(u.status.tactical, u.cards),
      daggers: u => range(u.status.daggers).forEach(() => u.cards.hand.push(generateDaggerCard())),
      burning: u => (u.status.health -= u.status.burning),
      poisoned: u => (u.status.health -= u.status.poisoned),
      bleeding: u => (u.status.health -= u.status.bleeding),
    };
    for (const unit of side.combatants) {
      for (const [key, func] of CombatantStatus.entries(dict)) {
        if (unit.status[key] > 0) {
          func?.(unit);
          await delay(0.3);
        }
      }
    }
  }

  export async function resetCombatantsForTurnStart(side: CombatGroup) {
    for (const unit of side.combatants) {
      for (const [key] of CombatantStatus.entries(unit.status)) {
        if (key === "health") continue;
        const expiryType = StatusEffectBlueprints[key].expiryType;
        switch (expiryType) {
          case StatusEffectExpiryType.RESET_BEFORE_TURN: {
            unit.status[key] = 0;
            break;
          }
          case StatusEffectExpiryType.DECREMENT_BEFORE_TURN: {
            unit.status[key] = Math.max(0, unit.status[key] - 1);
            break;
          }
        }
      }
    }
  }
}

export module GameFAQ {
  function getEnemiesSide(actor: Combatant) {
    return game.sideA === actor.side ? game.sideB : game.sideA;
  }

  export function getAliveEnemiesArray(actor: Combatant) {
    return getEnemiesSide(actor).combatants.filter(u => u.alive);
  }

  export function getAllCombatantsArray() {
    return [...game.sideA.combatants, ...game.sideB.combatants].filter(u => u.alive);
  }

  export function getValidTargetsArray(actor: Combatant, card: Card): Combatant[] {
    switch (card.target) {
      case CardTarget.SELF:
        return [actor];
      case CardTarget.ALL_ENEMIES:
        return getAliveEnemiesArray(actor);
      case CardTarget.ALL:
        return getAllCombatantsArray();
      case CardTarget.FRONT_ENEMY:
        const foes = getAliveEnemiesArray(actor);
        return foes.length > 0 ? [foes[0]] : [];
      case CardTarget.TARGET_ENEMY:
        return getAliveEnemiesArray(actor);
      default:
        throw new Error(`getValidTargetsArray: invalid target ${card.target}`);
    }
  }
}

export module CombatantAI {
  export function chooseCardTarget(actor: Combatant, card: Card) {
    const target = card.type === "atk" ? getRandomItemFrom(GameFAQ.getAliveEnemiesArray(actor)) : actor;
    return target;
  }
}
