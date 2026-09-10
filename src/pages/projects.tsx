import { PageHeader } from "@/components/page-header";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function ProjectsPage() {
	return (
		<div className="space-y-4">
			<PageHeader
				title="Projects"
				description="Manage projects, milestones, and delivery status."
			/>
			<DashboardSkeleton />
		</div>
	);
}
