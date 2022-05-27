export function toVectorRGB(hex: string | number) {
  hex = typeof hex == "string" ? parseInt(hex.replace(/^#/, ""), 16) : hex;
  return [((hex >> 16) & 0xff) / 255, ((hex >> 8) & 0xff) / 255, (hex & 0xff) / 255] as [number, number, number];
}

export function toVectorRGBA(hex: string | number) {
  hex = typeof hex == "string" ? parseInt(hex.replace(/^#/, ""), 16) : hex;
  return [((hex >> 32) & 0xff) / 255, ((hex >> 16) & 0xff) / 255, ((hex >> 8) & 0xff) / 255, (hex & 0xff) / 255] as [
    number,
    number,
    number,
    number
  ];
}

export function toHEXa([r, g, b, a]: [number, number, number, number]) {
  return ~~(0xfffffff * r) + ~~(0xfffff * g) + ~~(0xffff * b) + ~~(0xff * a);
}

export function toHEX([r, g, b]: [number, number, number]) {
  return ~~(0xfffff * r) + ~~(0xffff * g) + ~~(0xff * b);
}
