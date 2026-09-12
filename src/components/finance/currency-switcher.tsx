import { cn } from "@/lib/utils";
import { CURRENCIES } from "@/lib/finance";
import { useFinancePrefsStore } from "@/stores/finance-prefs-store";

/** USD / KHR display toggle. Only changes presentation, never stored amounts. */
export function CurrencySwitcher({ className }: { className?: string }) {
	const displayCurrency = useFinancePrefsStore((state) => state.displayCurrency);
	const setDisplayCurrency = useFinancePrefsStore((state) => state.setDisplayCurrency);

	return (
		<div
			aria-label="Display currency"
			className={cn("inline-flex items-center rounded-lg border p-0.5", className)}
			role="group"
		>
			{CURRENCIES.map((currency) => (
				<button
					aria-pressed={displayCurrency === currency}
					className={cn(
						"rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
						displayCurrency === currency
							? "bg-sidebar-accent text-foreground"
							: "text-muted-foreground hover:text-foreground"
					)}
					key={currency}
					onClick={() => setDisplayCurrency(currency)}
					type="button"
				>
					{currency}
				</button>
			))}
		</div>
	);
}
