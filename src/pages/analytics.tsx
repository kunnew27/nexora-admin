import { PageHeader } from "@/components/page-header";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function AnalyticsPage() {
	return (
		<div className="space-y-4">
			<PageHeader
				title="Analytics"
				description="Track performance and trends across your workspace."
			/>
			<DashboardSkeleton />
		</div>
	);
}
