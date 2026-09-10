import { Navigate, Outlet, useLocation } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/app-shell";
import { CommandPalette } from "@/components/command-palette";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminLayout() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const location = useLocation();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	return (
		<TooltipProvider>
			<AppShell>
				<Outlet />
			</AppShell>
			<CommandPalette />
		</TooltipProvider>
	);
}
