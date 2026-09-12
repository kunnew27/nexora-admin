import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { AmountDialog } from "@/components/finance/amount-dialog";
import { DeleteConfirmDialog } from "@/components/finance/delete-confirm";
import { GoalFormDrawer } from "@/components/finance/goal-form-drawer";
import { ProgressBar } from "@/components/finance/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, type Goal } from "@/lib/finance";
import { useFinanceStore } from "@/stores/finance-store";
import { PencilIcon, PiggyBankIcon, PlusIcon, Trash2Icon } from "lucide-react";

const statusVariant = {
	active: "outline",
	completed: "secondary",
	cancelled: "destructive",
} as const;

export default function GoalsPage() {
	const goals = useFinanceStore((state) => state.goals);
	const deleteGoal = useFinanceStore((state) => state.deleteGoal);
	const depositGoal = useFinanceStore((state) => state.depositGoal);

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editing, setEditing] = useState<Goal | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
	const [depositTarget, setDepositTarget] = useState<Goal | null>(null);

	const openCreate = () => {
		setEditing(null);
		setDrawerOpen(true);
	};

	const openEdit = (goal: Goal) => {
		setEditing(goal);
		setDrawerOpen(true);
	};

	const confirmDelete = () => {
		if (!deleteTarget) return;
		deleteGoal(deleteTarget.id);
		toast.success("Goal deleted", { description: `${deleteTarget.name} was removed.` });
		setDeleteTarget(null);
	};

	return (
		<>
			<div className="mb-4 flex flex-wrap items-start justify-between gap-4">
				<PageHeader
					description="Savings targets with progress and deadlines."
					title="Goals"
				/>
				<Button onClick={openCreate} size="sm">
					<PlusIcon data-icon="inline-start" />
					Add goal
				</Button>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{goals.map((goal) => {
					const percent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
					return (
						<Card key={goal.id}>
							<CardContent className="space-y-3">
								<div className="flex items-start justify-between gap-2">
									<div className="min-w-0 space-y-1">
										<p className="truncate font-medium">{goal.name}</p>
										<p className="flex items-center gap-2 text-muted-foreground text-xs">
											<Badge variant={statusVariant[goal.status]}>{goal.status}</Badge>
											{goal.deadline && (
												<span className="truncate tabular-nums">Due {formatDate(goal.deadline)}</span>
											)}
										</p>
									</div>
									<div className="flex shrink-0 items-center gap-1">
										{goal.status === "active" && (
											<Button
												aria-label={`Add funds to ${goal.name}`}
												className="text-muted-foreground hover:text-foreground"
												onClick={() => setDepositTarget(goal)}
												size="icon-xs"
												variant="ghost"
											>
												<PiggyBankIcon />
											</Button>
										)}
										<Button
											aria-label={`Edit ${goal.name}`}
											className="text-muted-foreground hover:text-foreground"
											onClick={() => openEdit(goal)}
											size="icon-xs"
											variant="ghost"
										>
											<PencilIcon />
										</Button>
										<Button
											aria-label={`Delete ${goal.name}`}
											className="text-muted-foreground hover:text-destructive"
											onClick={() => setDeleteTarget(goal)}
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
										{goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}{" "}
										{goal.currency}
									</span>
									<span className="font-medium">{percent.toFixed(0)}%</span>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<GoalFormDrawer goal={editing} onOpenChange={setDrawerOpen} open={drawerOpen} />
			<AmountDialog
				description={`Record money set aside for "${depositTarget?.name ?? ""}".`}
				onConfirm={(amount) => {
					if (depositTarget) depositGoal(depositTarget.id, amount);
				}}
				onOpenChange={(open) => !open && setDepositTarget(null)}
				open={depositTarget !== null}
				submitLabel="Add funds"
				title="Add funds to goal"
			/>
			<DeleteConfirmDialog
				description="This removes the savings goal. It does not delete any transactions."
				onConfirm={confirmDelete}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				open={deleteTarget !== null}
				title={`Delete ${deleteTarget?.name}?`}
			/>
		</>
	);
}
