import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import type { DataTableColumn } from "@/components/data-table";
import { DeleteConfirmDialog } from "@/components/finance/delete-confirm";
import { TransactionFormDrawer } from "@/components/finance/transaction-form-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	formatMoney,
	formatConverted,
	formatDate,
	type Transaction,
	type TransactionStatus,
	type TransactionType,
} from "@/lib/finance";
import { accountById, categoryById, rateToKhr, useFinanceStore } from "@/stores/finance-store";
import { useFinancePrefsStore } from "@/stores/finance-prefs-store";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

const statusVariant: Record<TransactionStatus, "secondary" | "outline" | "destructive"> = {
	completed: "secondary",
	pending: "outline",
	cancelled: "destructive",
};

export default function TransactionsPage() {
	const transactions = useFinanceStore((state) => state.transactions);
	const accounts = useFinanceStore((state) => state.accounts);
	const categories = useFinanceStore((state) => state.categories);
	const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);

	const displayCurrency = useFinancePrefsStore((state) => state.displayCurrency);
	const rate = rateToKhr();

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editing, setEditing] = useState<Transaction | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
	const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
	const [statusFilter, setStatusFilter] = useState<"all" | TransactionStatus>("all");

	const filtered = useMemo(
		() =>
			transactions
				.filter((tx) => typeFilter === "all" || tx.type === typeFilter)
				.filter((tx) => statusFilter === "all" || tx.status === statusFilter)
				.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate)),
		[transactions, typeFilter, statusFilter]
	);

	const openCreate = () => {
		setEditing(null);
		setDrawerOpen(true);
	};

	const openEdit = (tx: Transaction) => {
		setEditing(tx);
		setDrawerOpen(true);
	};

	const confirmDelete = () => {
		if (!deleteTarget) return;
		deleteTransaction(deleteTarget.id);
		toast.success("Transaction deleted", {
			description: "The record was removed from your history.",
		});
		setDeleteTarget(null);
	};

	const columns: DataTableColumn<Transaction>[] = [
		{
			key: "transactionDate",
			header: "Date",
			sortable: true,
			className: "w-32",
			cell: (tx) => (
				<span className="text-muted-foreground tabular-nums">{formatDate(tx.transactionDate)}</span>
			),
		},
		{
			key: "description",
			header: "Description",
			sortable: true,
			cell: (tx) => (
				<div className="min-w-0">
					<p className="truncate font-medium">{tx.description || "Transaction"}</p>
					<p className="truncate text-muted-foreground text-xs">
						{accountById(accounts, tx.accountId)?.name ?? "Deleted account"}
					</p>
				</div>
			),
		},
		{
			key: "category",
			header: "Category",
			className: "w-44",
			cell: (tx) => {
				const category = categoryById(categories, tx.categoryId);
				if (!category) return <span className="text-muted-foreground">—</span>;
				return (
					<Badge className="gap-1.5" variant="outline">
						<span
							className="size-2 rounded-full"
							style={{ backgroundColor: category.color }}
						/>
						{category.name}
					</Badge>
				);
			},
		},
		{
			key: "type",
			header: "Type",
			sortable: true,
			className: "w-24",
			cell: (tx) => (
				<Badge variant={tx.type === "income" ? "secondary" : "outline"}>
					{tx.type === "income" ? "Income" : "Expense"}
				</Badge>
			),
		},
		{
			key: "status",
			header: "Status",
			sortable: true,
			className: "w-28",
			cell: (tx) => <Badge variant={statusVariant[tx.status]}>{tx.status}</Badge>,
		},
		{
			key: "amount",
			header: "Amount",
			sortable: true,
			sortValue: (tx) => tx.amount,
			className: "w-36 text-right",
			cell: (tx) => {
				const isIncome = tx.type === "income";
				return (
					<div className="text-right">
						<p
							className={`font-medium tabular-nums ${
								isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
							}`}
						>
							{isIncome ? "+" : "−"}
							{formatMoney(tx.amount, tx.currency)}
						</p>
						{tx.currency !== displayCurrency && (
							<p className="text-muted-foreground text-xs tabular-nums">
								≈ {formatConverted(tx.amount, tx.currency, displayCurrency, rate)}
							</p>
						)}
					</div>
				);
			},
		},
		{
			key: "actions",
			header: "Actions",
			className: "w-24 text-right",
			cell: (tx) => (
				<div className="flex items-center justify-end gap-1">
					<Button
						aria-label="Edit transaction"
						className="text-muted-foreground hover:text-foreground"
						onClick={() => openEdit(tx)}
						size="icon-xs"
						variant="ghost"
					>
						<PencilIcon />
					</Button>
					<Button
						aria-label="Delete transaction"
						className="text-muted-foreground hover:text-destructive"
						onClick={() => setDeleteTarget(tx)}
						size="icon-xs"
						variant="ghost"
					>
						<Trash2Icon />
					</Button>
				</div>
			),
		},
	];

	return (
		<>
			<DataTable
				columns={columns}
				data={filtered}
				emptyMessage="No transactions found."
				searchPlaceholder="Search transactions…"
				searchValue={(tx) =>
					`${tx.description} ${tx.type} ${tx.status} ${
						categoryById(categories, tx.categoryId)?.name ?? ""
					} ${accountById(accounts, tx.accountId)?.name ?? ""}`
				}
				className="h-full"
				toolbar={
					<div className="flex items-center gap-2">
						<Select
							items={{ all: "All types", income: "Income", expense: "Expense" }}
							onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
							value={typeFilter}
						>
							<SelectTrigger className="w-28" size="sm">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All types</SelectItem>
								<SelectItem value="income">Income</SelectItem>
								<SelectItem value="expense">Expense</SelectItem>
							</SelectContent>
						</Select>
						<Select
							items={{
								all: "All status",
								completed: "Completed",
								pending: "Pending",
								cancelled: "Cancelled",
							}}
							onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
							value={statusFilter}
						>
							<SelectTrigger className="w-28" size="sm">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All status</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="cancelled">Cancelled</SelectItem>
							</SelectContent>
						</Select>
						<Button onClick={openCreate} size="sm">
							<PlusIcon data-icon="inline-start" />
							Add transaction
						</Button>
					</div>
				}
			/>
			<TransactionFormDrawer
				onOpenChange={setDrawerOpen}
				open={drawerOpen}
				transaction={editing}
			/>
			<DeleteConfirmDialog
				description="This removes the transaction from your history. Balances are not recalculated."
				onConfirm={confirmDelete}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				open={deleteTarget !== null}
				title="Delete transaction?"
			/>
		</>
	);
}
