import { useState } from "react";
import { toast } from "sonner";
import { CategoryFormDialog } from "@/components/finance/category-form-dialog";
import { DeleteConfirmDialog } from "@/components/finance/delete-confirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import type { DataTableColumn } from "@/components/data-table";
import type { Category } from "@/lib/finance";
import { formatDate } from "@/lib/finance";
import { useFinanceStore } from "@/stores/finance-store";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

export default function CategoriesPage() {
	const categories = useFinanceStore((state) => state.categories);
	const deleteCategory = useFinanceStore((state) => state.deleteCategory);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<Category | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

	const openCreate = () => {
		setEditing(null);
		setDialogOpen(true);
	};

	const openEdit = (category: Category) => {
		setEditing(category);
		setDialogOpen(true);
	};

	const confirmDelete = () => {
		if (!deleteTarget) return;
		deleteCategory(deleteTarget.id);
		toast.success("Category deleted", {
			description: "Transactions keep their history but show as uncategorized.",
		});
		setDeleteTarget(null);
	};

	const columns: DataTableColumn<Category>[] = [
		{
			key: "name",
			header: "Name",
			sortable: true,
			cell: (category) => (
				<span className="flex items-center gap-2.5">
					<span
						className="size-3 shrink-0 rounded-full"
						style={{ backgroundColor: category.color }}
					/>
					<span className="font-medium">{category.name}</span>
				</span>
			),
		},
		{
			key: "type",
			header: "Type",
			sortable: true,
			className: "w-32",
			cell: (category) => (
				<Badge variant={category.type === "income" ? "secondary" : "outline"}>
					{category.type === "income" ? "Income" : "Expense"}
				</Badge>
			),
		},
		{
			key: "createdAt",
			header: "Created",
			sortable: true,
			className: "w-40",
			cell: (category) => (
				<span className="text-muted-foreground tabular-nums">{formatDate(category.createdAt)}</span>
			),
		},
		{
			key: "actions",
			header: "Actions",
			className: "w-24 text-right",
			cell: (category) => (
				<div className="flex items-center justify-end gap-1">
					<Button
						aria-label={`Edit ${category.name}`}
						className="text-muted-foreground hover:text-foreground"
						onClick={() => openEdit(category)}
						size="icon-xs"
						variant="ghost"
					>
						<PencilIcon />
					</Button>
					<Button
						aria-label={`Delete ${category.name}`}
						className="text-muted-foreground hover:text-destructive"
						onClick={() => setDeleteTarget(category)}
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
				data={categories}
				emptyMessage="No categories yet."
				searchPlaceholder="Search categories…"
				searchValue={(category) => `${category.name} ${category.type}`}
				className="h-full"
				toolbar={
					<Button onClick={openCreate} size="sm">
						<PlusIcon data-icon="inline-start" />
						Add category
					</Button>
				}
			/>
			<CategoryFormDialog category={editing} onOpenChange={setDialogOpen} open={dialogOpen} />
			<DeleteConfirmDialog
				description="This removes the category. Existing transactions are kept and become uncategorized."
				onConfirm={confirmDelete}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				open={deleteTarget !== null}
				title={`Delete ${deleteTarget?.name}?`}
			/>
		</>
	);
}
