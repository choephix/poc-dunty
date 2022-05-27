export class AudioSettingsStorageController {
  constructor(private readonly _storageKeyVolume: string, private readonly _storageKeyMuted: string) {}

  get volume() {
    return +(localStorage.getItem(this._storageKeyVolume) || "1");
  }

  set volume(value: number) {
    localStorage.setItem(this._storageKeyVolume, value.toString());
  }

  get muted() {
    return localStorage.getItem(this._storageKeyMuted) == "true";
  }

  set muted(value: boolean) {
    localStorage.setItem(this._storageKeyMuted, value.toString());
  }
}
