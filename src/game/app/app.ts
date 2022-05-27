import { gsap } from "gsap";

import { BasisLoader } from "@game/app/initializers/initializePixiJs";
import { Application } from "@pixi/app";
import { Container, DisplayObject } from "@pixi/display";
import { Loader } from "@pixi/loaders";
import { WebfontLoaderPlugin } from "pixi-webfont-loader";
// import { Stage } from '@pixi/layers';

import "@game/app/initializers/initializeGSAP";
import "@game/app/initializers/initializePixiJs";
import { stopAppOnPageInvisible } from "@game/app/initializers/stopAppOnPageInvisible";
import { handlePageResize } from "@sdk/pixi/handlePageResize";

import { makeClientConfiguration } from "@game/app/client-configuration";
import { AssetsManager } from "@game/app/services/AssetsManager";
import { ViewSize } from "@game/app/services/ViewSize";
import { createTicker } from "@game/app/ticker";
import { loadMapData, MapData } from "@game/data/loadMapData";
import { UserDataController } from "@game/data/UserDataController";
import { UserDataHolder } from "@game/data/UserDataHolder";
import { makeScreenDimmer } from "@game/overlays/makeScreenDimmer";
import { GenericModalFactory } from "@game/ui/generic-modals/GenericModalFactory";
import type { World } from "@game/world/World";
import type { LoadingService } from "@launcher/loading/loading";
import { Renderer, Texture } from "@pixi/core";
import { TextureCache } from "@pixi/utils";
import type { WaxContractsGateway } from "@sdk-integration/contracts/WaxContractsGateway";
import { EventBus } from "@sdk/core/EventBus";
import type { ReadonlyDeep } from "type-fest";
import { makeInputService } from "./services/InputService";
import { fixBasisuTextureSizes } from "./initializers/fixBasisuTextureSizes";
import { Main } from "./main";

import { assetsAudio, assetsNamed, assetsUnnamed } from "@game/app/assetsManifests";
import { HistoryApiService } from "@sdk-integration/historyapi/HistoryApiService";
import { env } from "./global";
import { setupViewport } from "./initializers/setupViewport";

import { __DEBUG__, __onUninitializedContextCreated } from "@debug/__DEBUG__";
import { MusicSource } from "@game/constants/paths/MusicSource";
import { GameConfigurationData } from "@game/data/GameConfigurationData";
import { createLoadingVortexAnimation } from "@game/loading-screen/createLoadingVortexAnimation";
import { Sound } from "@pixi/sound";
import { ensureSignedInToFirebase } from "@sdk-integration/firebase/ensureSignedInToFirebase";
import { initializeFirebaseServices } from "@sdk-integration/firebase/FirebaseServicesWrapper";
import { HistoryDataController } from "@sdk-integration/historyapi/HistoryDataController";
import { enchantInstance } from "@sdk/pixi/enchant/enchantInstance";
import { addOnEnterFrame } from "@sdk/pixi/enchant/oef/addOnEnterFrame";
import { callOnEnterFrameRecursively } from "@sdk/pixi/enchant/oef/callOnEnterFrameRecursively";
import { SimpleObjectsFactory } from "./services/SimpleObjectsFactory";
import { GameSingletons } from "./GameSingletons";
import { setupAudioManagers } from "./initializers/setupAudioManagers";

Loader.registerPlugin(WebfontLoaderPlugin);

export interface Externals {
  waxContractsService: Readonly<WaxContractsGateway>;
  loadingSpinnerService: LoadingService;
  logout: () => void;
  analytics: {
    log(thing: Error | string): unknown;
  };
}

