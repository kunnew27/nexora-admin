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
import { fieldErrors, goalFormSchema } from "@/lib/finance-validators";
import { CURRENCIES, type Currency, type Goal, type GoalStatus } from "@/lib/finance";
import { useFinanceStore } from "@/stores/finance-store";

type Field = "name" | "targetAmount" | "currentAmount" | "currency" | "status";

const GOAL_STATUSES: GoalStatus[] = ["active", "completed", "cancelled"];

export function GoalFormDrawer({
	onOpenChange,
	open,
	goal,
}: {
	onOpenChange: (open: boolean) => void;
	open: boolean;
	goal?: Goal | null;
}) {
	const addGoal = useFinanceStore((state) => state.addGoal);
	const updateGoal = useFinanceStore((state) => state.updateGoal);

	const isEdit = Boolean(goal);

	const [name, setName] = useState("");
	const [targetAmount, setTargetAmount] = useState("");
	const [currentAmount, setCurrentAmount] = useState("");
	const [currency, setCurrency] = useState<Currency>("USD");
	const [deadline, setDeadline] = useState("");
	const [status, setStatus] = useState<GoalStatus>("active");
	const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

	useEffect(() => {
		if (!open) return;
		setErrors({});
		if (goal) {
			setName(goal.name);
			setTargetAmount(String(goal.targetAmount));
			setCurrentAmount(String(goal.currentAmount));
			setCurrency(goal.currency);
			setDeadline(goal.deadline ?? "");
			setStatus(goal.status);
		} else {
			setName("");
			setTargetAmount("");
			setCurrentAmount("0");
			setCurrency("USD");
			setDeadline("");
			setStatus("active");
		}
	}, [open, goal]);

	const handleSave = (event: FormEvent) => {
		event.preventDefault();
		const parsed = goalFormSchema.safeParse({
			name,
			targetAmount,
			currentAmount,
			currency,
			deadline: deadline || undefined,
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

		if (goal) {
			updateGoal(goal.id, { ...values, deadline: values.deadline ?? null });
			toast.success("Changes saved", { description: `${values.name} was updated.` });
		} else {
			addGoal({ ...values, deadline: values.deadline ?? null });
			toast.success("Goal created", {
				description: `Saving toward ${values.name}.`,
			});
		}
		onOpenChange(false);
	};

	return (
		<FinanceSheet
			description="Set a savings target and track how much you've put aside."
			formId="goal-form"
			onOpenChange={onOpenChange}
			onSubmit={handleSave}
			open={open}
			submitLabel={isEdit ? "Save changes" : "Create goal"}
			title={isEdit ? "Edit goal" : "New goal"}
		>
			<FormField error={errors.name} htmlFor="goal-form-name" label="Name">
				<Input
					aria-invalid={Boolean(errors.name)}
					id="goal-form-name"
					onChange={(event) => setName(event.target.value)}
					placeholder="e.g. Emergency fund"
					value={name}
				/>
			</FormField>

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField error={errors.targetAmount} htmlFor="goal-form-target" label="Target amount">
					<Input
						aria-invalid={Boolean(errors.targetAmount)}
						id="goal-form-target"
						min="0"
						onChange={(event) => setTargetAmount(event.target.value)}
						placeholder="0.00"
						step="0.01"
						type="number"
						value={targetAmount}
					/>
				</FormField>
				<FormField error={errors.currentAmount} htmlFor="goal-form-current" label="Saved so far">
					<Input
						aria-invalid={Boolean(errors.currentAmount)}
						id="goal-form-current"
						min="0"
						onChange={(event) => setCurrentAmount(event.target.value)}
						placeholder="0.00"
						step="0.01"
						type="number"
						value={currentAmount}
					/>
				</FormField>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<FormField error={errors.currency} htmlFor="goal-form-currency" label="Currency">
					<Select onValueChange={(v) => setCurrency(v as Currency)} value={currency}>
						<SelectTrigger className="w-full" id="goal-form-currency">
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
				<FormField error={errors.status} htmlFor="goal-form-status" label="Status">
					<Select
						items={{
							active: "Active",
							completed: "Completed",
							cancelled: "Cancelled",
						}}
						onValueChange={(v) => setStatus(v as GoalStatus)}
						value={status}
					>
						<SelectTrigger className="w-full" id="goal-form-status">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{GOAL_STATUSES.map((s) => (
								<SelectItem key={s} value={s}>
									{s.charAt(0).toUpperCase() + s.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</FormField>
			</div>

			<FormField error={undefined} htmlFor="goal-form-deadline" label="Deadline (optional)">
				<DatePickerField
					id="goal-form-deadline"
					onChange={setDeadline}
					placeholder="No deadline"
					value={deadline}
				/>
			</FormField>
		</FinanceSheet>
	);
}
