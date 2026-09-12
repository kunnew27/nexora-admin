import { cn } from "@/lib/utils";
import { type ComponentProps, useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	formatChartAxisTick,
	formatChartTooltipDate,
	parseIsoCalendarDate,
} from "@/components/formater";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";
import { formatCompact, type Currency } from "@/lib/finance";

type PeriodDays = 7 | 30 | 60;

export type CashFlowRow = {
	date: string; // ISO calendar date
	income: number; // display currency
	expense: number; // display currency
};

const chartConfig = {
	income: {
		label: "Income",
		color: "var(--chart-2)",
	},
	expense: {
		label: "Expense",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

/**
 * Daily income vs spending for the selected window, styled after the
 * dashboard-3 conversation volume chart. `data` should cover at least twice
 * the longest window so the delta can compare against the preceding period.
 */
export function CashFlowChart({
	data,
	currency,
	className,
	...props
}: ComponentProps<typeof Card> & {
	data: CashFlowRow[];
	currency: Currency;
}) {
	const chartUid = useId().replace(/:/g, "");
	const idIncomeGradient = `cash-flow-income-grad-${chartUid}`;
	const idExpenseGradient = `cash-flow-expense-grad-${chartUid}`;

	const [periodDays, setPeriodDays] = useState<PeriodDays>(30);

	const referenceDate = data.at(-1)?.date;
	if (!referenceDate) {
		throw new Error("CashFlowChart: data must include at least one row");
	}
	const reference = parseIsoCalendarDate(referenceDate);

	const { chartRows, expenseDelta } = useMemo(() => {
		const start = new Date(reference);
		start.setDate(start.getDate() - (periodDays - 1));
		const prevStart = new Date(start);
		prevStart.setDate(prevStart.getDate() - periodDays);

		const rows: CashFlowRow[] = [];
		let currentExpense = 0;
		let previousExpense = 0;
		for (const row of data) {
			const date = parseIsoCalendarDate(row.date);
			if (date >= start) {
				rows.push(row);
				currentExpense += row.expense;
			} else if (date >= prevStart) {
				previousExpense += row.expense;
			}
		}
		return {
			chartRows: rows,
			expenseDelta:
				previousExpense > 0
					? ((previousExpense - currentExpense) / previousExpense) * 100
					: 0,
		};
	}, [data, periodDays, reference]);

	const xAxisMinTickGap = periodDays >= 60 ? 20 : 28;

	return (
		<Card className={cn(className)} {...props}>
			<CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0 space-y-2">
					<div className="flex flex-wrap items-center gap-2">
						<CardTitle>Cash flow</CardTitle>
						<Delta value={expenseDelta} variant="badge">
							<DeltaIcon variant="trend" />
							<DeltaValue />
						</Delta>
					</div>
					<CardDescription>
						Daily income and spending for the selected window.
					</CardDescription>
				</div>
				<Select
					onValueChange={(v) => {
						const n = Number(v);
						setPeriodDays(n as PeriodDays);
					}}
					value={String(periodDays)}
				>
					<SelectTrigger
						aria-label="Cash flow time range"
						className="w-full min-w-36 sm:w-fit"
						size="sm"
					>
						<SelectValue placeholder="Range" />
					</SelectTrigger>
					<SelectContent align="end">
						<SelectItem value="7">Last 7 days</SelectItem>
						<SelectItem value="30">Last 30 days</SelectItem>
						<SelectItem value="60">Last 60 days</SelectItem>
					</SelectContent>
				</Select>
			</CardHeader>
			<CardContent>
				<ChartContainer className="aspect-22/8 w-full" config={chartConfig}>
					<AreaChart
						accessibilityLayer
						data={chartRows}
						margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
					>
						<defs>
							<linearGradient id={idIncomeGradient} x1="0" x2="0" y1="0" y2="1">
								<stop
									offset="0%"
									stopColor="var(--color-income)"
									stopOpacity={0.35}
								/>
								<stop
									offset="100%"
									stopColor="var(--color-income)"
									stopOpacity={0}
								/>
							</linearGradient>
							<linearGradient
								id={idExpenseGradient}
								x1="0"
								x2="0"
								y1="0"
								y2="1"
							>
								<stop
									offset="0%"
									stopColor="var(--color-expense)"
									stopOpacity={0.2}
								/>
								<stop
									offset="100%"
									stopColor="var(--color-expense)"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid className="stroke-border" vertical={false} />
						<XAxis
							axisLine={false}
							dataKey="date"
							interval="preserveStartEnd"
							minTickGap={xAxisMinTickGap}
							tickFormatter={(value) =>
								formatChartAxisTick(String(value), periodDays)
							}
							tickLine={false}
							tickMargin={8}
						/>
						<YAxis
							axisLine={false}
							tickFormatter={(value) => formatCompact(Number(value), currency)}
							tick={{ className: "tabular-nums" }}
							tickLine={false}
							tickMargin={8}
							width={64}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									className="min-w-34"
									formatter={(value, name) => (
										<div className="flex w-full items-center justify-between gap-4">
											<span className="text-muted-foreground">{name}</span>
											<span className="font-medium tabular-nums">
												{formatCompact(Number(value), currency)}
											</span>
										</div>
									)}
									indicator="line"
									labelFormatter={(_, payload) => {
										const row = payload?.[0]?.payload as
											| CashFlowRow
											| undefined;
										if (!row?.date) {
											return "";
										}
										return formatChartTooltipDate(row.date, "long");
									}}
								/>
							}
							cursor={false}
						/>
						<Area
							dataKey="expense"
							dot={false}
							fill={`url(#${idExpenseGradient})`}
							stroke="var(--color-expense)"
							strokeWidth={2}
							type="monotone"
						/>
						<Area
							dataKey="income"
							dot={false}
							fill={`url(#${idIncomeGradient})`}
							stroke="var(--color-income)"
							strokeWidth={2}
							type="monotone"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
