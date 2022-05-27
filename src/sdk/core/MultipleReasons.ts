import { EventBus } from "./EventBus";

export enum MultipleReasonsEvents {
  CHANGE = "change",
  EMPTY = "empty",
  NON_EMPTY = "notEmpty",
}

export type ReasonIdentifier = string | symbol | MultipleReasons;

export class MultipleReasons extends EventBus<{
  [MultipleReasonsEvents.CHANGE]: (hasReasons: boolean) => any;
  [MultipleReasonsEvents.EMPTY]: () => any;
  [MultipleReasonsEvents.NON_EMPTY]: () => any;
}> {
  private reasons: Set<ReasonIdentifier> = new Set();

  /**
   * @return Returns back the same promise, given in the params.
   */
  public addDuring<T>(identifier: ReasonIdentifier, promiseToUnblockAfter: Promise<T>) {
    this.add(identifier);
    promiseToUnblockAfter.finally(() => this.remove(identifier));
    return promiseToUnblockAfter;
  }

  /**
   * @param identifier Unique identifier for the reason to be added. Pass the same
   * identifier to .removeReason() or just call the cleanup function returned by
   * .addReason(), to remove it. Can be either string or a symbol value.
   *
   * @param forceUnique If true, and the identifier is of string type, the identifier
   * will be wrapped in a Symbol object, to ensure there a unique reference to it.
   *
   * Let's say you call .addReason('someReusedString') three times -- each of
   * those calls will return its own cleanup function. Only, behind the curtains, all
   * active reason identifiers are stored in a stored set of unique values, and because
   * all three calls use the same identifier string, the set will ultimately contain
   * just `['someReusedString']`. Thus, the first call to a cleanup function will
   * actually simply call .removeReason('someReusedString'), effectively clearing
   * for all three calls.
   *
   * If this is not the entended behaviour for you, you can use 'forceUnique' = true
   * to wrap the strings in Symbol objects, which will make the set contain:
   * `[Symbol('someReusedString'), Symbol('someReusedString'), Symbol('someReusedString')]`
   * instead, each with a unique reference, and each properly removed by its own cleanup
   * method.
   *
   * Note, that calling .removeReason('someReusedString') manually in this case will not work,
   * only the returned cleanup function can remove reasons added this way.
   *
   * Also note, that this behaviour is identical to calling
   * .addReason(Symbol('someReusedString')) yourself.
   *
   * @return Returns a cleanup function to remove the added reason.
   */
  public add(identifier: ReasonIdentifier, forceUnique = false): () => void {
    if (forceUnique && typeof identifier === "string") {
      identifier = Symbol(identifier);
    }

    this.reasons.add(identifier);

    this.dispatch(MultipleReasonsEvents.CHANGE, this.hasAny());

    if (this.reasons.size === 1) {
      this.dispatch(MultipleReasonsEvents.NON_EMPTY);
    }

    return () => this.remove(identifier);
  }

  public remove(identifier: ReasonIdentifier): void {
    if (this.reasons.has(identifier)) {
      this.reasons.delete(identifier);
      this.dispatch(MultipleReasonsEvents.CHANGE, this.hasAny());
    }

    if (this.reasons.size === 0) {
      this.dispatch(MultipleReasonsEvents.EMPTY);
    }
  }

  public removeAll(): void {
    this.reasons.clear();
    this.dispatch(MultipleReasonsEvents.CHANGE, false);
    this.dispatch(MultipleReasonsEvents.EMPTY);
  }

  public set(identifier: ReasonIdentifier, value: boolean): void {
    if (value) {
      this.add(identifier);
    } else {
      this.remove(identifier);
    }
  }

  public toggle(identifier: ReasonIdentifier): void {
    return this.set(identifier, !this.has(identifier));
  }

  public has(identifier: ReasonIdentifier) {
    return this.reasons.has(identifier);
  }

  public hasAny(): boolean {
    return this.reasons.size > 0;
  }

  public isEmpty(): boolean {
    return this.reasons.size <= 0;
  }

  public async waitUntilEmpty(): Promise<void> {
    if (this.hasAny()) {
      await this.waitFor(MultipleReasonsEvents.EMPTY);
    }
  }

  /**
   * Whenever a new reason is added or removed to this object,
   * reasons will be added to the children as well...
   *
   * You can use this to hook up granular reasons to more general reasons.
   *
   * For example, if you have a button, and the following instances of Multiple reasons:
   *
   * * `reasonsToHidePlayButton`
   *
   * * `reasonsToHideAllTheButtons`
   *
   * Obviously, if either of those aren't empty, you want your "play" button to be hidden.
   *
   * Instead of going with something like
   *
   * `mustHideButton = reasonsToHidePlayButton.hasReasons() || reasonsToHideAllTheButtons.hasReasons()`
   *
   * You can just do
   *
   * `reasonsToHideAllTheButtons.makeParentTo(reasonsToHidePlayButton)`
   *
   * Since now if `reasonsToHideAllTheButtons` has any reasons, so will `reasonsToHidePlayButton`.
   * you don't have to check both explicitly, and for your check you can simply use:
   *
   * `mustHideButton = reasonsToHidePlayButton.hasReasons()`
   *
   * */
  public makeParentTo(...children: MultipleReasons[]): void {
    this.on({
      change: hasReasons => {
        if (hasReasons) {
          children.forEach(child => child.add(this));
        } else {
          children.forEach(child => child.remove(this));
        }
      },
    });
  }

  public toString() {
    return [...this.reasons].map(r => (typeof r === `symbol` ? String(r) : r)).join(", ");
  }
}

export module MultipleReasons {
  export function prettifyMultipleReasonsMapToStingMethod<T extends Record<string, MultipleReasons>>(map: T) {
    return Object.assign(map, {
      toString() {
        return Object.entries(map)
          .filter(([, reasons]) => reasons instanceof MultipleReasons && reasons.hasAny())
          .map(([key, reasons]) => `"${key}": ${reasons}`)
          .join("\n");
      },
    });
  }
}
