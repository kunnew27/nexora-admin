import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { DatePickerField } from "@/components/finance/date-field";
import { FinanceSheet, FormField } from "@/components/finance/finance-sheet";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fieldErrors, transactionFormSchema } from "@/lib/finance-validators";
import {
	TRANSACTION_STATUSES,
	type Transaction,
	type TransactionStatus,
	type TransactionType,
} from "@/lib/finance";
import { useFinanceStore } from "@/stores/finance-store";
import { useFinancePrefsStore } from "@/stores/finance-prefs-store";
import { rateToKhr } from "@/stores/finance-store";

type Field = "type" | "accountId" | "categoryId" | "amount" | "transactionDate" | "description" | "status";

export function TransactionFormDrawer({
	onOpenChange,
	open,
	transaction,
}: {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	transaction?: Transaction | null;
}) {
	const accounts = useFinanceStore((state) => state.accounts);
	const categories = useFinanceStore((state) => state.categories);
	const addTransaction = useFinanceStore((state) => state.addTransaction);
	const updateTransaction = useFinanceStore((state) => state.updateTransaction);
	const baseCurrency = useFinancePrefsStore((state) => state.baseCurrency);

	const isEdit = Boolean(transaction);

	const [type, setType] = useState<TransactionType>("expense");
	const [accountId, setAccountId] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [amount, setAmount] = useState("");
	const [transactionDate, setTransactionDate] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState<TransactionStatus>("completed");
	const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

	useEffect(() => {
		if (!open) return;
		setErrors({});
		if (transaction) {
			setType(transaction.type);
			setAccountId(transaction.accountId);
			setCategoryId(transaction.categoryId ?? "");
			setAmount(String(transaction.amount));
			setTransactionDate(transaction.transactionDate);
			setDescription(transaction.description);
			setStatus(transaction.status);
		} else {
			const firstAccount = accounts.find((a) => a.isActive) ?? accounts[0];
			setType("expense");
			setAccountId(firstAccount?.id ?? "");
			setCategoryId("");
			setAmount("");
			setTransactionDate(new Date().toISOString().slice(0, 10));
			setDescription("");
			setStatus("completed");
		}
	}, [open, transaction, accounts]);

	const selectedAccount = accounts.find((a) => a.id === accountId);
	const currency = selectedAccount?.currency ?? "USD";
	const typeCategories = categories.filter((c) => c.type === type);

	const handleSave = (event: FormEvent) => {
		event.preventDefault();
		const parsed = transactionFormSchema.safeParse({
			type,
			accountId,
			categoryId,
			amount,
			currency,
			transactionDate,
			description: description || undefined,
			status,
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
		// Snapshot the rate at record time (rate of 1 when already in base currency).
		const exchangeRateToBase =
			values.currency === baseCurrency ? 1 : rateToKhr();

		if (transaction) {
			updateTransaction(transaction.id, {
				...values,
				description: values.description ?? "",
				exchangeRateToBase,
				amountInBaseCurrency: values.amount * exchangeRateToBase,
				baseCurrency,
			});
			toast.success("Changes saved", {
				description: "The transaction was updated.",
			});
		} else {
			addTransaction({
				...values,
				description: values.description ?? "",
				exchangeRateToBase,
				amountInBaseCurrency: values.amount * exchangeRateToBase,
				baseCurrency,
			});
			toast.success("Transaction created", {
				description: `${values.type === "income" ? "Income" : "Expense"} of ${values.amount.toLocaleString()} ${values.currency} recorded.`,
			});
		}
		onOpenChange(false);
	};

	return (
		<FinanceSheet
			description="Record an income or expense against one of your accounts."
			formId="transaction-form"
			onOpenChange={onOpenChange}
			onSubmit={handleSave}
			open={open}
			submitLabel={isEdit ? "Save changes" : "Create transaction"}
			title={isEdit ? "Edit transaction" : "New transaction"}
		>
			<div className="grid gap-4 sm:grid-cols-2">
			<FormField error={errors.type} htmlFor="transaction-form-type" label="Type">
				<Select
					items={{ income: "Income", expense: "Expense" }}
					onValueChange={(v) => { setType(v as TransactionType); setCategoryId(""); }}
					value={type}
				>
						<SelectTrigger className="w-full" id="transaction-form-type">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="income">Income</SelectItem>
							<SelectItem value="expense">Expense</SelectItem>
						</SelectContent>
					</Select>
				</FormField>
				<FormField error={errors.status} htmlFor="transaction-form-status" label="Status">
					<Select
					items={{
						pending: "Pending",
						completed: "Completed",
						cancelled: "Cancelled",
					}}
					onValueChange={(v) => setStatus(v as TransactionStatus)}
					value={status}
				>
						<SelectTrigger className="w-full" id="transaction-form-status">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{TRANSACTION_STATUSES.map((s) => (
								<SelectItem key={s} value={s}>
									{s.charAt(0).toUpperCase() + s.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormField>
			</div>

			<FormField error={errors.accountId} htmlFor="transaction-form-account" label="Account">
				<Select
					items={Object.fromEntries(accounts.map((a) => [a.id, `${a.name} (${a.currency})`]))}
					onValueChange={(v) => setAccountId(v ?? "")}
					value={accountId}
				>
					<SelectTrigger className="w-full" id="transaction-form-account">
						<SelectValue placeholder="Choose an account" />
					</SelectTrigger>
					<SelectContent>
						{accounts.map((a) => (
							<SelectItem key={a.id} value={a.id}>
								{a.name} ({a.currency})
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<p className="text-muted-foreground text-xs">
					Uses the account's native currency: {currency}.
				</p>
			</FormField>

			<FormField error={errors.categoryId} htmlFor="transaction-form-category" label="Category">
				<Select
					items={Object.fromEntries(typeCategories.map((c) => [c.id, c.name]))}
					onValueChange={(v) => setCategoryId(v ?? "")}
					value={categoryId}
				>
					<SelectTrigger className="w-full" id="transaction-form-category">
						<SelectValue placeholder="Choose a category" />
					</SelectTrigger>
					<SelectContent>
						{typeCategories.map((c) => (
							<SelectItem key={c.id} value={c.id}>
								{c.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField error={errors.amount} htmlFor="transaction-form-amount" label={`Amount (${currency})`}>
					<Input
						aria-invalid={Boolean(errors.amount)}
						id="transaction-form-amount"
						min="0"
						onChange={(event) => setAmount(event.target.value)}
						placeholder="0.00"
						step="0.01"
						type="number"
						value={amount}
					/>
				</FormField>
				<FormField error={errors.transactionDate} htmlFor="transaction-form-date" label="Date">
					<DatePickerField
						ariaInvalid={Boolean(errors.transactionDate)}
						error={errors.transactionDate}
						id="transaction-form-date"
						onChange={setTransactionDate}
						placeholder="Pick a date"
						value={transactionDate}
					/>
				</FormField>
			</div>

			<FormField error={errors.description} htmlFor="transaction-form-description" label="Description">
				<Textarea
					id="transaction-form-description"
					onChange={(event) => setDescription(event.target.value)}
					placeholder="What was this for?"
					rows={2}
					value={description}
				/>
			</FormField>
		</FinanceSheet>
	);
}
