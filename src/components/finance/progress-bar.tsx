import { cn } from "@/lib/utils";
import { clampPercent } from "@/lib/finance";

/** Thin rounded progress bar; color reflects how close the target is. */
export function ProgressBar({ percent }: { percent: number }) {
	const clamped = clampPercent(percent);
	const color =
		percent > 100
			? "bg-rose-500"
			: percent >= 90
				? "bg-amber-500"
				: "bg-emerald-500";
	return (
		<div
			aria-label={`${clamped.toFixed(0)}% complete`}
			aria-valuemax={100}
			aria-valuemin={0}
			aria-valuenow={Math.round(clamped)}
			className="h-2 w-full overflow-hidden rounded-full bg-muted"
			role="progressbar"
		>
			<div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${clamped}%` }} />
		</div>
	);
}
