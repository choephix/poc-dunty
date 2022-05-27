import { Filter } from '@pixi/core';
import { DisplayObject } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { createSimpleTweener } from 'chimichanga/dist/animation/SimpleTweener';

export module FX {
  type FilterConstructorBase = new (...rest: any[]) => Filter & {
    refresh?: () => unknown;
  };

  export interface TemporaryFilterOptions<
    TFilter extends FilterConstructorBase
  > {
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

  export function addTemporaryFilterTo<TFilter extends FilterConstructorBase>(
    FilterConstructor: TFilter,
    target: DisplayObject | DisplayObject[],
    options: TemporaryFilterOptions<TFilter> = {}
  ) {
    const cleanupFunctions = [] as (() => void)[];
    const cleanup = () => cleanupFunctions.forEach((fn) => fn());

    const targets = [].concat(target);
    const filter = new FilterConstructor(
      options.filterConstructorParameters ?? {}
    );

    if (!isNaN(options.filterPadding)) {
      filter.padding = options.filterPadding;
    }

    for (const target of targets) {
      const targetFilters = target.filters || [];
      targetFilters.push(filter);
      target.filters = targetFilters;
      cleanupFunctions.push(() => {
        if (targetFilters) {
          const index = targetFilters.indexOf(filter);
          if (index >= 0) {
            targetFilters.splice(index, 1);
          }
        }
      });
    }

    const properties = options.onStart?.();

    const updateParamsObject = {
      progress: 0,
      filter: filter as any,
      targets,
      target: targets[0],
      properties,
    };
    if (!isNaN(options.duration)) {
      const tweener = createSimpleTweener();
      cleanupFunctions.push(() => tweener.stop());
      tweener
        .tween(
          (progress) => {
            updateParamsObject.progress = progress;
            options.onUpdate(updateParamsObject);
          },
          {
            duration: options.duration,
          }
        )
        .then(cleanup);
    } else if (options.onUpdate !== undefined) {
      let handle = -1;
      const animate = () => {
        options.onUpdate(updateParamsObject);
        handle = requestAnimationFrame(animate);
      };
      animate();
      cleanupFunctions.push(() => cancelAnimationFrame(handle));
    }

    return {
      then(func: () => unknown) {
        cleanupFunctions.push(func);
      },
      stop() {
        cleanup();
      },
    };
  }

  //// //// ////

  export function addSnapshot(target: Sprite, {
    duration = 1.0,
    endScaleMultiplier = 2.0,
  } = {}) {
    const cleanupFunctions = [] as (() => void)[];
    const cleanup = () => cleanupFunctions.forEach((fn) => fn());

    const clone = new Sprite(target.texture);
    target.parent.addChild(clone);
    clone.position.copyFrom(target.position);
    clone.anchor.copyFrom(target.anchor);

    const originalScale = target.scale.clone();
    const endScaleDelta = {
      x: (endScaleMultiplier - 1.0) * originalScale.x,
      y: (endScaleMultiplier - 1.0) * originalScale.y,
    };

    const tweener = createSimpleTweener();
    tweener.tween(
      (progress) => {
        clone.scale.set(
          originalScale.x + endScaleDelta.x * progress,
          originalScale.y + endScaleDelta.y * progress,
        );
        clone.alpha = Math.pow(1.0 - progress, 2.0);
      },
      { duration }
    );

    cleanupFunctions.push(() => tweener.stop());
    cleanupFunctions.push(() => clone.destroy({ children: true }));

    return {
      then(func: () => unknown) {
        cleanupFunctions.push(func);
      },
      stop() {
        cleanup();
      },
    };
  }
}
