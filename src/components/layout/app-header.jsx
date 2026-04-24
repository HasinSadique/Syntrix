"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { ROLES } from "@/backend/constants/roles";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

export function AppHeader({ user, onOpenSidebar }) {
  const router = useRouter();
  const today = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200/80 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 lg:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{today}</p>
          <h1 className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
            Welcome back{" "}
            {user.firstName != "Syntrix" ? ", " + user.firstName : ""}
          </h1>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {user.role === ROLES.SUPER_ADMIN ? (
          <div className="hidden items-center gap-2 md:flex">
            <Badge variant={user.activeCompanyName ? "success" : "warning"}>
              {user.activeCompanyName
                ? `Managing: ${user.activeCompanyName}`
                : "No company selected"}
            </Badge>
          </div>
        ) : null}
        <ThemeToggle />
        <Badge
          className="h-9 rounded-full px-3 py-2 text-xs"
          variant="secondary"
        >
          {getInitials(user.firstName, user.lastName)}
        </Badge>
        <Button variant="outline" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
