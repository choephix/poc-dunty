export const onKeyPress = (code: string | number, callback: (e:KeyboardEvent) => unknown, once?: true) => {
  const clear = () => window.document.removeEventListener('keypress', handler);
  const handler = (e: KeyboardEvent) => {
    if (e.code === code || e.key === code || e.keyCode === code) {
      callback(e);
      once && clear();
    }
  };
  window.document.addEventListener('keypress', handler);
  return clear;
};
