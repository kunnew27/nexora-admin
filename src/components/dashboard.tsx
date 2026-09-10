import { DashboardInvoices } from "@/components/dashboard-invoices";
import { SalesChart } from "@/components/sales-chart";
import { DashboardStats } from "@/components/stats";
import { useAuthStore } from "@/stores/auth-store";

export function Dashboard() {
	const user = useAuthStore((state) => state.user);
	const firstName = user?.name.split(" ")[0] ?? "there";

	return (
		<div className="flex flex-1 flex-col gap-6 py-6">
			<div className="flex flex-col gap-1">
				<h1 className="font-semibold text-xl leading-tight">
					Welcome back, {firstName}!
				</h1>
				<p className="text-base text-muted-foreground">
					let&apos;s get things done.
				</p>
			</div>
			<div className="rounded-lg overflow-hidden border">
				<div className="grid grid-cols-1 gap-px bg-border lg:grid-cols-3">
					<DashboardStats />
					<SalesChart />
					<DashboardInvoices />
				</div>
			</div>
		</div>
	);
}
