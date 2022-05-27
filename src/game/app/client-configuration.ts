export function makeClientConfiguration() {
  return {
    world: {
      waterLevel: 0.35,
    },
  };
}

export type Configuration = ReturnType<typeof makeClientConfiguration>;

//// //// //// //// //// //// //// //// //// //// //// //// ////
//// //// //// //// //// //// //// //// //// //// //// //// ////
//// //// //// //// //// //// //// //// //// //// //// //// ////

import { debuggingPane } from "@debug/tweakpane";
import { GameContext } from "./app";

export function debugConfiguration(context: GameContext) {
  const { clientConfiguration: configuration } = context;

  const pg = debuggingPane.addFolder({
    title: "🔨 Configurations",
    expanded: false,
  });
}
