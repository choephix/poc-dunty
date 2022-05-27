export const __waitForKeyPress = (code?: string | number) => {
  return new Promise<KeyboardEvent>(resolve => {
    function onKey(e: KeyboardEvent) {
      if (code === undefined || code === e.code || code === e.key || code === e["keyCode"]) {
        resolve(e);
      }
    }
    window.document.addEventListener("keypress", onKey);
  });
};
