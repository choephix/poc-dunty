import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";

import * as PIXI from "@pixi/display";
// import * as PIXI from './initializePixiJs';

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

gsap.defaults({ overwrite: "auto" });
gsap.ticker.lagSmoothing(33, 33);
