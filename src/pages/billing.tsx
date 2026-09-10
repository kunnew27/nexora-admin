import { PageHeader } from "@/components/page-header";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function BillingPage() {
	return (
		<div className="space-y-4">
			<PageHeader
				title="Billing"
				description="Manage your plan, payment methods, and invoices."
			/>
			<DashboardSkeleton />
		</div>
	);
}
