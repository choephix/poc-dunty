export const onKeyPress = (code: string | number, callback: (e: KeyboardEvent) => unknown, once?: true) => {
  const clear = () => window.document.removeEventListener("keyup", handler);
  const handler = (e: KeyboardEvent) => {
    if (e.code === code || e.key === code || e.keyCode === code) {
      callback(e);
      once && clear();
    }
  };
  window.document.addEventListener("keyup", handler);
  return clear;
};

export const onKeyPressWithAlt = (code: string | number, callback: (e: KeyboardEvent) => unknown, once?: true) => {
  const clear = () => window.document.removeEventListener("keydown", handler);
  const handler = (e: KeyboardEvent) => {
    if (e.altKey) {
      console.log(e.AT_TARGET, e.key, e.keyCode);
      if (e.code === code || e.key === code || e.keyCode === code) {
        callback(e);
        once && clear();
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }
  };
  window.document.addEventListener("keydown", handler);
  return clear;
};

export const onKeyDownWithCleanup = (
  code: string | number,
  callback: (e: KeyboardEvent) => () => unknown,
  once?: true
) => {
  const isCorrectKey = (e: KeyboardEvent) => e.code === code || e.key === code || e.keyCode === code;
  const clearFunctions = [] as Function[];
  const clear = () => void clearFunctions.forEach(f => f());
  let down = false;

  const handleDown = (e: KeyboardEvent) => {
    if (isCorrectKey(e) && !down) {
      down = true;
      const cleanup = callback(e);
      once && clear();
      const handleUp = (e: KeyboardEvent) => {
        down = false;
        isCorrectKey(e) && cleanup();
        window.document.removeEventListener("keyup", handleUp);
      };
      window.document.addEventListener("keyup", handleUp);
    }
  };
  window.document.addEventListener("keydown", handleDown);
  clearFunctions.push(() => window.document.removeEventListener("keydown", handleDown));
  return clear;
};
