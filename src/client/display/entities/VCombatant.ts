import { __VERBOSE__ } from "@client/debug/URL_PARAMS";
import { Card, Combatant, CombatantStatus, Game } from "@client/game/game";
import { StatusEffectBlueprints, StatusEffectKey } from "@client/game/StatusEffectBlueprints";
import { game } from "@client/main";
import { createEnchantedFrameLoop } from "@game/asorted/createEnchangedFrameLoop";
import { Texture } from "@pixi/core";
import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { Text } from "@pixi/text";
import { arrangeInStraightLine } from "@sdk-pixi/layout/arrangeInStraightLine";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";
import { EnchantmentGlobals } from "@sdk/pixi/enchant/EnchantmentGlobals";
import { ToolTipFactory } from "../services/TooltipFactory";
import { VCombatantAnimations } from "./VCombatant.animations";
import { getStatusEffectEmojiOnly } from "./VCombatant.emojis";

export class VCombatant extends Container {
  sprite;
  statusIndicators;
  intentionIndicator;
  energyIndicator;

  thought?: string;

  constructor(public readonly data: Combatant) {
    super();

    this.sprite = new Sprite(Texture.from(data.textureId));
    this.sprite.anchor.set(0.5, 0.95);
    this.addChild(this.sprite);

    const breathStart = Math.random();
    Object.assign(this.sprite, {
      onEnterFrame: () => {
        if (this.data.alive) {
          this.sprite.position.y = this.sprite.texture.height * 0.45;
          this.sprite.scale.y = 1.0 + 0.0125 * Math.sin(breathStart + 2.5 * EnchantmentGlobals.timeTotal);
        } else {
          this.sprite.scale.y = 0.9;
        }
      },
    });

    this.statusIndicators = this.addStatusIndicators();
    this.energyIndicator = this.addEnergyIndicator();
    this.intentionIndicator = this.addIntentionIndicator();

    this.intializeAnimationsReactor();
  }

  readonly onEnterFrame = createEnchantedFrameLoop(this);

  //// Builder Methods

  private intializeAnimationsReactor() {
    const { status } = this.data;

    this.onEnterFrame.watch.array(
      () => [status.health, status.block, status.retaliation || 0],
      async ([health, block, retaliation], [prevHealth, prevBlock, prevRetaliation]) => {
        const Ani = VCombatantAnimations;
        if (health < prevHealth) await (health <= 0 ? Ani.die(this) : Ani.hurt(this));
        if (health > prevHealth) await (health > 0 ? Ani.buffHealth(this) : Ani.enter(this));
        if (block > prevBlock) await Ani.buffBlock(this);
        if (retaliation > prevRetaliation) await Ani.buffRetaliation(this);
      },
      true
    );
  }

  private addStatusIndicators() {
    const { status } = this.data;

    const statusIndicator = new StatusEffectIndicators();
    this.addChild(statusIndicator);

    this.onEnterFrame.watch.properties(
      () => status,
      () => statusIndicator.update(status),
      true
    );

    return statusIndicator;
  }

  private addIntentionIndicator() {
    const { drawPile } = this.data.cards;

    const intentionIndicator = new IntentionIndicators();
    this.addChild(intentionIndicator);

    this.onEnterFrame.watch(
      () => this.thought || drawPile[0],
      v =>
        typeof v === "string"
          ? intentionIndicator.updateFromText(this.data, v)
          : intentionIndicator.updateFromUpcomingCards(this.data, game),
      true
    );

    return intentionIndicator;
  }

  private addEnergyIndicator() {
    const intentionIndicator = new Text("-", {
      fill: [0xffffff, 0xf0e010],
      fontFamily: "Impact, fantasy",
      fontSize: 24,
      stroke: 0x202020,
      strokeThickness: 5,
    });
    this.addChild(intentionIndicator);

    this.onEnterFrame.watch(
      () => this.data.energy,
      v => (intentionIndicator.text = v > 0 ? new Array(v).fill("⦿").join("") : ""),
      true
    );

    ToolTipFactory.addToEnergyIndicator(intentionIndicator, this.data.energy);

    return intentionIndicator;
  }

  //// Operation Methods

  setRightSide(rightSide: boolean) {
    const sign = rightSide ? -1 : 1;

    this.sprite.scale.x = sign;

    this.statusIndicators.position.set(sign * 200, 140);

    this.intentionIndicator.position.set(sign * -200, -100);

    this.energyIndicator.position.set(sign * 190, 160);
  }

  waitUntilLoaded() {
    return this.onEnterFrame.waitUntil(() => this.sprite.texture.baseTexture.valid);
  }
}

class StatusEffectIndicators extends Container {
  readonly sprites = new Map<StatusEffectKey, ReturnType<typeof this.createStatusIndicator>>();

  update(status: CombatantStatus) {
    for (const [key, value] of CombatantStatus.entries(status)) {
      let sprite = this.sprites.get(key);
      if (value) {
        if (!sprite) {
          sprite = this.createStatusIndicator(key, value);
          this.addChild(sprite);
          this.sprites.set(key, sprite);
        }
        sprite.update(value);
      } else {
        if (sprite) {
          sprite.destroy();
          this.sprites.delete(key);
        }
      }
    }

    const spritesArray = Array.from(this.sprites.values());
    spritesArray.sort((a, b) => b.priority - a.priority);
    arrangeInStraightLine(spritesArray, { vertical: true, alignment: [0.5, 1.0] });

    this.pivot.y = this.height / this.scale.y;

    this.animateInNewChildren();
  }

