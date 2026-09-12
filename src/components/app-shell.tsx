import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FullWidthDivider } from "@/components/full-width-divider";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="relative h-svh w-full print:h-auto print:overflow-visible">
      <FullWidthDivider
        className="top-14 z-60 -translate-y-px print:hidden"
        contained
      />
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6 print:h-auto print:overflow-visible print:p-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
