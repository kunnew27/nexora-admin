"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { footerNavLinks, navGroups } from "@/components/app-shared";
import { Link, useLocation } from "react-router-dom";
import { NavUser } from "@/components/nav-user";

export function AppSidebar() {
	const { pathname } = useLocation();

	return (
		<Sidebar
			className="static min-h-full *:data-[slot=sidebar-inner]:bg-background"
			collapsible="offcanvas"
			variant="sidebar"
		>
			<SidebarHeader className="relative h-14 justify-center px-2 py-0" />
			<SidebarContent>
				{navGroups.map((group, index) => (
					<SidebarGroup key={`sidebar-group-${index}`}>
						{group.label && (
							<SidebarGroupLabel className="font-normal">
								{group.label}
							</SidebarGroupLabel>
						)}
						<SidebarMenu>
							{group.items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton isActive={item.url === pathname} tooltip={item.title} render={<Link to={item.url} />}>{item.icon}<span>{item.title}</span></SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarFooter className="gap-0 p-0">
				<SidebarMenu className="border-t p-2">
					{footerNavLinks.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton className="text-muted-foreground" isActive={item.url === pathname} size="sm" render={<Link to={item.url} />}>{item.icon}<span>{item.title}</span></SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
