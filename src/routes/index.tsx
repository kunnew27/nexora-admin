import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "@/layouts/admin-layout";
import AuthLayout from "@/layouts/auth-layout";
import DashboardPage from "@/pages/dashboard";
import AnalyticsPage from "@/pages/analytics";
import ProjectsPage from "@/pages/projects";
import TeamPage from "@/pages/team";
import IntegrationsPage from "@/pages/integrations";
import ApiKeysPage from "@/pages/api-keys";
import SettingsPage from "@/pages/settings";
import ActivityPage from "@/pages/activity";
import UsersPage from "@/pages/users";
import BillingPage from "@/pages/billing";
import LoginPage from "@/pages/auth/login";
import NotFoundPage from "@/pages/not-found";

export const router = createBrowserRouter([
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "team", element: <TeamPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "integrations", element: <IntegrationsPage /> },
      { path: "api-keys", element: <ApiKeysPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "activity", element: <ActivityPage /> },
      { path: "billing", element: <BillingPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [{ path: "login", element: <LoginPage /> }],
  },
  { path: "*", element: <NotFoundPage /> },
]);
