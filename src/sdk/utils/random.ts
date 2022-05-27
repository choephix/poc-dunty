/**
 * @param fraction value between 0 and 1 (representing 0% and 100% respectively)
 */
export function chance(fraction: number) {
  return Math.random() < fraction;
}

/**
 * Excluding
 * @param max Excluding
 */
export const randomInt = (max: number) => ~~(Math.random() * max);

export const randomIntBetweenIncluding = (min: number, max: number, lean: number = 1.0) =>
  min + ~~(Math.random() ** lean * (max - min + 1));

// /**
//  * @param max the maximum positive value you can get. Minumum will be (-max). Defaults to one.
//  */
export const randomSigned = (max: number = 1) => Math.random() * max * 2.0 - max;

// /**
//  * @param min the minimum value you can get.
//  * @param max the maximum value you can get.
//  */
export const randomBetween = (min: number, max: number) => min + (max - min) * Math.random();

// export const randomIntPowered = (max: number, power: number) => ~~(Math.random() ** power * max);

// /**
//  * @param portion value between 0 and 1 (representing 0% and 100% respectively)
//  */

// export const parseStringToDecimal = (number: string, fixedTo: number) =>
//   !!(parseFloat(number) % 1) ? parseFloat(number).toFixed(fixedTo) : number;

// export const randomChunks = (chunks: number, total: number = 1.0, variance: number = 1.0) => {
//   const weights = new Array(chunks).fill(null).map(() => Math.random());
//   const weightsTotal = weights.reduce((a, c) => a + c, 0);
//   // if (variance < 1.0) {
//   //   for (const i in weights) {
//   //     weights[i] = lerp(weights[i], 1.0 / chunks, 1.0 - variance);
//   //   }
//   // }
//   return weights.map((w) => (total * w) / weightsTotal);
// };
