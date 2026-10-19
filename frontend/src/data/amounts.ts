/** Exact display conversion: no token amount passes through floating-point arithmetic. */
export function formatRawAmount(
  raw: bigint,
  decimals: number,
  locale = "en",
  displayDecimals = 6,
): string {
  if (
    !Number.isInteger(decimals) ||
    decimals < 0 ||
    decimals > 255 ||
    !Number.isInteger(displayDecimals) ||
    displayDecimals < 0
  )
    throw new RangeError("Invalid decimals");
  const negative = raw < 0n,
    absolute = negative ? -raw : raw,
    scale = 10n ** BigInt(decimals);
  const whole = absolute / scale;
  const fraction = (absolute % scale)
    .toString()
    .padStart(decimals, "0")
    .slice(0, Math.min(decimals, displayDecimals))
    .replace(/0+$/, "");
  const separator =
    new Intl.NumberFormat(locale)
      .formatToParts(1.1)
      .find((part) => part.type === "decimal")?.value || ".";
  if (absolute > 0n && whole === 0n && !fraction) {
    const places = Math.min(decimals, displayDecimals);
    const limit = places > 0 ? `0${separator}${"0".repeat(places - 1)}1` : "1";
    return `${negative ? ">-" : "<"}${limit}`;
  }
  return `${negative ? "-" : ""}${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(whole)}${fraction ? separator + fraction : ""}`;
}
export function parseBalance(value: unknown): bigint {
  if (typeof value !== "string" || !/^0x[0-9a-f]+$/i.test(value))
    throw new Error("Invalid balance");
  return BigInt(value);
}
export function inviteCode(search: string): string | null {
  const value = new URLSearchParams(search).get("invite");
  return value && /^[a-z0-9]{4,16}$/i.test(value) ? value : null;
}
