import { create } from "zustand";

export type NotificationType = "invoice" | "member" | "comment" | "system";

export type Notification = {
	id: string;
	type: NotificationType;
	title: string;
	description: string;
	time: string;
	unread: boolean;
};

type NotificationState = {
	notifications: Notification[];
	markRead: (id: string) => void;
	markAllRead: () => void;
};

const initialNotifications: Notification[] = [
	{
		id: "n-1045",
		type: "invoice",
		title: "Invoice #1045 paid",
		description: "Northwind Labs paid $2,400.00.",
		time: "2m ago",
		unread: true,
	},
	{
		id: "n-invite",
		type: "member",
		title: "Team invite accepted",
		description: "Maya Chen joined the Workspace plan.",
		time: "1h ago",
		unread: true,
	},
	{
		id: "n-comment",
		type: "comment",
		title: "New comment on Q3 report",
		description: "Diego left a comment: “Numbers look great…",
		time: "3h ago",
		unread: true,
	},
	{
		id: "n-system",
		type: "system",
		title: "Scheduled maintenance",
		description: "The API will be read-only on Sunday, 02:00–03:00 UTC.",
		time: "Yesterday",
		unread: false,
	},
];

export const useNotificationStore = create<NotificationState>((set) => ({
	notifications: initialNotifications,
	markRead: (id) =>
		set((state) => ({
			notifications: state.notifications.map((n) =>
				n.id === id ? { ...n, unread: false } : n
			),
		})),
	markAllRead: () =>
		set((state) => ({
			notifications: state.notifications.map((n) => ({ ...n, unread: false })),
		})),
}));
