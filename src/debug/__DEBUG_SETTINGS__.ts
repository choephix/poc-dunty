import { debuggingPane } from "./tweakpane";

export const __DEBUG_SETTINGS__ = {
  ["Yard"]: false,
  ["Lounge"]: false,
  ["Station-Dashboard"]: false,
  ["Station-Ids-Instead-Of-Names"]: false,
  ["Evil-Twin-Train"]: false,
  ["Many-Cards"]: false,
  ["Default-Station-Id"]: "1099521667582",
};

export function loadDebugPersistentSettings() {
  type DebugSettingsKey = keyof typeof __DEBUG_SETTINGS__;
  const settings = __DEBUG_SETTINGS__ as Record<DebugSettingsKey, any>;
  const localStoragePrefix = "debugging.";
  for (const keyString in __DEBUG_SETTINGS__) {
    try {
      const key = keyString as DebugSettingsKey;
      const storedValue = localStorage.getItem(localStoragePrefix + key);
      if (storedValue == null) continue;
      if (typeof settings[key] == "string") settings[key] = storedValue;
      else settings[key] = JSON.parse(storedValue);
    } catch (error) {
      console.warn(error);
    }
  }
}

export function initializeDebuggingSettings() {
  const properties = __DEBUG_SETTINGS__ as Record<string, any>;
  const localStoragePrefix = "debugging.";
  for (const key in properties) {
    // This works only for boolean
    properties[key] ||= localStorage.getItem(localStoragePrefix + key) === "true";
    const toggle = debuggingPane.addInput(properties, key);
    toggle.on("change", () => localStorage.setItem(localStoragePrefix + key, properties[key]));
  }
}
