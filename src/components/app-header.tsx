import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { navLinks } from "@/components/app-shared";
import { useCommandPaletteStore } from "@/stores/command-palette-store";
import { NotificationsMenu } from "@/components/notifications-menu";
import { useLocation } from "react-router-dom";
import { Kbd } from "@/components/ui/kbd";
import { SearchIcon, HeadsetIcon } from "lucide-react";

export function AppHeader() {
	const { pathname } = useLocation();
	const activeItem = navLinks.find((item) => item.url === pathname);
	const setPaletteOpen = useCommandPaletteStore((state) => state.setOpen);

	return (
		<header
			className={cn(
				"sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 bg-background px-4 md:px-6"
			)}
		>
			<div className="flex items-center gap-2">
				<SidebarTrigger className="md:hidden" />
				<Separator
					className="mr-2 data-[orientation=vertical]:h-4 md:hidden"
					orientation="vertical"
				/>
				<AppBreadcrumbs page={activeItem} />
			</div>
			<div className="flex items-center gap-2">
				<Button
					aria-label="Open command palette"
					className="gap-2 text-muted-foreground"
					onClick={() => setPaletteOpen(true)}
					size="sm"
					variant="outline"
				>
					<SearchIcon className="size-3.5" />
					<span className="hidden md:inline">Search</span>
					<Kbd className="ml-1">⌘K</Kbd>
				</Button>
				<NotificationsMenu />
				<Button aria-label="Support" size="icon" variant="ghost">
					<HeadsetIcon
					/>
				</Button>
			</div>
		</header>
	);
}
