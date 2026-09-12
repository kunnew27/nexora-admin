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
import { debtFormSchema, fieldErrors } from "@/lib/finance-validators";
import { CURRENCIES, type Currency, type Debt, type DebtStatus, type DebtType } from "@/lib/finance";
import { useFinanceStore } from "@/stores/finance-store";

type Field = "name" | "type" | "originalAmount" | "remainingAmount" | "currency" | "interestRate" | "status";

const DEBT_STATUSES: DebtStatus[] = ["active", "paid", "overdue"];

export function DebtFormDrawer({
	onOpenChange,
	open,
	debt,
}: {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	debt?: Debt | null;
}) {
	const addDebt = useFinanceStore((state) => state.addDebt);
	const updateDebt = useFinanceStore((state) => state.updateDebt);

	const isEdit = Boolean(debt);

	const [name, setName] = useState("");
	const [type, setType] = useState<DebtType>("borrowed");
	const [originalAmount, setOriginalAmount] = useState("");
	const [remainingAmount, setRemainingAmount] = useState("");
	const [currency, setCurrency] = useState<Currency>("USD");
	const [interestRate, setInterestRate] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [status, setStatus] = useState<DebtStatus>("active");
	const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

	useEffect(() => {
		if (!open) return;
		setErrors({});
		if (debt) {
			setName(debt.name);
			setType(debt.type);
			setOriginalAmount(String(debt.originalAmount));
			setRemainingAmount(String(debt.remainingAmount));
			setCurrency(debt.currency);
			setInterestRate(debt.interestRate != null ? String(debt.interestRate) : "");
			setDueDate(debt.dueDate ?? "");
			setStatus(debt.status);
		} else {
			setName("");
			setType("borrowed");
			setOriginalAmount("");
			setRemainingAmount("");
			setCurrency("USD");
			setInterestRate("");
			setDueDate("");
			setStatus("active");
		}
	}, [open, debt]);

	const handleSave = (event: FormEvent) => {
		event.preventDefault();
		const parsed = debtFormSchema.safeParse({
			name,
			type,
			originalAmount,
			remainingAmount,
			currency,
			interestRate: interestRate === "" ? undefined : interestRate,
			dueDate: dueDate || undefined,
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

		if (debt) {
			updateDebt(debt.id, {
				...values,
				interestRate: values.interestRate ?? null,
				dueDate: values.dueDate ?? null,
			});
			toast.success("Changes saved", { description: `${values.name} was updated.` });
		} else {
			addDebt({
				...values,
				interestRate: values.interestRate ?? null,
				dueDate: values.dueDate ?? null,
			});
			toast.success("Debt recorded", {
				description: values.type === "borrowed" ? "Money you owe." : "Money owed to you.",
			});
		}
		onOpenChange(false);
	};

	return (
		<FinanceSheet
			description="Track money you borrowed or lent out."
			formId="debt-form"
			onOpenChange={onOpenChange}
			onSubmit={handleSave}
			open={open}
			submitLabel={isEdit ? "Save changes" : "Record debt"}
			title={isEdit ? "Edit debt" : "New debt"}
		>
			<FormField error={errors.name} htmlFor="debt-form-name" label="Name">
				<Input
					aria-invalid={Boolean(errors.name)}
					id="debt-form-name"
					onChange={(event) => setName(event.target.value)}
					placeholder="e.g. Car loan"
					value={name}
				/>
			</FormField>

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField error={errors.type} htmlFor="debt-form-type" label="Type">
					<Select
						items={{ borrowed: "Borrowed (you owe)", lent: "Lent (owed to you)" }}
						onValueChange={(v) => setType(v as DebtType)}
						value={type}
					>
						<SelectTrigger className="w-full" id="debt-form-type">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="borrowed">Borrowed (you owe)</SelectItem>
							<SelectItem value="lent">Lent (owed to you)</SelectItem>
						</SelectContent>
					</Select>
				</FormField>
				<FormField error={errors.currency} htmlFor="debt-form-currency" label="Currency">
					<Select onValueChange={(v) => setCurrency(v as Currency)} value={currency}>
						<SelectTrigger className="w-full" id="debt-form-currency">
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

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField error={errors.originalAmount} htmlFor="debt-form-original" label="Original amount">
					<Input
						aria-invalid={Boolean(errors.originalAmount)}
						id="debt-form-original"
						min="0"
						onChange={(event) => setOriginalAmount(event.target.value)}
						placeholder="0.00"
						step="0.01"
						type="number"
						value={originalAmount}
					/>
				</FormField>
				<FormField error={errors.remainingAmount} htmlFor="debt-form-remaining" label="Remaining amount">
					<Input
						aria-invalid={Boolean(errors.remainingAmount)}
						id="debt-form-remaining"
						min="0"
						onChange={(event) => setRemainingAmount(event.target.value)}
						placeholder="0.00"
						step="0.01"
						type="number"
						value={remainingAmount}
					/>
				</FormField>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField error={errors.interestRate} htmlFor="debt-form-interest" label="Interest rate % (optional)">
					<Input
						aria-invalid={Boolean(errors.interestRate)}
						id="debt-form-interest"
						min="0"
						onChange={(event) => setInterestRate(event.target.value)}
						placeholder="e.g. 6.5"
						step="0.1"
						type="number"
						value={interestRate}
					/>
				</FormField>
				<FormField error={undefined} htmlFor="debt-form-due" label="Due date (optional)">
					<DatePickerField
						id="debt-form-due"
						onChange={setDueDate}
						placeholder="No due date"
						value={dueDate}
					/>
				</FormField>
			</div>

			<FormField error={errors.status} htmlFor="debt-form-status" label="Status">
				<Select
					items={{
						active: "Active",
						paid: "Paid",
						overdue: "Overdue",
					}}
					onValueChange={(v) => setStatus(v as DebtStatus)}
					value={status}
				>
					<SelectTrigger className="w-full" id="debt-form-status">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{DEBT_STATUSES.map((s) => (
							<SelectItem key={s} value={s}>
								{s.charAt(0).toUpperCase() + s.slice(1)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
		</FinanceSheet>
	);
}
