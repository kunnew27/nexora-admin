import { PageHeader } from "@/components/page-header";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
	ArrowLeftRightIcon,
	ArrowRightIcon,
	ArrowUpRightIcon,
	ChevronRightIcon,
	HandCoinsIcon,
	LandmarkIcon,
	PiggyBankIcon,
	TargetIcon,
	TrendingDownIcon,
	TrendingUpIcon,
	WalletIcon,
} from "lucide-react";

type ReportRow = {
	label: string;
	icon: ReactNode;
	/** Tint classes for the icon tile. */
	tint: string;
	to: string;
};

type ReportSection = {
	label: string;
	icon: ReactNode;
	tint: string;
	rows: ReportRow[];
};

const sections: ReportSection[] = [
	{
		label: "Money in & out",
		icon: <TrendingUpIcon />,
		tint: "bg-emerald-500/10 text-emerald-500",
		rows: [
			{
				label: "Income report",
				icon: <ArrowUpRightIcon />,
				tint: "bg-emerald-500/10 text-emerald-500",
				to: "/reports/income",
			},
			{
				label: "Expense report",
				icon: <TrendingDownIcon />,
				tint: "bg-rose-500/10 text-rose-500",
				to: "/transactions",
			},
			{
				label: "Cash flow",
				icon: <ArrowLeftRightIcon />,
				tint: "bg-sky-500/10 text-sky-500",
				to: "/transactions",
			},
		],
	},
	{
		label: "Budgets & goals",
		icon: <PiggyBankIcon />,
		tint: "bg-violet-500/10 text-violet-500",
		rows: [
			{
				label: "Budget performance",
				icon: <TargetIcon />,
				tint: "bg-teal-500/10 text-teal-500",
				to: "/budgets",
			},
			{
				label: "Goal progress",
				icon: <PiggyBankIcon />,
				tint: "bg-violet-500/10 text-violet-500",
				to: "/goals",
			},
			{
				label: "Debt overview",
				icon: <HandCoinsIcon />,
				tint: "bg-amber-500/10 text-amber-500",
				to: "/debts",
			},
		],
	},
	{
		label: "Accounts & categories",
		icon: <LandmarkIcon />,
		tint: "bg-indigo-500/10 text-indigo-500",
		rows: [
			{
				label: "Account balances",
				icon: <LandmarkIcon />,
				tint: "bg-indigo-500/10 text-indigo-500",
				to: "/accounts",
			},
			{
				label: "Net worth",
				icon: <WalletIcon />,
				tint: "bg-cyan-500/10 text-cyan-500",
				to: "/accounts",
			},
			{
				label: "Spending by category",
				icon: <ArrowUpRightIcon />,
				tint: "bg-orange-500/10 text-orange-500",
				to: "/categories",
			},
		],
	},
];

export default function ReportsPage() {
	return (
		<div className="flex flex-col gap-6">
			<PageHeader
				description="Ready-made summaries of your money, one click each."
				title="Reports"
			/>
			<ReportsCard />
		</div>
	);
}

function ReportsCard({ className, ...props }: ComponentProps<typeof Card>) {
	return (
		<Card className={cn("gap-0", className)} {...props}>
			<CardHeader className="border-b">
				<CardTitle>All reports</CardTitle>
				<CardDescription>
					Expand a group to see its reports.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3 p-4">
				{sections.map((section) => (
					<Collapsible
						className="group/collapsible overflow-hidden rounded-xl border"
						defaultOpen
						key={section.label}
					>
						<CollapsibleTrigger
							className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
							render={<div />}
						>
							<span
								aria-hidden="true"
								className={cn(
									"flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4",
									section.tint,
								)}
							>
								{section.icon}
							</span>
							<span className="font-medium text-sm">{section.label}</span>
							<ChevronRightIcon
								aria-hidden="true"
								className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
							/>
						</CollapsibleTrigger>
						<CollapsibleContent>
							{/* gap-px over a border-colored grid paints dividers
							    between cells in both directions at any column count. */}
							<div className="grid grid-cols-2 gap-px border-t bg-border sm:grid-cols-3">
								{section.rows.map((row) => (
									<Link
										className="flex items-center gap-3 bg-card px-4 py-3.5 transition-colors hover:bg-muted/50"
										key={row.label}
										to={row.to}
									>
										<span
											aria-hidden="true"
											className={cn(
												"flex size-7 shrink-0 items-center justify-center rounded-lg [&_svg]:size-3.5",
												row.tint,
											)}
										>
											{row.icon}
										</span>
										<span className="truncate text-sm">{row.label}</span>
										<ArrowRightIcon
											aria-hidden="true"
											className="ml-auto size-4 shrink-0 text-muted-foreground"
										/>
									</Link>
								))}
							</div>
						</CollapsibleContent>
					</Collapsible>
				))}
			</CardContent>
		</Card>
	);
}
