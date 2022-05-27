/**
 * @param fraction value between 0 and 1 (representing 0% and 100% respectively)
 */
export function chance(fraction: number) {
  return Math.random() < fraction;
}
