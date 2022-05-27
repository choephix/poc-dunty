import { Filter } from "@pixi/core";
import { DisplayObject } from "@pixi/display";
import { createSimpleTicker } from "@sdk/time/SimpleTicker";
import { createSimpleTweener } from "@sdk/time/SimpleTweener";
import { CallbackList } from "@sdk/utils/callbacks/CallbackList";

type FilterConstructorBase = new (...rest: any[]) => Filter & {
  refresh?: () => unknown;
};

export interface TemporaryFilterOptions<TFilter extends FilterConstructorBase> {
  duration?: number;
  onStart?: () => any;
  onUpdate?: (params: {
    progress: number;
    filter: InstanceType<TFilter>;
    targets: DisplayObject[];
    target: DisplayObject;
    properties: number;
  }) => unknown;
  filterConstructorParameters?: ConstructorParameters<TFilter>[0];
  filterPadding?: number;
}

export function greateDisplayObjectFiltersArray(target: DisplayObject) {
  return target.filters || (target.filters = new Array<Filter>());
}

/**
 * Adds a filter to a display object.
 *
 * Properly handles object.filters array (which can be empty or null) and
 * return a helper function to remove the filter without hassle.
 */
export function addDisplayObjectFilter(target: DisplayObject, filter: Filter) {
  const targetFilters = greateDisplayObjectFiltersArray(target);
  targetFilters.push(filter);
  return () => {
    const index = targetFilters.indexOf(filter);
    if (index !== -1) {
      targetFilters.splice(index, 1);
    }
  };
}

/**
 * Temporarily apply a new filter instance to given target object for a short time, then dispose of it.
 */
export function addTemporaryFilter<TFilter extends FilterConstructorBase>(
  FilterConstructor: TFilter,
  target: DisplayObject | DisplayObject[],
  options: TemporaryFilterOptions<TFilter> = {}
) {
  const cleanup = new CallbackList();
  const targets = new Array<DisplayObject>().concat(target);
  const filter = new FilterConstructor(options.filterConstructorParameters ?? {});

  const { filterPadding, duration, onUpdate } = options;

  if (filterPadding && !isNaN(filterPadding)) {
    filter.padding = filterPadding;
  }

  for (const target of targets) {
    const removeFilter = addDisplayObjectFilter(target, filter);
    cleanup.push(removeFilter);
  }

  const properties = options.onStart?.();

  const updateParamsObject = {
    progress: 0,
    progressDelta: 0,
    filter: filter as any,
    targets,
    target: targets[0],
    properties,
  };
  if (duration && !isNaN(duration)) {
    const onEnterFrame = (progress: number) => {
      updateParamsObject.progressDelta = progress - updateParamsObject.progress;
      updateParamsObject.progress = progress;
      onUpdate?.(updateParamsObject);
    };

    const simpleTweener = createSimpleTweener();

    const tween = simpleTweener.tween(onEnterFrame, duration);
    tween.then(() => cleanup.callAllAndClear());
    cleanup.push(() => tween.isRunning && tween.cancel());
  } else if (onUpdate !== undefined) {
    let handle = -1;
    const animate = () => {
      onUpdate(updateParamsObject);
      handle = requestAnimationFrame(animate);
    };
    animate();
    cleanup.push(() => cancelAnimationFrame(handle));
  }

  return {
    filter,
    then(func: () => unknown) {
      cleanup.push(func);
    },
    remove() {
      cleanup.callAllAndClear();
    },
  };
}
