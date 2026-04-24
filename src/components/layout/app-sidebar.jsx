"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FolderArchive,
  LayoutDashboard,
  Megaphone,
  ShieldCheck,
  TriangleAlert,
  UserCog,
  UserCircle,
  UsersRound,
  X,
} from "lucide-react";
import { ROLES, ROLE_LABELS } from "@/backend/constants/roles";
import { navigationByRole } from "@/frontend/navigation/roleNavigation";
import { companyWorkspaceItems } from "@/frontend/navigation/roleNavigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const COMPANY_SIDEBAR_ROLES = new Set([
  ROLES.COMPANY_ADMIN,
  ROLES.STATE_MANAGER,
  ROLES.CARE_MANAGER,
  ROLES.SUPPORT_WORKER,
]);

const iconMap = {
  "layout-dashboard": LayoutDashboard,
  "users-round": UsersRound,
  "briefcase-business": BriefcaseBusiness,
  "calendar-range": CalendarRange,
  "shield-check": ShieldCheck,
  "folder-archive": FolderArchive,
  "building-2": Building2,
  "triangle-alert": TriangleAlert,
  "user-cog": UserCog,
  "user-circle": UserCircle,
  "credit-card": CreditCard,
  megaphone: Megaphone,
};

function NavItem({ pathname, item, onNavigate }) {
  const Icon = iconMap[item.icon] || LayoutDashboard;
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
        isActive &&
          "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50",
      )}
    >
      <span className="inline-flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {item.title}
      </span>
      {item.comingSoon ? (
        <Badge variant="secondary" className="text-[10px]">
          Upcoming
        </Badge>
      ) : null}
    </Link>
  );
}

export function AppSidebar({ user, isOpen = false, onClose }) {
  const role = user.role;
  const pathname = usePathname();
  const router = useRouter();
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isCompanyTeamSidebar = COMPANY_SIDEBAR_ROLES.has(role);
  const [isCompaniesOpen, setIsCompaniesOpen] = useState(
    pathname.startsWith("/companies") || Boolean(user.activeCompanyId),
  );
  const navItems = navigationByRole[role] || [];

  const superAdminPlatformItems = [
    {
      title: "Subscription",
      href: "/subscription",
      icon: "credit-card",
      comingSoon: true,
    },
    {
      title: "Promotions",
      href: "/promotions",
      icon: "megaphone",
      comingSoon: true,
    },
  ];

  const sidebarContent = (
    <>
      <div className="rounded-2xl border border-zinc-200/80 bg-linear-to-br from-violet-500/10 to-cyan-500/10 p-4 dark:border-zinc-800 dark:from-violet-500/20 dark:to-cyan-500/10">
        <p
          className={cn(
            "text-xs tracking-wider text-zinc-500 dark:text-zinc-400",
            isCompanyTeamSidebar
              ? "font-medium text-zinc-600 dark:text-zinc-300"
              : "uppercase",
          )}
        >
          {isCompanyTeamSidebar
            ? user.activeCompanyName || "Company"
            : "Syntrix"}
        </p>
        {/* <p className="mt-2 text-lg font-semibold">NDIS Operations Cloud</p> */}
        <Badge className="mt-3" variant="secondary">
          {ROLE_LABELS[role] || role}
        </Badge>
      </div>

      <nav className="mt-6 flex-1 space-y-1">
        {isSuperAdmin ? (
          <>
            <NavItem
              pathname={pathname}
              onNavigate={onClose}
              item={{
                title: "Dashboard",
                href: "/dashboard",
                icon: "layout-dashboard",
              }}
            />
            <button
              type="button"
              onClick={() => {
                setIsCompaniesOpen((prev) => !prev);
                router.push("/companies");
                onClose?.();
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <span className="inline-flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Companies
              </span>
              {isCompaniesOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {isCompaniesOpen ? (
              <div className="space-y-1 rounded-xl border border-zinc-200/80 p-2 dark:border-zinc-800">
                <NavItem
                  pathname={pathname}
                  onNavigate={onClose}
                  item={{
                    title: "Manage companies",
                    href: "/companies",
                    icon: "building-2",
                  }}
                />
                {user.activeCompanyId ? (
                  <div className="mt-2 space-y-1 rounded-lg border border-zinc-300/90 bg-zinc-50/80 p-2 dark:border-zinc-700 dark:bg-zinc-900/60">
                    <p className="px-1 pb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {user.activeCompanyName || "Selected company"} workspace
                    </p>
                    {companyWorkspaceItems.map((item) => (
                      <NavItem
                        key={item.href}
                        pathname={pathname}
                        onNavigate={onClose}
                        item={item}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 hidden rounded-lg border border-dashed border-zinc-200 px-2 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    Select a company on Manage companies to open this workspace.
                  </p>
                )}
              </div>
            ) : null}

            {superAdminPlatformItems.map((item) => (
              <NavItem
                key={item.href}
                pathname={pathname}
                onNavigate={onClose}
                item={item}
              />
            ))}
          </>
        ) : (
          navItems.map((item) => (
            <NavItem
              key={item.href}
              pathname={pathname}
              onNavigate={onClose}
              item={item}
            />
          ))
        )}
      </nav>

      {isCompanyTeamSidebar ? (
        <p className="mt-6 text-center text-xs tracking-wide text-zinc-500 dark:text-zinc-400">
          Syntrix platform
        </p>
      ) : null}
    </>
  );

  return (
    <>
      <aside className="hidden min-h-screen w-72 shrink-0 flex-col border-r border-zinc-200/80 bg-white/90 p-4 backdrop-blur-xl lg:flex dark:border-zinc-800 dark:bg-zinc-950/80">
        {sidebarContent}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-zinc-900/50 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-zinc-200/80 bg-white p-4 shadow-xl transition-transform duration-300 ease-out dark:border-zinc-800 dark:bg-zinc-950 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!isOpen}
      >
        <div className="mb-2 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
