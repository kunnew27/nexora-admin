import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { DateRangePickerField } from "@/components/finance/date-field";
import { FinanceSheet, FormField } from "@/components/finance/finance-sheet";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { budgetFormSchema, fieldErrors } from "@/lib/finance-validators";
import {
	BUDGET_PERIODS,
	CURRENCIES,
	type Budget,
	type BudgetPeriod,
	type Currency,
	periodRange,
} from "@/lib/finance";
import { useFinanceStore } from "@/stores/finance-store";

type Field = "categoryId" | "amount" | "currency" | "period" | "startDate" | "endDate";

export function BudgetFormDrawer({
	onOpenChange,
	open,
	budget,
}: {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	budget?: Budget | null;
}) {
	const categories = useFinanceStore((state) => state.categories);
	const addBudget = useFinanceStore((state) => state.addBudget);
	const updateBudget = useFinanceStore((state) => state.updateBudget);

	const isEdit = Boolean(budget);
	const expenseCategories = categories.filter((c) => c.type === "expense");

	const [categoryId, setCategoryId] = useState("");
	const [amount, setAmount] = useState("");
	const [currency, setCurrency] = useState<Currency>("USD");
	const [period, setPeriod] = useState<BudgetPeriod>("monthly");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

	useEffect(() => {
		if (!open) return;
		setErrors({});
		if (budget) {
			setCategoryId(budget.categoryId);
			setAmount(String(budget.amount));
			setCurrency(budget.currency);
			setPeriod(budget.period);
			setStartDate(budget.startDate);
			setEndDate(budget.endDate);
		} else {
			const firstExpenseCategory = expenseCategories[0];
			setCategoryId(firstExpenseCategory?.id ?? "");
			setAmount("");
			setCurrency("USD");
			setPeriod("monthly");
			const window = periodRange("monthly", new Date().toISOString().slice(0, 10));
			setStartDate(window.start);
			setEndDate(window.end);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, budget]);

	const handlePeriodChange = (next: BudgetPeriod) => {
		setPeriod(next);
		// Snap the window to the selected period unless editing an existing budget.
		if (!budget) {
			const window = periodRange(next, new Date().toISOString().slice(0, 10));
			setStartDate(window.start);
			setEndDate(window.end);
		}
	};

	const handleSave = (event: FormEvent) => {
		event.preventDefault();
		const parsed = budgetFormSchema.safeParse({
			categoryId,
			amount,
			currency,
			period,
			startDate,
			endDate,
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

		if (budget) {
			updateBudget(budget.id, values);
			toast.success("Changes saved", { description: "The budget was updated." });
		} else {
			addBudget(values);
			toast.success("Budget created", {
				description: "Spending is now tracked against this budget.",
			});
		}
		onOpenChange(false);
	};

	return (
		<FinanceSheet
			description="Cap spending per category for a weekly, monthly, or yearly window."
			formId="budget-form"
			onOpenChange={onOpenChange}
			onSubmit={handleSave}
			open={open}
			submitLabel={isEdit ? "Save changes" : "Create budget"}
			title={isEdit ? "Edit budget" : "New budget"}
		>
			<FormField error={errors.categoryId} htmlFor="budget-form-category" label="Expense category">
				<Select
					items={Object.fromEntries(expenseCategories.map((c) => [c.id, c.name]))}
					onValueChange={(v) => setCategoryId(v ?? "")}
					value={categoryId}
				>
					<SelectTrigger className="w-full" id="budget-form-category">
						<SelectValue placeholder="Choose a category" />
					</SelectTrigger>
					<SelectContent>
						{expenseCategories.map((c) => (
							<SelectItem key={c.id} value={c.id}>
								{c.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField error={errors.amount} htmlFor="budget-form-amount" label="Amount">
					<Input
						aria-invalid={Boolean(errors.amount)}
						id="budget-form-amount"
						min="0"
						onChange={(event) => setAmount(event.target.value)}
						placeholder="0.00"
						step="0.01"
						type="number"
						value={amount}
					/>
				</FormField>
				<FormField error={errors.currency} htmlFor="budget-form-currency" label="Currency">
					<Select onValueChange={(v) => setCurrency(v as Currency)} value={currency}>
						<SelectTrigger className="w-full" id="budget-form-currency">
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

			<FormField error={errors.period} htmlFor="budget-form-period" label="Period">
				<Select onValueChange={(v) => handlePeriodChange(v as BudgetPeriod)} value={period}>
					<SelectTrigger className="w-full" id="budget-form-period">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{BUDGET_PERIODS.map((p) => (
							<SelectItem key={p} value={p}>
								{p.charAt(0).toUpperCase() + p.slice(1)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>

			<FormField
				error={errors.startDate ?? errors.endDate}
				htmlFor="budget-form-range"
				label="Window"
			>
				<DateRangePickerField
					endValue={endDate}
					id="budget-form-range"
					onRangeChange={(start, end) => {
						setStartDate(start);
						setEndDate(end);
					}}
					startValue={startDate}
				/>
			</FormField>
		</FinanceSheet>
	);
}
