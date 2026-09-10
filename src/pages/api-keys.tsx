import { PageHeader } from "@/components/page-header";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function ApiKeysPage() {
	return (
		<div className="space-y-4">
			<PageHeader
				title="API Keys"
				description="Create and manage API keys for programmatic access."
			/>
			<DashboardSkeleton />
		</div>
	);
}
