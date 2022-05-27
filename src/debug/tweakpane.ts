import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import { Pane, TabApi } from "tweakpane";
import { GameContext } from "@game/app/app";
import { range } from "@sdk/utils/range";
import { __add, __window__ } from "./__";
import { getRandomItemFrom } from "@sdk/helpers/arrays";
import { __DEBUG__ } from "./__DEBUG__";
import { Sprite } from "@pixi/sprite";

const pane = new Pane({ title: "Debug of the Century" });
pane.registerPlugin(EssentialsPlugin);
pane.expanded = false;
pane.hidden = !__DEBUG__;

let tabs = null as null | TabApi;

export const debuggingPane = Object.assign(pane, {
  greateMainTab(title: string) {
    if (!tabs) {
      tabs = pane.addTab({
        pages: [{ title }],
        index: 0,
      });
      return tabs.pages[0];
    } else {
      return tabs.pages.find(pg => pg.title === title) ?? tabs.addPage({ title });
    }
  },
});

/** Debugging with TweakPane: Add FPS graph */
export function addFpsGraph(ticker: { FPS: number }, MAX: number = 240) {
  /**
   * We resort to this lunacy, because the actual ticker keeps returning NaN
   * on some very rare occasions, which makes the graph go haywire in the console.
   */
  const getter = {
    get fps() {
      return ~~ticker.FPS;
    },
  };
  MAX += 2;
  debuggingPane.addMonitor(getter, "fps", {
    view: "graph",
    label: "",
    min: -0,
    max: MAX,
    bufferSize: 120,
    lineCount: 1,
    index: 0,
    // format: (n) => MAX * Math.pow(n / MAX, 4),
  });
  debuggingPane.addMonitor(getter, "fps", {
    index: 0,
  });
}

/** Debugging with TweakPane: Add Assets Inspector */
export function addInspectionTools(context: GameContext) {
  const folder = debuggingPane.addFolder({
    title: "🔍 Assets Inspector",
    expanded: false,
    // index: 0,
  });

  const { assets } = context;

  const blade1 = folder.addBlade({
    view: "list",
    label: "Atlases",
    options: Object.keys(assets.resources)
      .filter(key => Object.keys(assets.resources[key].textures ?? {}).length > 1)
      .map(key => ({ text: key, value: assets.resources[key].textures })),
    value: "",
  });

  const blade2 = folder.addBlade({
    view: "list",
    label: "Texture",
    options: Object.keys(assets.resources)
      .filter(key => assets.resources[key].texture)
      .map(key => ({ text: key, value: assets.resources[key].texture })),
    value: "",
  });

  const currentSprites = [] as Sprite[];
  folder.on("change", e => {
    if (e.target === blade1) {
      const sprites = __add.sprites(e.value as any, context.app.stage);
      currentSprites.forEach(s => s.destroy());
      currentSprites.length = 0;
      currentSprites.push(...sprites);
    } else if (e.target === blade2) {
      const sprite = __add.sprite2(e.value as any, context.app.stage) as Sprite;
      currentSprites.forEach(s => s.destroy());
      currentSprites.length = 0;
      currentSprites.push(sprite);
    }
  });
}

function makeid(length: number) {
  const characters = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"];
  return range(length)
    .map(() => getRandomItemFrom(characters))
    .join("");
}

export function addDebugButton(label: string, fn: () => unknown) {
  __window__["__" + label.replace(/ /gi, "_")] = fn;
  const btn = debuggingPane.addButton({ title: label, index: undefined });
  btn.on("click", fn);
  return btn;
}

export function addOneShotDebugButton(label: string, fn: () => unknown) {
  const btn = addDebugButton(label, fn);
  btn.on("click", () => debuggingPane.remove(btn));
  return btn;
}

debuggingPane.element.id = "tweakpane";

const styleEl = document.createElement("style");
styleEl.innerHTML = `
  @keyframes fadeInTweakpane {
    0% {opacity:0; transform:translateX(200px)}
    75% {opacity:0; transform:translateX(200px)}
    100% {opacity:1;}
  }
  #tweakpane {
    animation: fadeInTweakpane ease 2s;
    z-index: 1;
  }
`;
debuggingPane.element.append(styleEl);
