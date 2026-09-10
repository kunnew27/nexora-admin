"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import type { Theme } from "@/stores/theme-store";
import { Link, useNavigate } from "react-router-dom";
import { ChevronsUpDownIcon, MonitorIcon, MoonIcon, SunIcon, UserIcon, BellIcon, CreditCardIcon, SettingsIcon, LifeBuoyIcon, LogOutIcon, SunMoonIcon } from "lucide-react";

export function NavUser() {
	const { isMobile } = useSidebar();
	const user = useAuthStore((state) => state.user);
	const signOut = useAuthStore((state) => state.signOut);
	const theme = useThemeStore((state) => state.theme);
	const setTheme = useThemeStore((state) => state.setTheme);
	const navigate = useNavigate();

	const handleSignOut = () => {
		signOut();
		navigate("/login");
	};

	return (
		<SidebarMenu className="border-t p-2">
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger render={<SidebarMenuButton className="text-muted-foreground" />}><Avatar className="size-5">
                    								{user?.avatar && <AvatarImage alt={user.name} src={user.avatar} />}
                    								<AvatarFallback>{(user?.name ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
                    							</Avatar><span className="font-medium text-sm">
                    								{(user?.name ?? "Guest").split(" ")[0]}
                    							</span><ChevronsUpDownIcon className="ml-auto size-3!" /></DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="min-w-48"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
							<DropdownMenuGroup>
								<DropdownMenuItem render={<Link to="/settings" />}>
									<UserIcon
									/>
									Profile
								</DropdownMenuItem>
								<DropdownMenuItem>
									<BellIcon
									/>
									Notifications
								</DropdownMenuItem>
								<DropdownMenuItem render={<Link to="/billing" />}>
									<CreditCardIcon
									/>
									Billing
								</DropdownMenuItem>
								<DropdownMenuItem render={<Link to="/settings" />}>
									<SettingsIcon
									/>
									Settings
								</DropdownMenuItem>
				<DropdownMenuItem render={<Link to="/help" />}>
									<LifeBuoyIcon
									/>
									Help Center
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<SunMoonIcon
									/>
									Theme
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent className="min-w-36">
									<DropdownMenuRadioGroup
										onValueChange={(value) => setTheme(value as Theme)}
										value={theme}
									>
										<DropdownMenuRadioItem value="light">
											<SunIcon
											/>
											Light
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="dark">
											<MoonIcon
											/>
											Dark
										</DropdownMenuRadioItem>
										<DropdownMenuRadioItem value="system">
											<MonitorIcon
											/>
											System
										</DropdownMenuRadioItem>
									</DropdownMenuRadioGroup>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
							<DropdownMenuSeparator />
							<DropdownMenuItem variant="destructive" onClick={handleSignOut} className="cursor-pointer">
								<LogOutIcon
								/>
								Log out
							</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
