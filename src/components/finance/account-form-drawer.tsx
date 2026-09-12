import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { FieldError, FinanceSheet, FormField } from "@/components/finance/finance-sheet";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { accountFormSchema, fieldErrors } from "@/lib/finance-validators";
import {
	ACCOUNT_TYPES,
	CURRENCIES,
	type Account,
	type AccountType,
	type Currency,
} from "@/lib/finance";
import { useFinanceStore } from "@/stores/finance-store";

type Field = "name" | "type" | "currency" | "openingBalance" | "isActive";

export function AccountFormDrawer({
	onOpenChange,
	open,
	account,
}: {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	account?: Account | null;
}) {
	const addAccount = useFinanceStore((state) => state.addAccount);
	const updateAccount = useFinanceStore((state) => state.updateAccount);

	const isEdit = Boolean(account);

	const [name, setName] = useState("");
	const [type, setType] = useState<AccountType>("bank");
	const [currency, setCurrency] = useState<Currency>("USD");
	const [openingBalance, setOpeningBalance] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

	useEffect(() => {
		if (!open) return;
		setErrors({});
		if (account) {
			setName(account.name);
			setType(account.type);
			setCurrency(account.currency);
			setOpeningBalance(String(account.openingBalance));
			setIsActive(account.isActive);
		} else {
			setName("");
			setType("bank");
			setCurrency("USD");
			setOpeningBalance("");
			setIsActive(true);
		}
	}, [open, account]);

	const handleSave = (event: FormEvent) => {
		event.preventDefault();
		const parsed = accountFormSchema.safeParse({
			name,
			type,
			currency,
			openingBalance,
			isActive,
		});
		if (!parsed.success) {
			const next = fieldErrors<Field>(parsed.error);
			setErrors(next);
			toast.error("Please fix the highlighted fields.", {
				description: Object.values(next)[0],
			});
			return;
		}
		setErrors({});
		const values = parsed.data;

		if (account) {
			updateAccount(account.id, values);
			toast.success("Changes saved", {
				description: `${values.name} was updated.`,
			});
		} else {
			addAccount({
				...values,
				currentBalance: values.openingBalance,
			});
			toast.success("Account created", {
				description: `${values.name} is ready to track.`,
			});
		}
		onOpenChange(false);
	};

	return (
		<FinanceSheet
			description="Cash, bank, savings, credit, or mobile wallet."
			formId="account-form"
			onOpenChange={onOpenChange}
			onSubmit={handleSave}
			open={open}
			submitLabel={isEdit ? "Save changes" : "Create account"}
			title={isEdit ? "Edit account" : "New account"}
		>
			<FormField error={errors.name} htmlFor="account-form-name" label="Name">
				<Input
					aria-invalid={Boolean(errors.name)}
					id="account-form-name"
					onChange={(event) => setName(event.target.value)}
					placeholder="e.g. ABA Bank"
					value={name}
				/>
			</FormField>

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField error={errors.type} htmlFor="account-form-type" label="Type">
					<Select
						items={{
							cash: "Cash",
							bank: "Bank",
							savings: "Savings",
							credit: "Credit",
							wallet: "Wallet",
						}}
						onValueChange={(v) => setType(v as AccountType)}
						value={type}
					>
						<SelectTrigger className="w-full" id="account-form-type">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{ACCOUNT_TYPES.map((t) => (
								<SelectItem key={t} value={t}>
									{t.charAt(0).toUpperCase() + t.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormField>
				<FormField error={errors.currency} htmlFor="account-form-currency" label="Currency">
					<Select onValueChange={(v) => setCurrency(v as Currency)} value={currency}>
						<SelectTrigger className="w-full" id="account-form-currency">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{CURRENCIES.map((c) => (
								<SelectItem key={c} value={c}>
									{c}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormField>
			</div>

			<FormField error={errors.openingBalance} htmlFor="account-form-opening" label="Opening balance">
				<Input
					aria-invalid={Boolean(errors.openingBalance)}
					id="account-form-opening"
					onChange={(event) => setOpeningBalance(event.target.value)}
					placeholder="0.00"
					step="0.01"
					type="number"
					value={openingBalance}
				/>
			</FormField>

			<div className="flex items-center justify-between rounded-lg border p-3">
				<div className="space-y-0.5">
					<Label htmlFor="account-form-active">Active</Label>
					<p className="text-muted-foreground text-xs">
						Inactive accounts are hidden from totals.
					</p>
				</div>
				<Switch
					checked={isActive}
					id="account-form-active"
					onCheckedChange={(checked) => setIsActive(Boolean(checked))}
				/>
			</div>
			<FieldError message={errors.isActive} />
		</FinanceSheet>
	);
}
