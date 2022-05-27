/**
 * Adds to the target the specified filter, only if it doesn't already have it.
 */

export function addFilter(target: { filters: any[] | null }, filter: any) {
  if (!target.filters) {
    target.filters = [];
  }

  if (!target.filters.includes(filter)) {
    target.filters.push(filter);
  }
}

/**
 * Removes from the target the specified filter, if it has it.
 */
export function removeFilter(target: { filters: any[] | null }, filter: any) {
  if (target.filters) {
    const index = target.filters.indexOf(filter);

    if (index >= 0) {
      target.filters.splice(index, 1);
    }
  }
}
