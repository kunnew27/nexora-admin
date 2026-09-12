import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { DatePickerField } from "@/components/finance/date-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

/**
 * Shared shell for report pages: a filter card (date from/to + submit) above
 * whatever the report renders. Dates use the shared popover picker; the
 * report only re-runs when the form is submitted.
 */
export function ReportLayout({
	children,
	description,
	from,
	onApply,
	title,
	to,
}: {
	children: ReactNode;
	description: string;
	from: string;
	onApply: (range: { from: string; to: string }) => void;
	title: string;
	to: string;
}) {
	const [dates, setDates] = useState({ from, to });

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onApply(dates);
	};

	return (
		<div className="flex flex-col gap-6 print:block print:gap-0">
			<div className="print:hidden">
				<PageHeader description={description} title={title} />
			</div>
			<Card className="print:hidden">
				<CardContent>
					<form
						className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]"
						noValidate
						onSubmit={handleSubmit}
					>
						<div className="space-y-2 **:data-[slot=button]:w-full">
							<Label htmlFor="report-from">From date</Label>
							<DatePickerField
								id="report-from"
								onChange={(from) => setDates((current) => ({ ...current, from }))}
								placeholder="Pick start date"
								value={dates.from}
							/>
						</div>
						<div className="space-y-2 **:data-[slot=button]:w-full">
							<Label htmlFor="report-to">To date</Label>
							<DatePickerField
								id="report-to"
								onChange={(to) => setDates((current) => ({ ...current, to }))}
								placeholder="Pick end date"
								value={dates.to}
							/>
						</div>
						<Button type="submit">Submit</Button>
					</form>
				</CardContent>
			</Card>
			{children}
		</div>
	);
}
