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
import ImageViewerPage from "@/pages/image-viewer";
import NumberInputPage from "@/pages/number-input";
import FinanceOverviewPage from "@/pages/finance";
import FinanceTransactionsPage from "@/pages/finance/transactions";
import FinanceAccountsPage from "@/pages/finance/accounts";
import FinanceBudgetsPage from "@/pages/finance/budgets";
import FinanceGoalsPage from "@/pages/finance/goals";
import FinanceDebtsPage from "@/pages/finance/debts";
import FinanceCategoriesPage from "@/pages/finance/categories";
import ReportsPage from "@/pages/reports";
import IncomeReportPage from "@/pages/reports/income";
import LoginPage from "@/pages/auth/login";
import NotFoundPage from "@/pages/not-found";

export const router = createBrowserRouter([
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
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
      { path: "image-viewer", element: <ImageViewerPage /> },
      { path: "number-input", element: <NumberInputPage /> },
      { path: "overview", element: <FinanceOverviewPage /> },
      { path: "transactions", element: <FinanceTransactionsPage /> },
      { path: "accounts", element: <FinanceAccountsPage /> },
      { path: "budgets", element: <FinanceBudgetsPage /> },
      { path: "goals", element: <FinanceGoalsPage /> },
      { path: "debts", element: <FinanceDebtsPage /> },
      { path: "categories", element: <FinanceCategoriesPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "reports/income", element: <IncomeReportPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [{ path: "login", element: <LoginPage /> }],
  },
  { path: "*", element: <NotFoundPage /> },
]);
