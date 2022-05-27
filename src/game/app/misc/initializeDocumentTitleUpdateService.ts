import { formatTimeDurationHumanReadable } from "@game/asorted/formatTimeDurationHumanReadable";
import { GameContext } from "../app";

export function initializeDocumentTitleUpdateService(context: GameContext) {
  const regularTitle = `Train of the Century`;

  const ongoingRunsMap = context.userData.trainsOngoingRuns;

  setInterval(() => {
    if (ongoingRunsMap.size > 0) {
      const runs = [...ongoingRunsMap.values()];
      if (runs.some(run => run.isReadyToClaim)) {
        document.title = `🚂 ⭐ - ${regularTitle}`;
      } else {
        runs.sort((a, b) => a.secondsLeft - b.secondsLeft);
        const run = runs[0];
        document.title = `🚂 ${formatTimeDurationHumanReadable(run.secondsLeft)} - ${regularTitle}`;
      }
    } else {
      document.title = regularTitle;
    }
  }, 1000);
}
