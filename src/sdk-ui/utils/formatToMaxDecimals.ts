/**
 * Returns a string with the given number, shortened to the given number of decimals,
 * trimming trailing zeros.
 */
export function formatToMaxDecimals(
  value: number | string,
  maxDecimals: number = 1,
  groupThousands: boolean = true
): string {
  if (isNaN(+value)) return typeof value === "string" ? value : "--";
  if (!isFinite(+value)) return "--";

  const str = typeof value === "number" ? value.toFixed(maxDecimals) : value;
  let [int, dec] = str.split(".");

  if (!dec) {
    return int;
  }

  while (dec?.endsWith("0")) {
    dec = dec.slice(0, -1);
  }

  let result = dec === "" ? int : `${int}.${dec}`;

  if (groupThousands) {
    result = formatGroupThousands(result);
  }

  return result;
}

/**
 * Returns a string with the given number, shortened to the given number of decimals,
 * trimming trailing zeros.
 */
export function formatGroupThousands(value: number | string): string {
  if (typeof value === "number") {
    value = value.toString();
  }

  return value.replace(/(?<!\.\d*)(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
}
