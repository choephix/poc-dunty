import { GameContext } from "@game/app/app";
import { Texture } from "@pixi/core";
import { Container } from "@pixi/display";
import { Graphics } from "@pixi/graphics";
import { Sprite } from "@pixi/sprite";
import { Text } from "@pixi/text";
import { EventEmitter } from "@pixi/utils";
import { buttonizeInstance } from "@sdk-ui/buttonize";
import { makeDraggable } from "./utils/makeDraggable";

import './global-space/assign-misc-classes-to-window';
import './global-space/assign-pixi-classes-to-window';

export const __var = {} as Record<string, any>;
export const __fn = {} as Record<string, Function>;
export const __ev = new EventEmitter();

function getGameContext() {
  return (<any>window).context as GameContext;
}

export const __add = {
  get ass() {
    return getGameContext().assets;
  },
  get stg() {
    return getGameContext().app.stage;
  },
  sprite(subject: string | Texture | Sprite, parent?: Container) {
    if (typeof subject === `string`) {
      subject = (this.ass.textures[subject] as Texture) ?? Texture.from(subject);
    }
    if (subject instanceof Texture) {
      subject = new Sprite(subject);
    }
    return (parent ?? this.stg).addChild(subject);
  },
  sprite2(
    subject: string | Texture | Sprite,
    parent: Container = getGameContext().app.stage,
    name: string = typeof subject === `string` ? subject : (<any>subject).name ?? `sprite`
  ) {
    if (typeof subject === `string`) {
      subject = (this.ass.textures[subject] as Texture) ?? Texture.from(subject);
    }

    if (subject instanceof Texture) {
      subject = new Sprite(subject);
    }

    if (subject instanceof Sprite) {
      subject.name = name;
    } else {
      throw new Error(`subject is not Sprite ` + subject);
    }

    const label = new Text(name, { fontSize: 12, fill: 0xffffff });
    label.position.set(2, 2);

    const labelPad = new Sprite(Texture.WHITE);
    labelPad.width = label.width + 4;
    labelPad.height = label.height + 4;
    labelPad.tint = 0x000000;
    labelPad.alpha = 0.5;

    const container = new Container();
    container.addChild(subject, labelPad, label);

    const g = new Graphics();
    g.lineStyle(1, 0xffff00, 0.25);
    g.drawRect(subject.x, subject.y, subject.width, subject.height);
    container.addChild(g);

    parent.addChild(container);
    makeDraggable(container);

    const btn = buttonizeInstance(labelPad);
    btn.behavior.on({
      trigger: () => {
        console.log(`// clicked //`, name);
        navigator.clipboard.writeText(name);
      },
      hoverIn: () => (label.style.fill = 0xffff00),
      hoverOut: () => (label.style.fill = 0xffffff),
    });

    return container;
  },
  sprites(
    subjects:
      | { textures: Record<string, string | Texture | Sprite> }
      | Record<string, string | Texture | Sprite>
      | string[]
      | Texture[]
      | Sprite[],
    parent: Container = getGameContext().app.stage
  ) {
    const hasTextures = (s: any): s is { textures: Record<string, string | Texture | Sprite> } =>
      "textures" in subjects;

    if (hasTextures(subjects)) {
      subjects = subjects.textures;
    }

    const sprites = [] as Sprite[];
    let y = 0;
    for (const [name, subject] of Object.entries(subjects)) {
      const sprite = this.sprite2(subject, parent, name) as Sprite;
      sprite.y = y += 20;
      sprites.push(sprite);
    }
    return sprites;
  },
};

