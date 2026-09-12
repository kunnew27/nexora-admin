import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { BudgetFormDrawer } from "@/components/finance/budget-form-drawer";
import { DeleteConfirmDialog } from "@/components/finance/delete-confirm";
import { ProgressBar } from "@/components/finance/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	convertAmount,
	formatConverted,
	formatDate,
	formatMoney,
	type Budget,
} from "@/lib/finance";
import { categoryById, rateToKhr, useFinanceStore } from "@/stores/finance-store";
import { useFinancePrefsStore } from "@/stores/finance-prefs-store";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

export default function BudgetsPage() {
	const budgets = useFinanceStore((state) => state.budgets);
	const categories = useFinanceStore((state) => state.categories);
	const transactions = useFinanceStore((state) => state.transactions);
	const deleteBudget = useFinanceStore((state) => state.deleteBudget);

	const displayCurrency = useFinancePrefsStore((state) => state.displayCurrency);
	const rate = rateToKhr();

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editing, setEditing] = useState<Budget | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);

	const openCreate = () => {
		setEditing(null);
		setDrawerOpen(true);
	};

	const openEdit = (budget: Budget) => {
		setEditing(budget);
		setDrawerOpen(true);
	};

	const confirmDelete = () => {
		if (!deleteTarget) return;
		deleteBudget(deleteTarget.id);
		toast.success("Budget deleted", {
			description: "Spending is no longer capped by this budget.",
		});
		setDeleteTarget(null);
	};

	return (
		<>
			<div className="mb-4 flex flex-wrap items-start justify-between gap-4">
				<PageHeader
					description="Spending caps per category for weekly, monthly, or yearly windows."
					title="Budgets"
				/>
				<Button onClick={openCreate} size="sm">
					<PlusIcon data-icon="inline-start" />
					Add budget
				</Button>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
							(sum, tx) => sum + convertAmount(tx.amount, tx.currency, budget.currency, rate),
							0
						);
					const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
					const remaining = budget.amount - spent;
					return (
						<Card key={budget.id}>
							<CardContent className="space-y-3">
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0 space-y-1">
										<p className="flex items-center gap-2 font-medium">
											<span
												className="size-2.5 shrink-0 rounded-full"
												style={{ backgroundColor: category?.color }}
											/>
											<span className="truncate">{category?.name ?? "Unknown category"}</span>
										</p>
										<p className="flex items-center gap-2 text-muted-foreground text-xs">
											<Badge variant="outline">{budget.period}</Badge>
											<span className="truncate tabular-nums">
												{formatDate(budget.startDate)} → {formatDate(budget.endDate)}
											</span>
										</p>
									</div>
									<div className="flex shrink-0 items-center gap-1">
										<Button
											aria-label="Edit budget"
											className="text-muted-foreground hover:text-foreground"
											onClick={() => openEdit(budget)}
											size="icon-xs"
											variant="ghost"
										>
											<PencilIcon />
										</Button>
										<Button
											aria-label="Delete budget"
											className="text-muted-foreground hover:text-destructive"
											onClick={() => setDeleteTarget(budget)}
											size="icon-xs"
											variant="ghost"
										>
											<Trash2Icon />
										</Button>
									</div>
								</div>

								<ProgressBar percent={percent} />

								<div className="flex items-center justify-between text-sm tabular-nums">
									<span className="text-muted-foreground">
										{formatConverted(spent, budget.currency, displayCurrency, rate)} spent
									</span>
									<span
										className={`font-medium ${
											remaining < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
										}`}
									>
										{remaining < 0
											? `${formatConverted(Math.abs(remaining), budget.currency, displayCurrency, rate)} over`
											: `${formatConverted(remaining, budget.currency, displayCurrency, rate)} left`}
									</span>
								</div>
								<p className="text-muted-foreground text-xs tabular-nums">
									Cap: {formatConverted(budget.amount, budget.currency, displayCurrency, rate)}{" "}
									({formatMoney(budget.amount, budget.currency)})
								</p>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<BudgetFormDrawer budget={editing} onOpenChange={setDrawerOpen} open={drawerOpen} />
			<DeleteConfirmDialog
				description="This removes the spending cap. Transactions are not affected."
				onConfirm={confirmDelete}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				open={deleteTarget !== null}
				title="Delete budget?"
			/>
		</>
	);
}
