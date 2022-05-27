import { VCombatant } from "@client/display/entities/VCombatant";
import { VCombatScene } from "@client/display/entities/VCombatScene";
import { Card, Combatant, CombatantStatus, CombatGroup, Game } from "@client/game/game";
import { CombatantAI, GameController } from "@client/game/game.controller";
import { drawRect } from "@debug/utils/drawRect";
import { __window__ } from "@debug/__window__";
import { createAnimatedButtonBehavior } from "@game/asorted/createAnimatedButtonBehavior";
import { createEnchantedFrameLoop } from "@game/asorted/createEnchangedFrameLoop";
import { GlowFilterService } from "@game/ui/fx/GlowFilterService";
import { Application } from "@pixi/app";
import { Color } from "@sdk/utils/color/Color";
import { lerp } from "@sdk/utils/math";
import { delay, nextFrame } from "@sdk/utils/promises";
import { range } from "@sdk/utils/range";
import { VHand } from "./display/compund/VHand";
import { VCombatantAnimations } from "./display/entities/VCombatant.animations";
import { getStatusEffectEmojiOnly } from "./display/entities/VCombatant.emojis";
import { EndTurnButton } from "./display/ui/EndTurnButton";
import { generateBloatCard } from "./game/game.factory";
import { CurrentSelectionHelper } from "./sdk/CurrentSelectionHelper";

export let game: Game;

export async function main(app: Application) {
  await nextFrame();

  while (true) {
    await startGame(app);
  }
}

