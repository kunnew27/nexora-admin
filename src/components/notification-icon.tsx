import type { LucideIcon } from "lucide-react";
import { BadgeCheckIcon, MessageSquareIcon, SettingsIcon, UserPlusIcon } from "lucide-react";
import type { NotificationType } from "@/stores/notification-store";
import { cn } from "@/lib/utils";

const typeStyles: Record<NotificationType, { icon: LucideIcon; classes: string }> = {
	invoice: { icon: BadgeCheckIcon, classes: "bg-emerald-100 text-emerald-600" },
	member: { icon: UserPlusIcon, classes: "bg-blue-100 text-blue-600" },
	comment: { icon: MessageSquareIcon, classes: "bg-amber-100 text-amber-600" },
	system: { icon: SettingsIcon, classes: "bg-muted text-muted-foreground" },
};

export function NotificationIcon({
	type,
	className,
}: {
	type: NotificationType;
	className?: string;
}) {
	const { icon: Icon, classes } = typeStyles[type];
	return (
		<span
			className={cn(
				"flex size-8 shrink-0 items-center justify-center rounded-full",
				classes,
				className
			)}
		>
			<Icon className="size-4" />
		</span>
	);
}
