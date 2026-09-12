import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import {
	CashFlowChart,
	type CashFlowRow,
} from "@/components/finance/cash-flow-chart";
import {
	CategoryDonutChart,
	type CategorySpendDatum,
} from "@/components/finance/category-donut-chart";
import { AmountDialog } from "@/components/finance/amount-dialog";
import { CurrencySwitcher } from "@/components/finance/currency-switcher";
import {
	OverviewStats,
	type OverviewStat,
} from "@/components/finance/overview-stats";
import { ProgressBar } from "@/components/finance/progress-bar";
import { RecentTransactions } from "@/components/finance/recent-transactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	convertAmount,
	formatConverted,
	formatMoney,
	monthRange,
	type Transaction,
} from "@/lib/finance";
import {
	categoryById,
	rateToKhr,
	useFinanceStore,
} from "@/stores/finance-store";
import { useFinancePrefsStore } from "@/stores/finance-prefs-store";
import { PlusIcon } from "lucide-react";

/** Percent change; returns 0 when the baseline is 0. */
function pctChange(current: number, previous: number): number {
	return previous > 0 ? ((current - previous) / previous) * 100 : 0;
}

const CASH_FLOW_DAYS = 120;
const RECENT_LIMIT = 6;

export default function FinanceOverviewPage() {
	const accounts = useFinanceStore((state) => state.accounts);
	const categories = useFinanceStore((state) => state.categories);
	const transactions = useFinanceStore((state) => state.transactions);
	const budgets = useFinanceStore((state) => state.budgets);
	const goals = useFinanceStore((state) => state.goals);
	const debts = useFinanceStore((state) => state.debts);
	const depositGoal = useFinanceStore((state) => state.depositGoal);

	const displayCurrency = useFinancePrefsStore((state) => state.displayCurrency);
	const rate = rateToKhr();
	const month = monthRange();
	const lastMonth = monthRange(-1);

	const inDisplay = (amount: number, from: "USD" | "KHR") =>
		convertAmount(amount, from, displayCurrency, rate);

	/* Totals — display currency only; stored amounts are never rewritten. */
	const totalBalance = useMemo(
		() =>
			accounts
				.filter((a) => a.isActive)
				.reduce((sum, a) => sum + inDisplay(a.currentBalance, a.currency), 0),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[accounts, displayCurrency, rate]
	);

	const inWindow = (tx: Transaction, start: string, end: string) =>
		tx.status === "completed" &&
		tx.transactionDate >= start &&
		tx.transactionDate <= end;

	const monthTxs = transactions.filter((tx) => inWindow(tx, month.start, month.end));
	const lastMonthTxs = transactions.filter((tx) =>
		inWindow(tx, lastMonth.start, lastMonth.end)
	);

	const sumType = (txs: Transaction[], type: Transaction["type"]) =>
		txs
			.filter((tx) => tx.type === type)
			.reduce((sum, tx) => sum + inDisplay(tx.amount, tx.currency), 0);

	const monthIncome = sumType(monthTxs, "income");
	const monthExpense = sumType(monthTxs, "expense");
	const lastMonthIncome = sumType(lastMonthTxs, "income");
	const lastMonthExpense = sumType(lastMonthTxs, "expense");
	const netDelta = (() => {
		const cur = monthIncome - monthExpense;
		const prev = lastMonthIncome - lastMonthExpense;
		return prev !== 0 ? ((cur - prev) / Math.abs(prev)) * 100 : 0;
	})();

	const stats: readonly OverviewStat[] = [
		{
			footnote: `${accounts.filter((a) => a.isActive).length} active accounts`,
			label: "Total balance",
			value: formatMoney(totalBalance, displayCurrency),
		},
		{
			delta: pctChange(monthIncome, lastMonthIncome),
			footnote: "vs last month",
			label: "Income this month",
			value: formatMoney(monthIncome, displayCurrency),
		},
		{
			// Spending less than last month is the favorable direction.
			delta: -pctChange(monthExpense, lastMonthExpense),
			footnote: "vs last month",
			label: "Expenses this month",
			value: formatMoney(monthExpense, displayCurrency),
		},
		{
			delta: netDelta,
			footnote: "vs last month",
			label: "Net this month",
			value: formatMoney(monthIncome - monthExpense, displayCurrency),
		},
	];

	/* Daily income/expense buckets for the cash-flow chart. */
	const cashFlowData = useMemo<CashFlowRow[]>(() => {
		const today = new Date();
		today.setDate(today.getDate() - CASH_FLOW_DAYS + 1);
		const buckets = new Map<string, CashFlowRow>();
		for (let i = 0; i < CASH_FLOW_DAYS; i++) {
			const iso = new Date(today);
			iso.setDate(today.getDate() + i);
			buckets.set(iso.toISOString().slice(0, 10), {
				date: iso.toISOString().slice(0, 10),
				expense: 0,
				income: 0,
			});
		}
		for (const tx of transactions) {
			if (tx.status !== "completed") continue;
			const bucket = buckets.get(tx.transactionDate);
			if (!bucket) continue;
			const amount = inDisplay(tx.amount, tx.currency);
			if (tx.type === "income") {
				bucket.income += amount;
			} else {
				bucket.expense += amount;
			}
		}
		return [...buckets.values()];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [transactions, displayCurrency, rate]);

	/* Expense share per category for the donut. */
	const categorySpend = useMemo<CategorySpendDatum[]>(() => {
		const totals = new Map<string, number>();
		for (const tx of monthTxs) {
			if (tx.type !== "expense" || tx.status === "cancelled" || !tx.categoryId) {
				continue;
			}
			totals.set(
				tx.categoryId,
				(totals.get(tx.categoryId) ?? 0) +
					inDisplay(tx.amount, tx.currency)
			);
		}
		return [...totals.entries()]
			.map(([categoryId, value]) => ({
				categoryId,
				fill: categoryById(categories, categoryId)?.color ?? "#94a3b8",
				name: categoryById(categories, categoryId)?.name ?? "Uncategorized",
				value,
			}))
			.sort((a, b) => b.value - a.value);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [monthTxs, categories, displayCurrency, rate]);

	const recent = [...transactions]
		.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate))
		.slice(0, RECENT_LIMIT);

	const borrowed = debts
		.filter((d) => d.type === "borrowed" && d.status !== "paid")
		.reduce((sum, d) => sum + inDisplay(d.remainingAmount, d.currency), 0);
	const lent = debts
		.filter((d) => d.type === "lent" && d.status !== "paid")
		.reduce((sum, d) => sum + inDisplay(d.remainingAmount, d.currency), 0);

	const [depositTarget, setDepositTarget] = useState<string | null>(null);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<PageHeader
					description="Accounts, budgets, goals, and debts across USD and KHR."
					title="Budget tracker"
				/>
				<CurrencySwitcher />
			</div>

			{/* KPI row */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<OverviewStats stats={stats} />
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
				<CashFlowChart
					className="lg:col-span-3"
					currency={displayCurrency}
					data={cashFlowData}
				/>
				<CategoryDonutChart currency={displayCurrency} data={categorySpend} />

				{/* Budgets */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="text-base">Budgets · {month.label}</CardTitle>
						<CardDescription>
							Spending per category against its cap.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{budgets.length === 0 && (
							<p className="text-muted-foreground text-sm">
								No budgets for this month yet.
							</p>
						)}
						{budgets.map((budget) => {
							const category = categoryById(categories, budget.categoryId);
							const spent = transactions
								.filter(
									(tx) =>
										tx.type === "expense" &&
										tx.categoryId === budget.categoryId &&
										tx.status !== "cancelled" &&
										tx.transactionDate >= budget.startDate &&
										tx.transactionDate <= budget.endDate
								)
								.reduce(
									(sum, tx) =>
										sum +
										convertAmount(tx.amount, tx.currency, budget.currency, rate),
									0
								);
							const percent =
								budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
							return (
								<div className="space-y-1.5" key={budget.id}>
									<div className="flex items-center justify-between gap-2 text-sm">
										<span className="flex min-w-0 items-center gap-2">
											<span
												className="size-2 shrink-0 rounded-full"
												style={{ backgroundColor: category?.color }}
											/>
											<span className="truncate font-medium">
												{category?.name ?? "—"}
											</span>
											<Badge variant="outline">{budget.period}</Badge>
										</span>
										<span className="shrink-0 text-muted-foreground tabular-nums text-xs">
											{formatConverted(spent, budget.currency, displayCurrency, rate)} /{" "}
											{formatConverted(budget.amount, budget.currency, displayCurrency, rate)}
										</span>
									</div>
									<ProgressBar percent={percent} />
								</div>
							);
						})}
					</CardContent>
				</Card>

				{/* Goals */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="text-base">Goals</CardTitle>
						<CardDescription>Savings targets and progress.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{goals.length === 0 && (
							<p className="text-muted-foreground text-sm">
								No savings goals yet.
							</p>
						)}
						{goals.map((goal) => {
							const percent =
								goal.targetAmount > 0
									? (goal.currentAmount / goal.targetAmount) * 100
									: 0;
							return (
								<div className="space-y-1.5" key={goal.id}>
									<div className="flex items-center justify-between gap-2 text-sm">
										<span className="flex min-w-0 items-center gap-2">
											<span className="truncate font-medium">{goal.name}</span>
											{goal.status === "completed" && (
												<Badge variant="secondary">Completed</Badge>
											)}
										</span>
										<span className="flex shrink-0 items-center gap-2 text-muted-foreground tabular-nums text-xs">
											{formatMoney(goal.currentAmount, goal.currency)} /{" "}
											{formatMoney(goal.targetAmount, goal.currency)}
											{goal.status === "active" && (
												<Button
													aria-label={`Add funds to ${goal.name}`}
													onClick={() => setDepositTarget(goal.id)}
													size="icon-xs"
													variant="ghost"
												>
													<PlusIcon />
												</Button>
											)}
										</span>
									</div>
									<ProgressBar percent={percent} />
								</div>
							);
						})}
					</CardContent>
				</Card>

				<RecentTransactions
					className="lg:col-span-3"
					displayCurrency={displayCurrency}
					transactions={recent}
				/>

				{/* Debts summary */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Debts</CardTitle>
						<CardDescription>Outstanding borrowed and lent totals.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">You owe</span>
							<span className="font-medium tabular-nums">
								{formatMoney(borrowed, displayCurrency)}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Owed to you</span>
							<span className="font-medium tabular-nums">
								{formatMoney(lent, displayCurrency)}
							</span>
						</div>
						<div className="flex items-center justify-between border-t pt-3">
							<span className="text-muted-foreground">Net</span>
							<span className="font-medium tabular-nums">
								{formatMoney(lent - borrowed, displayCurrency)}
							</span>
						</div>
					</CardContent>
				</Card>
			</div>

			<AmountDialog
				description="Record money set aside for this goal."
				onConfirm={(amount) => {
					if (depositTarget) depositGoal(depositTarget, amount);
				}}
				onOpenChange={(open) => !open && setDepositTarget(null)}
				open={depositTarget !== null}
				submitLabel="Add funds"
				title="Add funds to goal"
			/>
		</div>
	);
}
