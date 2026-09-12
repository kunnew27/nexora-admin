import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	categoryById,
	rateToKhr,
	useFinanceStore,
} from "@/stores/finance-store";
import {
	formatConverted,
	type Category,
	type Currency,
	type Transaction,
} from "@/lib/finance";

/** Latest activity across all accounts, styled after the dashboard-3 table card. */
export function RecentTransactions({
	transactions,
	displayCurrency,
	className,
	...props
}: ComponentProps<typeof Card> & {
	transactions: Transaction[];
	displayCurrency: Currency;
}) {
	const accounts = useFinanceStore((state) => state.accounts);
	const categories = useFinanceStore((state) => state.categories);

	return (
		<Card className={cn("gap-0", className)} {...props}>
			<CardHeader className="border-b">
				<CardTitle>Recent transactions</CardTitle>
				<CardDescription>Latest activity across all accounts</CardDescription>
			</CardHeader>
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent">
							<TableHead className="pl-6">Transaction</TableHead>
							<TableHead className="hidden sm:table-cell">Category</TableHead>
							<TableHead className="hidden md:table-cell">Account</TableHead>
							<TableHead className="hidden lg:table-cell">Date</TableHead>
							<TableHead className="pr-6 text-right">Amount</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{transactions.map((tx) => {
							const category = categoryById(categories, tx.categoryId);
							const account = accounts.find((a) => a.id === tx.accountId);
							return (
								<TableRow className="h-14" key={tx.id}>
									<TableCell className="max-w-48 pl-6">
										<span className="flex items-center gap-3">
											<TransactionDot category={category} type={tx.type} />
											<span className="truncate font-medium">
												{tx.description || category?.name || "Transaction"}
											</span>
										</span>
									</TableCell>
									<TableCell className="hidden max-w-32 sm:table-cell">
										<span className="line-clamp-1 text-muted-foreground text-sm">
											{category?.name ?? "Uncategorized"}
										</span>
									</TableCell>
									<TableCell className="hidden max-w-32 md:table-cell">
										<span className="line-clamp-1 text-muted-foreground text-sm">
											{account?.name ?? "Deleted account"}
										</span>
									</TableCell>
									<TableCell className="hidden text-muted-foreground text-sm lg:table-cell">
										{tx.transactionDate}
									</TableCell>
									<TableCell className="pr-6 text-right">
										<AmountCell
											displayCurrency={displayCurrency}
											tx={tx}
										/>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
				<div className="flex justify-center border-t py-3">
					<Button
						nativeButton={false}
						render={<Link to="/transactions" />}
						size="sm"
						variant="ghost"
					>
						View all transactions
						<ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function TransactionDot({
	category,
	type,
}: {
	category: Category | undefined;
	type: Transaction["type"];
}) {
	const isIncome = type === "income";
	return (
		<span
			className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm"
			style={{
				backgroundColor: `${category?.color ?? "#94a3b8"}1a`,
				color: category?.color ?? "#64748b",
			}}
		>
			{isIncome ? "↓" : "↑"}
		</span>
	);
}

function AmountCell({
	displayCurrency,
	tx,
}: {
	displayCurrency: Currency;
	tx: Transaction;
}) {
	const rate = rateToKhr();
	const isIncome = tx.type === "income";
	return (
		<span
			className={cn(
				"font-medium text-sm tabular-nums",
				isIncome
					? "text-emerald-600 dark:text-emerald-400"
					: "text-rose-600 dark:text-rose-400"
			)}
		>
			{isIncome ? "+" : "−"}
			{formatConverted(tx.amount, tx.currency, displayCurrency, rate)}
		</span>
	);
}
