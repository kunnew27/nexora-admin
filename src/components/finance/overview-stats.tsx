import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";

export type OverviewStat = {
	label: string;
	value: string;
	/** Percent change where a positive number is always the favorable direction. */
	delta?: number;
	footnote?: string;
};

/** KPI row for the finance overview, styled after the dashboard-3 stat cards. */
export function OverviewStats({
	stats,
}: {
	stats: readonly OverviewStat[];
	className?: string;
}) {
	return (
		<>
			{stats.map((stat) => (
				<Card key={stat.label}>
					<CardHeader>
						<CardTitle className="font-normal text-muted-foreground text-xs">
							{stat.label}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						<p className="font-semibold text-2xl tabular-nums">{stat.value}</p>
						{stat.delta !== undefined && (
							<div className="flex items-center gap-1 text-xs">
								<Delta value={stat.delta}>
									<DeltaIcon />
									<DeltaValue />
								</Delta>
								{stat.footnote && (
									<span className="text-muted-foreground">{stat.footnote}</span>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			))}
		</>
	);
}
