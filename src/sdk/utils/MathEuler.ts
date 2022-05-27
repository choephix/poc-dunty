export module MathEuler {
  export const PI_2: number = Math.PI * 2;
  export const RAD_TO_DEG: number = 180 / Math.PI;
  export const DEG_TO_RAD: number = Math.PI / 180;

  /*

  2D Angle Interpolation (shortest distance)

  Parameters:
  a0 = start angle
  a1 = end angle
  t = interpolation factor (0.0=start, 1.0=end)

  Benefits:
  1. Angles do NOT need to be normalized.
  2. Implementation is portable, regardless of how the modulo "%" operator outputs sign (i.e. Python, Ruby, Javascript)
  3. Very easy to remember.

  Thanks to Trey Wilson for the closed-form solution for shortAngleDist!
  */

  export function distance(a: number, b: number) {
    const da = (b - a) % PI_2;
    return ((2 * da) % PI_2) - da;
  }

  export function lerp(a: number, b: number, frac: number) {
    return a + distance(a, b) * frac;
  }
}
