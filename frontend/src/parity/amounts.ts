export function decimalRaw(value: unknown): bigint | null {
  if (typeof value !== "string" || !/^\d+(\.\d{1,18})?$/.test(value))
    return null;
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, "0"));
}
export function sumDecimals(
  values: (string | undefined)[],
): string | undefined {
  if (!values.length) return undefined;
  let sum = 0n;
  for (const value of values) {
    const raw = decimalRaw(value);
    if (raw === null) return undefined;
    sum += raw;
  }
  return `${sum / 10n ** 18n}.${(sum % 10n ** 18n).toString().padStart(18, "0")}`;
}
export function holdingZone(
  value: unknown,
): "none" | "mass" | "best" | "anti" | null {
  const raw = decimalRaw(value);
  return raw === null
    ? null
    : raw === 0n
      ? "none"
      : raw < 1000n * 10n ** 18n
        ? "mass"
        : raw <= 100000n * 10n ** 18n
          ? "best"
          : "anti";
}