export function createGame(externals: Externals) {
  // create and append app
  const app = new Application({
    backgroundColor: 0x0,
    sharedTicker: false,
    sharedLoader: false,
    antialias: false,
    autoStart: false,
    resolution: Math.min(2.0, window.devicePixelRatio),
  });

  app.view.id = "gameView";
  app.view.addEventListener("contextmenu", e => e.preventDefault());

  const clientConfiguration = makeClientConfiguration();

  const events = new EventBus<{
    resize: (size: ViewSize) => void;
    ready: () => void;
  }>();

  const loader = Loader.shared;
  const assets = new AssetsManager();

  // @ts-ignore
  const stage = enchantInstance(Object.assign(addOnEnterFrame(app.stage), { name: "__stage__" }));
  const stageContainers = {
    _world: app.stage.addChild(new Container()),
    _worldVignette: app.stage.addChild(new Container()),
    _worldPopups: app.stage.addChild(new Container()),
    _worldHud: app.stage.addChild(new Container()),
    _cinematic: app.stage.addChild(new Container()),
    _hud: app.stage.addChild(new Container()),
    _modals: app.stage.addChild(new Container()),
    _dimmer: app.stage.addChild(new Container()),
    _debug: app.stage.addChild(new Container()),
  };

  const viewSize = new ViewSize();

  const ticker = createTicker();
  app.ticker = ticker;

  const animator = { tween: gsap, tl: gsap.timeline };

  const { music, sfx, disableGlobalAudioWhilePageNotVisible } = setupAudioManagers(loader);
  disableGlobalAudioWhilePageNotVisible();

  const input = makeInputService();

  const gameConfigData = new GameConfigurationData();

  const userDataCtrl = new UserDataController(new UserDataHolder());

  const worldViewport = setupViewport({ viewSize, ticker });
  stageContainers._world.addChild(worldViewport);

  const uninitializedContext = {
    env,

    spinner: externals.loadingSpinnerService,

    loaded: false,

    app,
    clientConfiguration,

    music,
    sfx,

    assets,
    simpleFactory: new SimpleObjectsFactory(assets),

    contracts: externals.waxContractsService,

    gameConfigData,

    mapData: null as null | MapData,

    userData: userDataCtrl.userData as ReadonlyDeep<UserDataHolder>,
    userDataCtrl,

    firebase: initializeFirebaseServices(),

    historyDataCtrl: new HistoryDataController(new HistoryApiService()),

    ticker,
    animator,

    stage,
    stageContainers,

    dimmer: app.stage.addChild(makeScreenDimmer(() => app.screen, ticker)),
    viewport: worldViewport,
    world: null as null | World,
    main: null as null | Main,
    modals: null as null | GenericModalFactory,

    viewSize,

    get scaleFactor() {
      return this.viewSize.vmin / 1080;
    },

    events,
    input,

    utils: {
      overrideRenderMethod(
        target: DisplayObject,
        callback: (timeInfo: { deltaTime: number; deltaSeconds: number; totalSeconds: number }) => void
      ) {
        const original = target.render;
        target.render = function (renderer: Renderer) {
          callback({
            deltaTime: ticker.deltaTime,
            deltaSeconds: ticker.deltaTime / 60,
            totalSeconds: ticker.lastTime,
          });
          original.call(this, renderer);
        };
      },

      makeScreenLayer<T extends DisplayObject>(
        target: DisplayObject & { width: number; height: number },
        layerKey: keyof typeof stageContainers | null,
        mods: Partial<T> = {}
      ) {
        const updateDimensions = ({ width, height }: { width: number; height: number }) => {
          if (target.destroyed) {
            off();
          } else {
            target.width = width;
            target.height = height;
          }
        };
        layerKey && stageContainers[layerKey].addChild(target);
        const off = events.on({ resize: updateDimensions });
        updateDimensions(uninitializedContext.viewSize);
        Object.assign(target, mods);
        return target;
      },
    },

    externals,

    HACKS: {} as any,

    VERSION: env.APP_PACKAGE_VERSION,
  };
  __DEBUG__ && __onUninitializedContextCreated(uninitializedContext);

  for (const [key, value] of Object.entries(uninitializedContext.stageContainers)) {
    value.name = key;
    value.sortableChildren = true;
  }

  const REASON_LOADING_ASSETS = Symbol("loadingAssets");
  uninitializedContext.dimmer.reasonsToShow.add(REASON_LOADING_ASSETS);

  const vortexLoadingAnimation = createLoadingVortexAnimation(app);
  app.stage.addChild(vortexLoadingAnimation);
  vortexLoadingAnimation.logo.onLoaded = () => vortexLoadingAnimation.turnOn();

  /**
   * Load assets that are not vital for the game to be played properly,
   * and so can be loaded in parallel with the game running.
   */
  const loadLazyAssets = async function () {
    const resourcesAudio = await uninitializedContext.assets.load(assetsAudio);
    Object.assign(loader.resources, resourcesAudio);
  };

  const boot = async function () {
    music.playTrack(Sound.from(MusicSource.MainModernTheme));
    music.setLowPassFilter(1.0, 0);
    // music.setTelephoneFilter(true, true);
    // music.setReverbFilter(true, true);

    await vortexLoadingAnimation.loadingPromise;

    async function loadGameAssets() {
      try {
        await BasisLoader.loadTranscoder("lib/basis_transcoder.js", "lib/basis_transcoder.wasm");
      } catch (error) {
        throw new Error(`Failed to load Basis transcoder: ${error}`);
      }

      try {
        const resources1 = await uninitializedContext.assets.load(assetsNamed);
        const resources2 = await uninitializedContext.assets.load(assetsUnnamed);
        Object.assign(loader.resources, resources1, resources2);
      } catch (error) {
        throw new Error(`Failed to load assets: ${error}`);
      }

      for (const [id, { texture, textures }] of Object.entries(loader.resources)) {
        if (!textures && texture && !TextureCache[id]) {
          Texture.addToCache(texture, id);
          console.warn(`Texture ${id} was not in cache, but I fixed that for you`);
        }
      }
    }

    async function loadGameData() {
      try {
        await gameConfigData.load(uninitializedContext);
      } catch (error) {
        throw new Error(`Failed to load game data: ${error}`);
      }

      try {
        await userDataCtrl.updateAll(uninitializedContext);
      } catch (error) {
        throw new Error(`Failed to load user data: ${error}`);
      }
    }

    const initializationPromises = [loadGameData(), loadGameAssets(), ticker.delay(0.5)];
    await Promise.all(initializationPromises);
    console.log(`👨‍🎤`, userDataCtrl.userData);
    fixBasisuTextureSizes(loader.resources);

    //// Update asset maps with references loaded textures
    for (const [key, resource] of Object.entries(loader.resources)) {
      if (resource.texture) {
        uninitializedContext.assets.textures[key] = resource.texture;
      }
      if (resource.textures) {
        Object.assign(uninitializedContext.assets.textures, resource.textures);
      }
    }

    try {
      await ensureSignedInToFirebase({
        contracts: uninitializedContext.contracts!,
        firebase: uninitializedContext.firebase!,
      });
    } catch (error) {
      throw new Error(`Failed to sign in to Firebase: ${error}`);
    }

    try {
      uninitializedContext.mapData = await loadMapData(uninitializedContext);
    } catch (error) {
      throw new Error(`Failed to load map data: ${error}`);
    }

    const context = uninitializedContext as GameContext;
    GameSingletons.setGameContextRef(context);

    console.log("🎉", "Map data loaded");

    music.fadeOutAllTracks();

    await ticker.delay(0.25);
    await vortexLoadingAnimation.turnOff();
    vortexLoadingAnimation.destroy();

    uninitializedContext.modals = new GenericModalFactory(context);
    uninitializedContext.main = new Main(context);
    uninitializedContext.world = uninitializedContext.main.world;
    uninitializedContext.world.initialize();
    uninitializedContext.main.initializeReactors(); // some reactors need the world to be initialized

    console.log("🎉", "Game initialized");

    (context.contracts as WaxContractsGateway).showError = (error: any) => {
      context.modals.warning(error);
    };

    loadLazyAssets();

    // applyWinteryTheme(context);

    uninitializedContext.loaded = true;
    await ticker.delayFrames(5);

    uninitializedContext.dimmer.reasonsToShow.remove(REASON_LOADING_ASSETS);
    await ticker.delay(0.1);

    uninitializedContext.main.start();

    music.setLowPassFilter(0, 0);
    // music.setTelephoneFilter(false, true);
    // music.setReverbFilter(false, true);
    music.fadeInAllTracks();

    events.dispatch("ready");
  };

  handlePageResize(uninitializedContext, () => events.dispatch("resize", uninitializedContext.viewSize));

  ticker.add(
    () => {
      if (document.visibilityState === "visible") {
        app.render();
      }
    },
    null,
    -100
  );

  ticker.add(
    () => {
      if (document.visibilityState === "visible") {
        callOnEnterFrameRecursively(stage);
      }
    },
    stage,
    99
  );

  if (document.visibilityState === "visible") {
    ticker.start();
  }

  stopAppOnPageInvisible(uninitializedContext);

  boot().catch(error => alert(`Error during game boot:\n${error.message}`));

  uninitializedContext.dimmer.reasonsToShow.addDuring("init", ticker.delay(0.4));

  return uninitializedContext;
}

export type UninitializedGameContext = ReturnType<typeof createGame>;
export type GameContext = {
  readonly [K in keyof UninitializedGameContext]: NonNullable<UninitializedGameContext[K]>;
};
