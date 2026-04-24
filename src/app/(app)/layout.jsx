import { requireAuthUser } from "@/backend/auth/guards";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }) {
  const user = await requireAuthUser();

  return (
    <AppShell user={user}>
      {children}
    </AppShell>
  );
}