export async function startGame(app: Application) {
  await nextFrame();

  game = __window__.game = new Game();
  game.start();

  const vscene = new VCombatScene();
  __window__.container = app.stage.addChild(vscene);

  await vscene.playShowAnimation();

  const combatantsDictionary = new Map<Combatant, VCombatant>();
  function composeSide(state: CombatGroup, leftSide: boolean) {
    const sideMul = leftSide ? -1 : 1;
    const centerUnitPosition = vscene.getFractionalPosition(0.43 + sideMul * 0.17, 0.3);
    for (const [index, char] of state.combatants.entries()) {
      const unit = new VCombatant(char);
      unit.setRightSide(leftSide);

      const ymul = index - (state.combatants.length - 1) / 2;
      unit.position.set(centerUnitPosition.x + sideMul * index * 90, centerUnitPosition.y - ymul * 300 + sideMul * 80);

      unit.scale.set(1.1 - 0.1 * index);
      unit.zIndex = 100 - index;
      vscene.addChild(unit);
      vscene.sortChildren();

      unit.intentionIndicator.visible = !leftSide;

      combatantsDictionary.set(char, unit);

      unit.visible = false;
      unit.waitUntilLoaded().then(async () => {
        unit.visible = true;
        VCombatantAnimations.enter(unit);
      });
    }
  }

  const glow = new GlowFilterService({ color: 0x30ffff, distance: 30, outerStrength: 1.99, innerStrength: 0.09 });
  // const glow = new FilterService(new AdjustmentFilter({ brightness: 1.2 }));
  const activeCombatant = new CurrentSelectionHelper<Combatant>({
    onSelect: combatant => {
      const vCombatant = combatantsDictionary.get(combatant)!;
      glow.addFilter(vCombatant.statusIndicators);
    },
    onDeselect: combatant => {
      const vCombatant = combatantsDictionary.get(combatant)!;
      glow.removeFrom(vCombatant.statusIndicators);
    },
  });

  composeSide(game.sideA, true);
  composeSide(game.sideB, false);

  const handOrigin = vscene.getFractionalPosition(0.5, 0.8);
  const hand = new VHand();
  hand.cardList = game.sideA.combatants[0].cards.hand;
  hand.position.set(handOrigin.x, handOrigin.y);
  vscene.addChild(hand);
  __window__.hand = hand;

  hand.onCardClick = async card => {
    const { combatants } = game.sideA;
    const [actor] = combatants;

    const target = card.type === "atk" ? await selectAttackTarget() : actor;

    actor.energy -= card.cost;

    await playCardFromHand(card, actor, target);

    if (actor.cards.hand.length === 0) {
      endTurnButtonBehavior.isDisabled.value = true;
      await delay(0.8);
      if (activeCombatant.current === actor) endPlayerTurn();
    }
  };

  async function playCardFromHand(card: Card, actor: Combatant, target: Combatant = actor) {
    const { hand, discardPile } = actor.cards;
    hand.splice(hand.indexOf(card), 1);
    await resolveCardEffect(card, actor, target);
    discardPile.push(card);
  }

  async function resolveCardEffect(card: Card, actor: Combatant, target: Combatant = actor) {
    const { type, mods, func } = card;

    if (type === "atk") {
      await performAttack(target, actor, card);

      if (!actor.alive) actor.side.combatants.splice(actor.side.combatants.indexOf(target), 1);
      if (!target.alive) target.side.combatants.splice(target.side.combatants.indexOf(target), 1);

      return;
    }

    if (type === "def") {
      const amountToAdd = game.calculateBlockPointsToAdd(card, actor);
      target.status.block += amountToAdd;

      await delay(0.35);
    }

    if (type === "func") {
      const vact = combatantsDictionary.get(actor)!;
      await VCombatantAnimations.spellBegin(vact);

      if (func) {
        func(actor, target);
      }

      if (mods) {
        const noFloatyTextKeys = ["health"];
        for (const [key, mod] of CombatantStatus.entries(mods)) {
          target.status[key] += mod;
          if (target.status[key] < 0) target.status[key] = 0;

          if (target.status.stunned > 0) {
            target.cards.addCardTo(generateBloatCard("stunned"), target.cards.drawPile);
          } else if (target.status.frozen > 0) {
            target.cards.addCardTo(generateBloatCard("frozen"), target.cards.drawPile);
          }

          if (noFloatyTextKeys.indexOf(key) === -1) {
            const emoji = getStatusEffectEmojiOnly(key);
            VCombatantAnimations.spawnFloatyText(vact, `${emoji}${mod}`, 0xa0c0f0);
          }

          await delay(0.45);
        }
      }

      // await Promise.resolve(card.effect?.(actor, target));
    }
  }

  async function selectAttackTarget() {
    const candidates = game.sideB.combatants.filter(c => c.alive);
    if (candidates.length === 0) return;

    if (candidates.length === 1) return candidates[0];

    const cleanUp = new Array<Function>();
    const chosen = await new Promise<Combatant>(resolve => {
      for (const candidate of candidates) {
        const vCombatant = combatantsDictionary.get(candidate)!;

        const glow = new GlowFilterService({ color: 0xff0000, distance: 8, outerStrength: 0.99, innerStrength: 0.99 });
        glow.addFilter(vCombatant.sprite);
        cleanUp.push(() => glow.removeFrom(vCombatant.sprite));

        const rect = drawRect(vCombatant, { x: -150, y: -150, width: 300, height: 300 });
        rect.alpha = 0.5;
        rect.renderable = false;
        createAnimatedButtonBehavior(
          rect,
          {
            onUpdate({ hoverProgress }) {
              glow.filter.outerStrength = 1 + hoverProgress;
              glow.filter.color = Color.lerp(0xff7050, 0xff0000, hoverProgress).toInt();
            },
            onClick() {
              resolve(candidate);
            },
          },
          true
        );
        cleanUp.push(() => rect.destroy());
      }
    });
    cleanUp.forEach(fn => fn());

    return chosen;
  }

  async function dealDamage(target: Combatant, directDamage: number, blockDamage: number) {
    target.status.block -= blockDamage;
    target.status.health -= directDamage;
  }

  async function performAttack(target: Combatant, attacker: Combatant, card: Card) {
    const atkPwr = game.calculateAttackPower(card, attacker, target);
    const { directDamage, blockedDamage, reflectedDamage, healingDamage } = game.calculateDamage(atkPwr, target);

    dealDamage(target, directDamage, blockedDamage);

    const vatk = combatantsDictionary.get(attacker)!;
    const vdef = combatantsDictionary.get(target)!;
    await VCombatantAnimations.attack(vatk, vdef);

    if (target.alive && reflectedDamage > 0) {
      const { directDamage, blockedDamage } = game.calculateDamage(reflectedDamage, attacker);
      console.log("Reflected damage:", directDamage, blockedDamage, reflectedDamage);
      dealDamage(attacker, directDamage, blockedDamage);
      await VCombatantAnimations.attack(vdef, vatk);
    }

    if (healingDamage > 0) {
      attacker.status.health += healingDamage;
      await VCombatantAnimations.buffHealth(vatk);
    }
  }

  async function startPlayerTurn() {
    await GameController.activateCombatantTurnStartStatusEffects(game.sideA);
    await GameController.resetCombatantsForTurnStart(game.sideA);

    const combatant = game.sideA.combatants[0];
    if (!combatant.alive) return;

    endTurnButtonBehavior.isDisabled.value = true;
    await delay(0.3);
    const cardsToDrawCount = game.calculateCardsToDrawOnTurnStart(combatant);
    await GameController.drawCards(cardsToDrawCount, combatant.cards);

    const energyToAdd = game.calculateEnergyToAddOnTurnStart(combatant);
    for (const _ of range(energyToAdd)) {
      await delay(0.033);
      combatant.energy++;
    }

    await delay(0.3);
    endTurnButtonBehavior.isDisabled.value = false;

    activeCombatant.setCurrent(combatant);
  }

  async function endPlayerTurn() {
    endTurnButtonBehavior.isDisabled.value = true;

    const combatant = game.sideA.combatants[0];

    if (!combatant.alive) return;

    combatant.energy = 0;

    await GameController.discardHand(combatant.cards);

    activeCombatant.setCurrent(null);

    await delay(0.1);

    await resolveEnemyTurn();

    if (!combatant.alive) return;

    await startPlayerTurn();
  }

  async function resolveEnemyTurn() {
    vscene.ln.visible = true;

    await GameController.activateCombatantTurnStartStatusEffects(game.sideB);
    await GameController.resetCombatantsForTurnStart(game.sideB);

    const playerCombatant = game.sideA.combatants[0];
    if (playerCombatant && game.sideB.combatants.length) {
      for (const foe of game.sideB.combatants) {
        activeCombatant.setCurrent(foe);

        await delay(0.15);

        const vfoe = combatantsDictionary.get(foe)!;
        vfoe.thought = " ";

        const cardsToDrawCount = game.calculateCardsToDrawOnTurnStart(foe);
        await GameController.drawCards(cardsToDrawCount, foe.cards);

        if (foe.cards.hand.length > 0) {
          while (foe.cards.hand.length > 0) {
            // await delay(0.7);
            const card = foe.cards.hand[0];
            const target = CombatantAI.chooseCardTarget(foe, card);
            console.log(`AI plays`, card, `on`, target);
            await playCardFromHand(card, foe, target);
            await delay(0.1);
          }
        } else {
          await VCombatantAnimations.noCard(vfoe);
        }

        activeCombatant.setCurrent(null);

        await delay(0.1);

        if (!playerCombatant.alive) break;
      }

      await delay(0.4);

      for (const foe of game.sideB.combatants) {
        const vfoe = combatantsDictionary.get(foe)!;
        vfoe.thought = undefined;
        await delay(0.1);
      }
    }

    vscene.ln.visible = false;
  }

  const endTurnButton = new EndTurnButton();
  endTurnButton.position.copyFrom(vscene.getFractionalPosition(0.5, 0.9));
  vscene.addChild(endTurnButton);
  const endTurnButtonBehavior = createAnimatedButtonBehavior(
    endTurnButton,
    {
      onClick: () => {
        endPlayerTurn();
      },
      onUpdate: ({ pressProgress, hoverProgress, disableProgress }) => {
        endTurnButton.alpha = Math.pow(1 - disableProgress, 4) * lerp(0.4, 1.0, hoverProgress);
        endTurnButton.pivot.y = -10 * pressProgress;
        endTurnButton.scale.set(1.0 + Math.pow(disableProgress, 2), Math.pow(1.0 - disableProgress, 4));
      },
    },
    {
      disableProgress: 1,
    }
  );

  await delay(0.6);

  startPlayerTurn();

  const onEnterFrame = createEnchantedFrameLoop(vscene);
  app.ticker.add(onEnterFrame);
  await onEnterFrame.waitUntil(() => !game.sideA.combatants.length || !game.sideB.combatants.length);
  app.ticker.remove(onEnterFrame);

  await vscene.playHideAnimation();
  vscene.destroy({ children: true });

  console.log("Game over");

  // const handOrigin = container.getFractionalPosition(0.5, 0.8);
  // for (const [index, card] of game.sideA.hand.entries()) {
  //   const vcard = new VCard(card);

  //   const xmul = index - (game.sideA.hand.length - 1) / 2;
  //   const delta = Math.min(200, 0.9 * container.designWidth / game.sideA.hand.length);
  //   vcard.position.set(handOrigin.x + delta * xmul, handOrigin.y - 100);
  //   vcard.scale.set(0.4);
  //   container.addChild(vcard);
  // }
}
