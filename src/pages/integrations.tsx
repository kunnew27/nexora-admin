import { PageHeader } from "@/components/page-header";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function IntegrationsPage() {
	return (
		<div className="space-y-4">
			<PageHeader
				title="Integrations"
				description="Connect third-party tools and services to your workspace."
			/>
			<DashboardSkeleton />
		</div>
	);
}
