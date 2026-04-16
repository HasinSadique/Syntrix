import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export function AppShell({ user, companyOptions, children }) {
  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <AppSidebar user={user} companyOptions={companyOptions} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AppHeader user={user} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