  private createStatusIndicator(key: StatusEffectKey, value: number) {
    const label = new Text(``, {
      fill: [0x405080, 0x202020],
      fontFamily: "Impact, fantasy",
      fontSize: 40,
      fontWeight: `bold`,
      stroke: 0xf0f0f0,
      strokeThickness: 5,
      align: "right",
    });
    label.anchor.set(0.5);

    function update(value: number) {
      label.text = getStatusEffectEmojifiedString(key, value) || "?";
      label.buttonMode = true;
      ToolTipFactory.addToStatusEffect(label, key, value);
    }

    update(value);

    return Object.assign(label, {
      isNew: true,
      key,
      value,
      priority: StatusEffectBlueprints[key].displayPriority,
      update,
    });
  }

  private animateInNewChildren() {
    for (const [_, sprite] of this.sprites) {
      if (sprite.isNew) {
        sprite.isNew = false;
        const tweeener = new TemporaryTweeener(sprite);
        tweeener.from(sprite, { pixi: { scale: 0 }, ease: "back.out" });
      }
    }
  }
}

function getStatusEffectEmojifiedString(key: StatusEffectKey, value: number) {
  const emoji = getStatusEffectEmojiOnly(key);
  if (typeof value === "number" && value != 0) return `${emoji}${value}`;
  if (typeof value === "boolean") return `${emoji}`;
  return `${emoji} (${value}?)`;
}

class IntentionIndicators extends Container {
  readonly sprites = new Map<Card, Text & { isNew?: boolean }>();

  private clear() {
    for (const card of this.sprites.keys()) {
      this.sprites.get(card)?.destroy();
      this.sprites.delete(card);
    }
  }

  private afterUpdate() {
    this.children.reverse();
    arrangeInStraightLine(this.children, { vertical: true, alignment: [0.5, 1.0] });

    this.pivot.y = this.height / this.scale.y;

    this.animateInNewChildren();
  }

  updateFromText(actor: Combatant, v: string) {
    this.clear();

    const sprite = this.createIndicatorFromText(v.toUpperCase(), [0xffffff, 0xf0e010]);
    Object.assign(sprite, { isNew: true });

    const { status } = actor;
    ToolTipFactory.addIntentionIndicator(
      sprite,
      status.stunned
        ? `STUNNED for ${status.stunned} turns`
        : status.frozen
        ? `FROZEN for ${status.frozen} turns`
        : // this.data.status.silenced ? `SILENCED for ${this.data.status.silenced} turns` :
          // this.data.status.disarmed ? `DISARMED for ${this.data.status.disarmed} turns` :
          v.toUpperCase()
    );

    this.afterUpdate();
  }

  updateFromUpcomingCards(actor: Combatant, game: Game) {
    this.clear();

    const cardsToDrawCount = game.calculateCardsToDrawOnTurnStart(actor);
    const intentionCards = actor.cards.drawPile.slice(0, cardsToDrawCount);

    for (const card of intentionCards) {
      const sprite = this.createIndicatorFromCard(actor, card);
      Object.assign(sprite, { isNew: true });
      this.addChild(sprite);
      this.sprites.set(card, sprite);
    }

    this.afterUpdate();
  }

  private createIndicatorFromText(str: string, colors: number[]) {
    const label = new Text(str, {
      fill: colors,
      fontFamily: "Impact, fantasy",
      fontSize: 40,
      fontWeight: `bold`,
      stroke: 0xf0f0f0,
      strokeThickness: 5,
      align: "right",
    });
    label.anchor.set(0.5);

    return label;
  }

  private createIndicatorFromCard(actor: Combatant, card: Card) {
    const emojifySingleCardIntention = (card: Card): [string, number?] => {
      const { type } = card;

      if (type === "atk") {
        const atk = game.calculateAttackPower(card, actor);
        return [`⚔${atk}`, 0xf02020];
      }

      if (type === "def") {
        const def = game.calculateBlockPointsToAdd(card, actor);
        return [`⛊${def || "?"}`, 0x70b0f0];
      }

      if (type === "func") {
        try {
          if (!card.isBloat) throw new Error("Not a bloat");
          const mod = [...Object.keys(card.mods!)][0] as StatusEffectKey;
          const emoji = StatusEffectBlueprints[mod]!.emoji;
          return [emoji, 0x00ffff];
        } catch (_) {
          const emoji = `★` + (__VERBOSE__ ? ` ` + Object.keys(card.mods || {}) : ``).toUpperCase();
          return [emoji, 0x00ffff];
        }
      }

      return [""];
    };

    const [str, color = 0x405080] = emojifySingleCardIntention(card);
    const label = new Text(str, {
      fill: color,
      // fill: [0xffffff, 0xf0e010],
      fontFamily: "Impact, fantasy",
      fontWeight: `bold`,
      fontSize: 40,
      stroke: 0x202020,
      strokeThickness: 5,
      align: "right",
    });
    label.anchor.set(0.5);

    label.buttonMode = true;
    ToolTipFactory.addIntentionIndicator(label, card);

    return label;
  }

  private animateInNewChildren() {
    for (const [_, sprite] of this.sprites) {
      if (sprite.isNew) {
        sprite.isNew = false;
        const tweeener = new TemporaryTweeener(sprite);
        tweeener.from(sprite, { pixi: { scale: 0 }, ease: "back.out" });
      }
    }
  }
}
