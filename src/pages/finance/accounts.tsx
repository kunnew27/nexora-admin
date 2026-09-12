import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { AccountFormDrawer } from "@/components/finance/account-form-drawer";
import { DeleteConfirmDialog } from "@/components/finance/delete-confirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatConverted, formatMoney, type Account } from "@/lib/finance";
import { rateToKhr, useFinanceStore } from "@/stores/finance-store";
import { useFinancePrefsStore } from "@/stores/finance-prefs-store";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

export default function AccountsPage() {
	const accounts = useFinanceStore((state) => state.accounts);
	const deleteAccount = useFinanceStore((state) => state.deleteAccount);
	const displayCurrency = useFinancePrefsStore((state) => state.displayCurrency);
	const rate = rateToKhr();

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [editing, setEditing] = useState<Account | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

	const openCreate = () => {
		setEditing(null);
		setDrawerOpen(true);
	};

	const openEdit = (account: Account) => {
		setEditing(account);
		setDrawerOpen(true);
	};

	const confirmDelete = () => {
		if (!deleteTarget) return;
		deleteAccount(deleteTarget.id);
		toast.success("Account deleted", {
			description: `${deleteTarget.name} was removed.`,
		});
		setDeleteTarget(null);
	};

	return (
		<>
			<div className="mb-4 flex flex-wrap items-start justify-between gap-4">
				<PageHeader
					description="Cash, bank, savings, credit, and mobile wallets."
					title="Accounts"
				/>
				<Button onClick={openCreate} size="sm">
					<PlusIcon data-icon="inline-start" />
					Add account
				</Button>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{accounts.map((account) => (
					<Card key={account.id}>
						<CardHeader className="flex flex-row items-start justify-between">
							<div className="min-w-0 space-y-1">
								<CardTitle className="truncate text-base">{account.name}</CardTitle>
								<CardDescription className="flex items-center gap-2">
									<Badge variant="outline">{account.type}</Badge>
									<Badge variant="outline">{account.currency}</Badge>
									{!account.isActive && <Badge variant="destructive">Inactive</Badge>}
								</CardDescription>
							</div>
							<div className="flex items-center gap-1">
								<Button
									aria-label={`Edit ${account.name}`}
									className="text-muted-foreground hover:text-foreground"
									onClick={() => openEdit(account)}
									size="icon-xs"
									variant="ghost"
								>
									<PencilIcon />
								</Button>
								<Button
									aria-label={`Delete ${account.name}`}
									className="text-muted-foreground hover:text-destructive"
									onClick={() => setDeleteTarget(account)}
									size="icon-xs"
									variant="ghost"
								>
									<Trash2Icon />
								</Button>
							</div>
						</CardHeader>
						<CardDescription className="px-6 pb-1 text-sm">
							<span className="font-medium text-xl tabular-nums text-foreground">
								{formatMoney(account.currentBalance, account.currency)}
							</span>
							{account.currency !== displayCurrency && (
								<span className="block text-muted-foreground text-xs tabular-nums">
									≈ {formatConverted(account.currentBalance, account.currency, displayCurrency, rate)}{" "}
									{displayCurrency}
								</span>
							)}
							<span className="mt-2 block text-muted-foreground text-xs tabular-nums">
								Opening: {formatMoney(account.openingBalance, account.currency)}
							</span>
						</CardDescription>
					</Card>
				))}
			</div>

			<AccountFormDrawer account={editing} onOpenChange={setDrawerOpen} open={drawerOpen} />
			<DeleteConfirmDialog
				description="This removes the account. Transactions recorded against it stay in your history."
				onConfirm={confirmDelete}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				open={deleteTarget !== null}
				title={`Delete ${deleteTarget?.name}?`}
			/>
		</>
	);
}
