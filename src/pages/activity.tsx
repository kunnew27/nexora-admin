import { useState } from "react";
import { ServerDataTable } from "@/components/data-table-server";
import type { DataTableColumn } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchActivity } from "@/services/activity-api";
import type { ActivityEvent } from "@/services/activity-api";
import { RefreshCwIcon } from "lucide-react";

const levelVariant = {
	info: "secondary",
	warning: "outline",
	critical: "destructive",
} as const;

const columns: DataTableColumn<ActivityEvent>[] = [
	{
		key: "event",
		header: "Event",
		sortable: true,
		cell: (event) => (
			<div className="min-w-0">
				<p className="truncate font-medium">{event.event}</p>
				<p className="truncate text-muted-foreground text-xs">{event.target}</p>
			</div>
		),
	},
	{
		key: "user",
		header: "User",
		sortable: true,
		className: "w-40",
		cell: (event) => <span className="truncate">{event.user}</span>,
	},
	{
		key: "level",
		header: "Level",
		sortable: true,
		className: "w-28",
		cell: (event) => <Badge variant={levelVariant[event.level]}>{event.level}</Badge>,
	},
	{
		key: "createdAt",
		header: "Time",
		sortable: true,
		className: "w-44",
		cell: (event) => (
			<span className="text-muted-foreground text-xs tabular-nums">
				{new Date(event.createdAt).toLocaleString(undefined, {
					month: "short",
					day: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				})}
			</span>
		),
	},
];

export default function ActivityPage() {
	const [refreshKey, setRefreshKey] = useState(0);

	return (
		<div className="flex h-full min-h-0 flex-col gap-4">
			<PageHeader
				title="Activity"
				description="Server-side paginated audit trail of workspace events."
			/>
			<ServerDataTable
				className="flex-1"
				columns={columns}
				emptyMessage="No activity found."
				fetchRows={fetchActivity}
				refreshKey={refreshKey}
				searchPlaceholder="Search activity…"
				toolbar={
					<Button
						onClick={() => setRefreshKey((key) => key + 1)}
						size="sm"
						variant="outline"
					>
						<RefreshCwIcon data-icon="inline-start" />
						Refresh
					</Button>
				}
			/>
		</div>
	);
}
