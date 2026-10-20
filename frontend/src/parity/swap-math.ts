import { decimalRaw } from "./amounts.ts";
export const SCALE = 10n ** 18n;
export function rawDecimal(raw: bigint): string {
  return (
    `${raw / SCALE}.${(raw % SCALE).toString().padStart(18, "0")}`.replace(
      /\.?0+$/,
      "",
    ) || "0"
  );
}
export function balancePortion(balance: string, percent: number): string {
  const raw = decimalRaw(balance);
  if (raw === null || ![25, 50, 75, 100].includes(percent)) return "";
  return rawDecimal((raw * BigInt(percent)) / 100n);
}
// UI-only reference quote. No router, allowance request, or transaction is created.
export function referenceQuote(
  input: string,
  reverse: boolean,
  slippage: string,
) {
  const normalized = input.endsWith(".") ? input.slice(0, -1) : input;
  const value = decimalRaw(normalized || "0");
  const bps = ({ "0.5": 50n, "1": 100n, "3": 300n } as Record<string, bigint>)[
    slippage
  ];
  if (value === null || bps === undefined) return null;
  const gross = reverse ? value / 10n : value * 10n;
  const fee = (gross * 300n) / 10000n;
  const output = gross - fee;
  return { value, fee, output, minimum: (output * (10000n - bps)) / 10000n };
}
