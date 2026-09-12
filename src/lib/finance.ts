/**
 * Personal Pro Finance — frontend domain types and currency helpers.
 * Mirrors the MongoDB schema: accounts, categories, transactions (income /
 * expense), exchange rates, budgets, goals and debts. Money is stored as
 * plain numbers here; the backend persists Decimal128.
 */

export type Currency = "USD" | "KHR";
export const CURRENCIES: Currency[] = ["USD", "KHR"];

export type AccountType = "cash" | "bank" | "savings" | "credit" | "wallet";
export const ACCOUNT_TYPES: AccountType[] = [
  "cash",
  "bank",
  "savings",
  "credit",
  "wallet",
];

export type CategoryType = "income" | "expense";

export type TransactionType = CategoryType;
export type TransactionStatus = "pending" | "completed" | "cancelled";
export const TRANSACTION_STATUSES: TransactionStatus[] = [
  "pending",
  "completed",
  "cancelled",
];

export type BudgetPeriod = "weekly" | "monthly" | "yearly";
export const BUDGET_PERIODS: BudgetPeriod[] = ["weekly", "monthly", "yearly"];

export type GoalStatus = "active" | "completed" | "cancelled";
export type DebtType = "borrowed" | "lent";
export type DebtStatus = "active" | "paid" | "overdue";

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  currentBalance: number; // native currency of the account
  currency: Currency;
  isActive: boolean;
  createdAt: string;
};

export type Category = {
  id: string;
  userId: string | null; // null = default system category
  name: string;
  type: CategoryType;
  color: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: number; // original positive amount, never rewritten on conversion
  currency: Currency; // currency of the original transaction
  baseCurrency: Currency; // user's base currency when recorded
  exchangeRateToBase: number; // snapshot for historical reports
  amountInBaseCurrency: number; // amount × exchangeRateToBase
  description: string;
  transactionDate: string; // ISO date
  status: TransactionStatus;
  createdAt: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  currency: Currency;
  period: BudgetPeriod;
  startDate: string; // ISO date
  endDate: string; // ISO date
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  deadline: string | null;
  status: GoalStatus;
};

export type Debt = {
  id: string;
  name: string;
  type: DebtType;
  originalAmount: number;
  remainingAmount: number;
  currency: Currency;
  interestRate: number | null;
  dueDate: string | null;
  status: DebtStatus;
};

/* ------------------------------------------------------------------ */
/* Exchange rate snapshot                                              */
/* ------------------------------------------------------------------ */

export type ExchangeRate = {
  baseCurrency: Currency;
  targetCurrency: Currency;
  rate: number; // 1 USD = rate KHR
  effectiveAt: string;
  source: string;
};

/* ------------------------------------------------------------------ */
/* Conversion + formatting                                             */
/* ------------------------------------------------------------------ */

/** Convert `amount` between USD and KHR using the snapshot rate. Same-currency is a no-op. */
export function convertAmount(
  amount: number,
  from: Currency,
  to: Currency,
  rateToKhr: number,
): number {
  if (from === to) return amount;
  return from === "USD" ? amount * rateToKhr : amount / rateToKhr;
}

import { formatRiel, roundRiel } from "@/lib/khr";

/**
 * Khmer compact units (ពាន់ = thousand, លាន = million) written out manually —
 * Intl compact notation falls back to English "K"/"M" for km-KH in some
 * engines, which is wrong for Khmer money display.
 */
function khrCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    return `${sign}${Number((abs / 1_000_000).toFixed(1))} លាន៛`;
  }
  if (abs >= 1_000) {
    return `${sign}${Number((abs / 1_000).toFixed(1))} ពាន់៛`;
  }
  return formatMoney(amount, "KHR");
}

export function formatMoney(amount: number, currency: Currency): string {
  // KHR delegates to the project's riel formatter, snapped to a payable
  // value — riel circulates as 100៛/500៛ notes, so a display like 220៛
  // can never exist as cash.
  if (currency === "KHR") return formatRiel(roundRiel(amount));
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format an original transaction amount in the display currency, converting for display only. */
export function formatConverted(
  amount: number,
  from: Currency,
  display: Currency,
  rateToKhr: number,
): string {
  return formatMoney(convertAmount(amount, from, display, rateToKhr), display);
}

export function formatCompact(amount: number, currency: Currency): string {
  if (currency === "KHR") {
    return khrCompact(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

/* ------------------------------------------------------------------ */
/* Dates + budget windows                                              */
/* ------------------------------------------------------------------ */

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function monthRange(offset = 0): {
  start: string;
  end: string;
  label: string;
} {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    label: start.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
  };
}

/** Window covered by a budget of the given period, ending on `anchorIso`'s period. */
export function periodRange(
  period: BudgetPeriod,
  anchorIso: string,
): { start: string; end: string } {
  const anchor = new Date(`${anchorIso}T12:00:00`);
  if (period === "weekly") {
    const start = new Date(anchor);
    start.setDate(anchor.getDate() - anchor.getDay()); // week starts Sunday
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }
  if (period === "yearly") {
    const start = new Date(anchor.getFullYear(), 0, 1);
    const end = new Date(anchor.getFullYear(), 11, 31);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }
  return { start: monthRange().start, end: monthRange().end };
}

/** Sum of expense amounts (converted to `currency`) for a category inside a window. */
export function spentInWindow(
  transactions: Transaction[],
  categoryId: string,
  currency: Currency,
  rateToKhr: number,
  start: string,
  end: string,
): number {
  return transactions
    .filter(
      (tx) =>
        tx.type === "expense" &&
        tx.categoryId === categoryId &&
        tx.status !== "cancelled" &&
        tx.transactionDate >= start &&
        tx.transactionDate <= end,
    )
    .reduce(
      (sum, tx) =>
        sum + convertAmount(tx.amount, tx.currency, currency, rateToKhr),
      0,
    );
}

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}
