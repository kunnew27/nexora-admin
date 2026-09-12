import { useState } from "react";
import {
	ReportLayout,
} from "@/components/finance/report-layout";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	categoryById,
	rateToKhr,
	useFinanceStore,
} from "@/stores/finance-store";
import { useFinancePrefsStore } from "@/stores/finance-prefs-store";
import {
	convertAmount,
	formatConverted,
	formatDate,
	formatMoney,
	monthRange,
	type Transaction,
} from "@/lib/finance";
import { TrendingUpIcon, PrinterIcon } from "lucide-react";

export default function IncomeReportPage() {
	const transactions = useFinanceStore((state) => state.transactions);
	const accounts = useFinanceStore((state) => state.accounts);
	const categories = useFinanceStore((state) => state.categories);
	const displayCurrency = useFinancePrefsStore((state) => state.displayCurrency);
	const rate = rateToKhr();

	const month = monthRange();
	const [range, setRange] = useState({ from: month.start, to: month.end });

	const rows: Transaction[] = transactions
		.filter(
			(tx) =>
				tx.type === "income" &&
				tx.status === "completed" &&
				tx.transactionDate >= range.from &&
				tx.transactionDate <= range.to,
		)
		.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));

	const total = rows.reduce(
		(sum, tx) => sum + convertAmount(tx.amount, tx.currency, displayCurrency, rate),
		0,
	);

	return (
		<ReportLayout
			description="Completed income across all accounts for the chosen window."
			from={range.from}
			onApply={setRange}
			title="Income report"
			to={range.to}
		>
			<Card className="gap-0 overflow-visible print:rounded-none print:border-0 print:shadow-none print:ring-0">
				<CardHeader className="border-b py-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						<TrendingUpIcon className="size-4 text-emerald-500" />
						Income · {formatDate(range.from)} → {formatDate(range.to)}
					</CardTitle>
					<CardDescription className="text-xs">
						{rows.length} {rows.length === 1 ? "transaction" : "transactions"}
					</CardDescription>
					<CardAction>
						<Button
							aria-label="Print report"
							className="print:hidden"
							onClick={() => window.print()}
							size="icon-sm"
							variant="ghost"
						>
							<PrinterIcon />
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent className="p-0">
					{rows.length === 0 ? (
						<p className="px-4 py-10 text-center text-muted-foreground text-sm">
							No income recorded in this window.
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow className="hover:bg-transparent">
									<TableHead className="pl-6">Date</TableHead>
									<TableHead>Description</TableHead>
									<TableHead className="hidden sm:table-cell print:table-cell">
										Category
									</TableHead>
									<TableHead className="hidden md:table-cell print:table-cell">
										Account
									</TableHead>
									<TableHead className="pr-6 text-right">Amount</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rows.map((tx) => {
									const category = categoryById(categories, tx.categoryId);
									const account = accounts.find((a) => a.id === tx.accountId);
									return (
										<TableRow key={tx.id}>
											<TableCell className="pl-6 text-muted-foreground text-sm tabular-nums">
												{tx.transactionDate}
											</TableCell>
											<TableCell className="max-w-56 truncate font-medium text-sm">
												{tx.description || category?.name || "Transaction"}
											</TableCell>
											<TableCell className="hidden sm:table-cell print:table-cell">
												<span className="flex items-center gap-2 text-sm">
													<span
														aria-hidden="true"
														className="size-2 shrink-0 rounded-full"
														style={{ backgroundColor: category?.color }}
													/>
													{category?.name ?? "Uncategorized"}
												</span>
											</TableCell>
											<TableCell className="hidden text-muted-foreground text-sm md:table-cell print:table-cell">
												{account?.name ?? "Deleted account"}
											</TableCell>
											<TableCell className="pr-6 text-right font-medium text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
												+{formatConverted(tx.amount, tx.currency, displayCurrency, rate)}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
							<TableFooter>
								<TableRow className="hover:bg-transparent">
									<TableCell className="pl-6" colSpan={4}>
										Total income
									</TableCell>
									<TableCell className="pr-6 text-right font-semibold tabular-nums">
										{formatMoney(total, displayCurrency)}
									</TableCell>
								</TableRow>
							</TableFooter>
						</Table>
					)}
				</CardContent>
			</Card>
		</ReportLayout>
	);
}
