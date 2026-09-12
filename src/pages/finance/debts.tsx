import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { AmountDialog } from "@/components/finance/amount-dialog";
import { DebtFormDrawer } from "@/components/finance/debt-form-drawer";
import { DeleteConfirmDialog } from "@/components/finance/delete-confirm";
import { ProgressBar } from "@/components/finance/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatMoney, type Debt } from "@/lib/finance";
import { useFinanceStore } from "@/stores/finance-store";
import { CoinsIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

const statusVariant = {
	active: "outline",
	paid: "secondary",
	overdue: "destructive",
} as const;

export default function DebtsPage() {
	const debts = useFinanceStore((state) => state.debts);
	const deleteDebt = useFinanceStore((state) => state.deleteDebt);
	const payDebt = useFinanceStore((state) => state.payDebt);

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editing, setEditing] = useState<Debt | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Debt | null>(null);
	const [payTarget, setPayTarget] = useState<Debt | null>(null);

	const openCreate = () => {
		setEditing(null);
		setDrawerOpen(true);
	};

	const openEdit = (debt: Debt) => {
		setEditing(debt);
		setDrawerOpen(true);
	};

	const confirmDelete = () => {
		if (!deleteTarget) return;
		deleteDebt(deleteTarget.id);
		toast.success("Debt deleted", { description: `${deleteTarget.name} was removed.` });
		setDeleteTarget(null);
	};

	const confirmPay = (amount: number) => {
		if (!payTarget) return;
		payDebt(payTarget.id, amount);
		toast.success("Payment recorded", {
			description: `${formatMoney(amount, payTarget.currency)} paid toward ${payTarget.name}.`,
		});
	};

	return (
		<>
			<div className="mb-4 flex flex-wrap items-start justify-between gap-4">
				<PageHeader
					description="Money you borrowed or lent, with remaining balances."
					title="Debts"
				/>
				<Button onClick={openCreate} size="sm">
					<PlusIcon data-icon="inline-start" />
					Record debt
				</Button>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{debts.map((debt) => {
					const paidPercent =
						debt.originalAmount > 0
							? ((debt.originalAmount - debt.remainingAmount) / debt.originalAmount) * 100
							: 0;
					return (
						<Card key={debt.id}>
							<CardContent className="space-y-3">
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0 space-y-1">
										<p className="truncate font-medium">{debt.name}</p>
										<p className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
											<Badge variant={debt.type === "borrowed" ? "destructive" : "secondary"}>
												{debt.type === "borrowed" ? "You owe" : "Owed to you"}
											</Badge>
											<Badge variant={statusVariant[debt.status]}>{debt.status}</Badge>
											{debt.interestRate != null && <span>{debt.interestRate}% interest</span>}
										</p>
									</div>
									<div className="flex shrink-0 items-center gap-1">
										{debt.status === "active" && (
											<Button
												aria-label={`Record payment for ${debt.name}`}
												className="text-muted-foreground hover:text-foreground"
												onClick={() => setPayTarget(debt)}
												size="icon-xs"
												variant="ghost"
											>
												<CoinsIcon />
											</Button>
										)}
										<Button
											aria-label={`Edit ${debt.name}`}
											className="text-muted-foreground hover:text-foreground"
											onClick={() => openEdit(debt)}
											size="icon-xs"
											variant="ghost"
										>
											<PencilIcon />
										</Button>
										<Button
											aria-label={`Delete ${debt.name}`}
											className="text-muted-foreground hover:text-destructive"
											onClick={() => setDeleteTarget(debt)}
											size="icon-xs"
											variant="ghost"
										>
											<Trash2Icon />
										</Button>
									</div>
								</div>

								<ProgressBar percent={paidPercent} />

								<div className="flex items-center justify-between text-sm tabular-nums">
									<span className="font-medium">
										{formatMoney(debt.remainingAmount, debt.currency)} left
									</span>
									<span className="text-muted-foreground">
										of {formatMoney(debt.originalAmount, debt.currency)}
									</span>
								</div>
								{debt.dueDate && (
									<p className="text-muted-foreground text-xs tabular-nums">
										Due {formatDate(debt.dueDate)}
									</p>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>

			<DebtFormDrawer debt={editing} onOpenChange={setDrawerOpen} open={drawerOpen} />
			<AmountDialog
				description={`Record a payment toward "${payTarget?.name ?? ""}". Remaining balance is reduced automatically.`}
				onConfirm={confirmPay}
				onOpenChange={(open) => !open && setPayTarget(null)}
				open={payTarget !== null}
				submitLabel="Record payment"
				title="Record payment"
			/>
			<DeleteConfirmDialog
				description="This removes the debt record from your tracker."
				onConfirm={confirmDelete}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				open={deleteTarget !== null}
				title={`Delete ${deleteTarget?.name}?`}
			/>
		</>
	);
}
