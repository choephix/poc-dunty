import { getRandomItemFrom } from "@sdk/helpers/arrays";
import { randomIntBetweenIncluding } from "@sdk/utils/random";
import { Card, CardTarget, Combatant, CombatantStatus } from "./game";
import { StatusEffectBlueprints, StatusEffectImpactAlignment } from "./StatusEffectBlueprints";

export function generateDaggerCard(): Card {
  return Object.create({
    cost: 1,
    type: "atk",
    value: 1,
    target: CardTarget.TARGET_ENEMY,
    isToken: true,
  });
}

export function generateBloatCard(key: "stunned" | "frozen"): Card {
  return Object.create({
    cost: 1,
    type: "func",
    mods: { [key]: -1 },
    isToken: true,
    isBloat: true,
    // func: () => console.warn(`Un${key} self!`),
  });
}

export function generateRandomCard(): Card {
  return getRandomItemFrom<Card>([
    generateStatusEffectCard("stunned"),
    generateStatusEffectCard("frozen"),
    { cost: randomIntBetweenIncluding(0, 3, 2), type: "atk", value: 1, target: CardTarget.ALL_ENEMIES },
    // { cost: randomIntBetweenIncluding(0, 3, 2), type: "atk", value: 2, target: CardTarget.TARGET_ENEMY },
    // { cost: randomIntBetweenIncluding(0, 3, 2), type: "def", value: 2, target: CardTarget.SELF },
    // { cost: randomIntBetweenIncluding(0, 3, 2), type: "func", mods: { health: 2 }, target: CardTarget.SELF },
    // generateStatusEffectCard(),
  ]);
}

export function generateRandomEnemyCard(): Card {
  return getRandomItemFrom<Card>([
    { cost: 1, type: "atk", value: 1, target: CardTarget.TARGET_ENEMY },
    // { cost: 1, type: "atk", value: 2, target: CardTarget.TARGET_ENEMY },
    // { cost: 1, type: "def", value: 2, target: CardTarget.TARGET_ENEMY },
    // generateStatusEffectCard(),
    // generateStatusEffectCard(),
    // generateStatusEffectCard(),
    // generateStatusEffectCard(),
    // generateStatusEffectCard(),
    generateStatusEffectCard(),
    generateStatusEffectCard("frozen"),
  ]);
}

function generateStatusEffectCard(statusProperty?: keyof CombatantStatus): Card {
  const sampleCombatant = new Combatant();
  const key = statusProperty || (getRandomItemFrom(Object.keys(sampleCombatant.status)) as keyof CombatantStatus);
  const { impactAlignment } = StatusEffectBlueprints[key];

  const MAP = {
    [StatusEffectImpactAlignment.POSITIVE]: getRandomItemFrom([CardTarget.SELF]),
    [StatusEffectImpactAlignment.NEUTRAL]: getRandomItemFrom([CardTarget.ALL]),
    [StatusEffectImpactAlignment.NEGATIVE]: getRandomItemFrom([
      CardTarget.TARGET_ENEMY,
      CardTarget.FRONT_ENEMY,
      CardTarget.ALL_ENEMIES,
    ]),
  };

  return { cost: 1, type: "func", mods: { [key]: 2 }, target: MAP[impactAlignment] || CardTarget.ALL };
}
