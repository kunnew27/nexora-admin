import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthLayout() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const location = useLocation();

	if (isAuthenticated) {
		const from =
			(location.state as { from?: { pathname: string } } | null)?.from?.pathname ??
			"/overview";
		return <Navigate to={from} replace />;
	}

	return <Outlet />;
}
