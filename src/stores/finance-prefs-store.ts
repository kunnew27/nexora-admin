import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "@/lib/finance";

/** Demo snapshot: 1 USD = 4100 KHR. Editable in Settings → Exchange rate. */
export const DEFAULT_RATE_TO_KHR = 4100;

/**
 * Per the schema, users carry a `baseCurrency` (reports/totals) and a
 * `displayCurrency` (what the UI shows). Changing either only recalculates
 * responses — it never rewrites transactions. `exchangeRate` is the live
 * USD→KHR snapshot used for every conversion.
 */
type FinancePrefsState = {
	baseCurrency: Currency;
	displayCurrency: Currency;
	exchangeRate: number;
	setDisplayCurrency: (currency: Currency) => void;
	/** Base currency drives reporting; the display currency follows it. */
	setBaseCurrency: (currency: Currency) => void;
	setExchangeRate: (rate: number) => void;
};

export const useFinancePrefsStore = create<FinancePrefsState>()(
	persist(
		(set) => ({
			baseCurrency: "USD",
			displayCurrency: "USD",
			exchangeRate: DEFAULT_RATE_TO_KHR,
			setDisplayCurrency: (currency) => set({ displayCurrency: currency }),
			setBaseCurrency: (currency) =>
				set({ baseCurrency: currency, displayCurrency: currency }),
			setExchangeRate: (rate) => set({ exchangeRate: rate }),
		}),
		{ name: "finance-prefs" }
	)
);
