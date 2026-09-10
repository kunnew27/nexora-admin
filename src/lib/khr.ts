import { add, dinero, multiply, toSnapshot, type Currency } from "dinero.js";
import { NumberParser } from "@internationalized/number";

/** Riel has no circulating subunit — ISO lists 2 decimals, reality is 0. */
export const KHR: Currency<number> = { code: "KHR", base: 10, exponent: 0 };
export const USD: Currency<number> = { code: "USD", base: 10, exponent: 2 };

/** Smallest note in circulation. Coins are effectively unused. */
export const RIEL_CASH_UNIT = 100;

export const RIEL_NOTES = [
  100_000, 50_000, 20_000, 10_000, 5000, 2000, 1000, 500, 200, 100,
] as const;

/** Common market rate. Always inject the live rate in production. */
export const DEFAULT_USD_KHR_RATE = 4000;

const KHMER_DIGITS = "០១២៣៤៥៦៧៨៩";

const khmerParser = new NumberParser("km-KH", { maximumFractionDigits: 0 });

/** Normalize Khmer numerals to ASCII so parsing works on typed input. */
export function toLatinDigits(input: string) {
  return input.replace(/[\u17E0-\u17E9]/g, (digit) =>
    String(KHMER_DIGITS.indexOf(digit)),
  );
}

export type RielRoundMode = "nearest" | "up" | "down";

/**
 * Snap an amount to a payable riel value: 1250 → 1200, 1260 → 1300.
 * `up` favors the merchant, `down` favors the customer.
 */
export function roundRiel(
  amount: number,
  {
    unit = RIEL_CASH_UNIT,
    mode = "nearest",
  }: { unit?: number; mode?: RielRoundMode } = {},
) {
  if (!Number.isFinite(amount)) return 0;
  const quotient = amount / unit;
  const rounded =
    mode === "up"
      ? Math.ceil(quotient)
      : mode === "down"
        ? Math.floor(quotient)
        : Math.round(quotient);
  return rounded * unit;
}

export function isPayableRiel(amount: number, unit = RIEL_CASH_UNIT) {
  return Number.isInteger(amount) && amount % unit === 0;
}

/** Greedy note breakdown for a cash drawer or change display. */
export function breakdownRiel(amount: number) {
  let remaining = roundRiel(Math.abs(amount));
  const result: { note: number; count: number }[] = [];
  for (const note of RIEL_NOTES) {
    const count = Math.floor(remaining / note);
    if (count > 0) {
      result.push({ note, count });
      remaining -= count * note;
    }
  }
  return result;
}

export function usdToRiel(
  usd: number,
  { rate = DEFAULT_USD_KHR_RATE, mode = "nearest" as RielRoundMode } = {},
) {
  return roundRiel(usd * rate, { mode });
}

export function rielToUsd(riel: number, rate = DEFAULT_USD_KHR_RATE) {
  // USD keeps 2 decimals, so round to cents.
  return Math.round((riel / rate) * 100) / 100;
}

/**
 * Parse typed or pasted riel, including Khmer numerals (១,២៥០).
 * Uses NumberParser because Intl cannot read localized digits.
 */
export function parseRiel(input: string): number | null {
  const parsed = khmerParser.parse(toLatinDigits(input.replace(/៛/g, "").trim()));
  if (Number.isNaN(parsed)) return null;
  return Math.trunc(parsed);
}

/**
 * Format riel. Symbol is appended manually rather than using
 * `style: "currency"`, because CLDR symbol placement for KHR varies by locale.
 */
export function formatRiel(
  amount: number | null | undefined,
  {
    numerals = "latn",
    withSymbol = true,
  }: { numerals?: "latn" | "khmr"; withSymbol?: boolean } = {},
) {
  if (amount == null || Number.isNaN(amount)) return "";
  const formatted = new Intl.NumberFormat(
    numerals === "khmr" ? "km-KH-u-nu-khmr" : "en-US",
    { maximumFractionDigits: 0, useGrouping: true },
  ).format(Math.trunc(amount));
  return withSymbol ? `${formatted}៛` : formatted;
}

/** Integer minor-unit amount in riel (exponent 0). */
export function riel(amount: number) {
  return dinero({ amount, currency: KHR });
}

export type RielLine = { price: number; qty: number };

/** Exact line-item total. Round with `roundRiel` only at payment. */
export function sumRielLines(lines: RielLine[]) {
  if (lines.length === 0) return 0;
  const total = lines
    .map(({ price, qty }) => multiply(riel(price), qty))
    .reduce((acc, next) => add(acc, next));
  return toSnapshot(total).amount;
}
