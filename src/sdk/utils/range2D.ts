export function* range2D(X: number, Y: number) {
  for (let ix = 0; ix < X; ix++) {
    for (let iy = 0; iy < Y; iy++) {
      yield [ix, iy];
    }
  }
}

export module range2D {
  export function* fromToIncluding(xFrom: number, yFrom: number, xTo: number, yTo: number) {
    for (let ix = xFrom; ix <= xTo; ix++) {
      for (let iy = yFrom; iy <= yTo; iy++) {
        yield [ix, iy];
      }
    }
  }
}
