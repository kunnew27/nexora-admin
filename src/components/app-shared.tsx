import { LayoutGridIcon, BarChart3Icon, BriefcaseIcon, UsersIcon, UserRoundIcon, PlugIcon, KeyRoundIcon, SettingsIcon, ActivityIcon, HelpCircleIcon, BookOpenIcon, ImageIcon, HashIcon } from "lucide-react";

export type SidebarNavItem = {
	title: string;
	url: string;
	icon: React.ReactNode;
	isActive?: boolean;
};

export type SidebarNavGroup = {
	label?: string;
	items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
	{
		label: "Product",
		items: [
			{
				title: "Dashboard",
				url: "/dashboard",
				icon: (
					<LayoutGridIcon
					/>
				),
			},
			{
				title: "Analytics",
				url: "/analytics",
				icon: (
					<BarChart3Icon
					/>
				),
			},
			{
				title: "Projects",
				url: "/projects",
				icon: (
					<BriefcaseIcon
					/>
				),
			},
			{
				title: "Team",
				url: "/team",
				icon: (
					<UsersIcon
					/>
				),
			},
			{
				title: "Users",
				url: "/users",
				icon: (
					<UserRoundIcon
					/>
				),
			},
			{
				title: "Integrations",
				url: "/integrations",
				icon: (
					<PlugIcon
					/>
				),
			},
			{
				title: "API Keys",
				url: "/api-keys",
				icon: (
					<KeyRoundIcon
					/>
				),
			},
			{
				title: "Image Viewer",
				url: "/image-viewer",
				icon: (
					<ImageIcon
					/>
				),
			},
			{
				title: "Number Input",
				url: "/number-input",
				icon: (
					<HashIcon
					/>
				),
			},
		],
	},
	{
		label: "Administration",
		items: [
			{
				title: "Activity",
				url: "/activity",
				icon: (
					<ActivityIcon
					/>
				),
			},
			{
				title: "Settings",
				url: "/settings",
				icon: (
					<SettingsIcon
					/>
				),
			},
		],
	},
];

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Help Center",
		url: "/help",
		icon: (
			<HelpCircleIcon
			/>
		),
	},

	{
		title: "Documentation",
		url: "/documentation",
		icon: (
			<BookOpenIcon
			/>
		),
	},
];

export const navLinks: SidebarNavItem[] = [
	...navGroups.flatMap((group) => group.items),
	...footerNavLinks,
];
