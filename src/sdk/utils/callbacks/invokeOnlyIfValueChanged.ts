export function invokeOnlyIfValueChanged<TCallback extends (...args: any[]) => void, T>(
  callback: TCallback,
  getter: () => T,
  initialInvokation: boolean = false,
  $this: any = null
) {
  let oldValue = getter();

  if (initialInvokation) {
    callback(oldValue);
  }

  const wrappedFunction = (...args: Parameters<TCallback>) => {
    const newValue = getter.apply($this);
    if (oldValue === newValue) {
      return;
    }
    oldValue = newValue;
    return callback.apply($this, args);
  };

  return Object.assign(wrappedFunction as TCallback, {
    forceInvoke(...args: Parameters<TCallback>) {
      return callback.apply($this, args);
    },
  });
}

// function callOnlyOnChangeArray<T extends any[]>(callback: (newValue: T[], oldValue: T[]) => void, array: T[]): T[] {
//   const oldValue = array.slice();
//   const newValue = array.slice();
//   callback(newValue, oldValue);
//   return newValue;
// }
