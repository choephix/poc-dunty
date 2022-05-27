import { Loader } from "@pixi/loaders";

function isTasksMapAnNotArray(tasks: any): tasks is Record<string, string> {
  return typeof tasks === "object" && !Array.isArray(tasks);
}

export async function loadPixiAssets(tasks: Record<string, string> | string[], loader: Loader = new Loader()) {
  if (isTasksMapAnNotArray(tasks)) {
    for (const assetName in tasks) {
      loader.add(assetName, tasks[assetName]);
    }
  } else {
    for (const assetName in tasks) {
      loader.add(tasks[assetName]);
    }
  }
  return new Promise<{ resources: Loader["resources"] }>(resolve =>
    loader.load(() => resolve({ resources: loader.resources }))
  );
}
