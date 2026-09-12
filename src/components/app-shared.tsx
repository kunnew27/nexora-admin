import { ChartPieIcon, UserRoundIcon, PlugIcon, KeyRoundIcon, SettingsIcon, ActivityIcon, HelpCircleIcon, BookOpenIcon, ImageIcon, HashIcon, WalletIcon, ArrowLeftRightIcon, LandmarkIcon, PiggyBankIcon, TargetIcon, HandCoinsIcon, TagsIcon } from "lucide-react";

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
		label: "Finance",
		items: [
			{
				title: "Overview",
				url: "/overview",
				icon: <WalletIcon />,
			},
			{
				title: "Reports",
				url: "/reports",
				icon: <ChartPieIcon />,
			},
			{
				title: "Transactions",
				url: "/transactions",
				icon: <ArrowLeftRightIcon />,
			},
			{
				title: "Accounts",
				url: "/accounts",
				icon: <LandmarkIcon />,
			},
			{
				title: "Budgets",
				url: "/budgets",
				icon: <PiggyBankIcon />,
			},
			{
				title: "Goals",
				url: "/goals",
				icon: <TargetIcon />,
			},
			{
				title: "Debts",
				url: "/debts",
				icon: <HandCoinsIcon />,
			},
			{
				title: "Categories",
				url: "/categories",
				icon: <TagsIcon />,
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
