import { PageHeader } from "@/components/page-header";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function TeamPage() {
	return (
		<div className="space-y-4">
			<PageHeader
				title="Team"
				description="Invite teammates and manage roles and permissions."
			/>
			<DashboardSkeleton />
		</div>
	);
}
