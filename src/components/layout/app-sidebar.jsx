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
  UsersRound,
} from "lucide-react";
import { ROLES, ROLE_LABELS } from "@/backend/constants/roles";
import { navigationByRole } from "@/frontend/navigation/roleNavigation";
import { companyWorkspaceItems } from "@/frontend/navigation/roleNavigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  "credit-card": CreditCard,
  "megaphone": Megaphone
};

function NavItem({ pathname, item }) {
  const Icon = iconMap[item.icon] || LayoutDashboard;
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
        isActive && "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50"
      )}
    >
      <span className="inline-flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {item.title}
      </span>
      {item.comingSoon ? (
        <Badge variant="secondary" className="text-[10px]">
          Coming soon
        </Badge>
      ) : null}
    </Link>
  );
}

export function AppSidebar({ user, companyOptions = [] }) {
  const role = user.role;
  const pathname = usePathname();
  const router = useRouter();
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const [isCompaniesOpen, setIsCompaniesOpen] = useState(
    pathname.startsWith("/companies") || Boolean(user.activeCompanyId)
  );
  const [isSwitchingCompany, setIsSwitchingCompany] = useState(false);
  const navItems = navigationByRole[role] || [];

  async function handleCompanyContextChange(companyId) {
    setIsSwitchingCompany(true);

    try {
      const requestOptions = companyId
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ companyId })
          }
        : {
            method: "DELETE"
          };

      const response = await fetch("/api/super-admin/company-context", requestOptions);
      if (!response.ok) {
        return;
      }

      if (companyId) {
        router.push("/users");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } finally {
      setIsSwitchingCompany(false);
    }
  }

  const superAdminPlatformItems = [
    {
      title: "Subscription",
      href: "/subscription",
      icon: "credit-card",
      comingSoon: true
    },
    {
      title: "Promotions",
      href: "/promotions",
      icon: "megaphone",
      comingSoon: true
    }
  ];

  return (
    <aside className="hidden w-72 shrink-0 border-r border-zinc-200/80 bg-white/90 p-4 backdrop-blur-xl lg:block dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="rounded-2xl border border-zinc-200/80 bg-linear-to-br from-violet-500/10 to-cyan-500/10 p-4 dark:border-zinc-800 dark:from-violet-500/20 dark:to-cyan-500/10">
        <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Syntrix
        </p>
        {/* <p className="mt-2 text-lg font-semibold">NDIS Operations Cloud</p> */}
        <Badge className="mt-3" variant="secondary">
          {ROLE_LABELS[role] || role}
        </Badge>
      </div>

      <nav className="mt-6 space-y-1">
        {isSuperAdmin ? (
          <>
            <NavItem
              pathname={pathname}
              item={{ title: "Dashboard", href: "/dashboard", icon: "layout-dashboard" }}
            />
            <button
              type="button"
              onClick={() => setIsCompaniesOpen((prev) => !prev)}
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
                  item={{ title: "Manage companies", href: "/companies", icon: "building-2" }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleCompanyContextChange(null)}
                  disabled={isSwitchingCompany || !user.activeCompanyId}
                >
                  Platform view (clear selection)
                </Button>
                <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                  {companyOptions.map((company) => {
                    const isSelected = user.activeCompanyId === company.id;

                    return (
                      <button
                        key={company.id}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800",
                          isSelected && "bg-zinc-100 dark:bg-zinc-800"
                        )}
                        onClick={() => handleCompanyContextChange(company.id)}
                        disabled={isSwitchingCompany}
                      >
                        <span className="line-clamp-1">{company.name}</span>
                        <Badge
                          variant={company.status === "active" ? "success" : "warning"}
                          className="ml-2"
                        >
                          {isSelected ? `selected (${company.status})` : company.status}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {user.activeCompanyId ? (
              <>
                <p className="px-2 pt-2 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Selected company workspace
                </p>
                {companyWorkspaceItems.map((item) => (
                  <NavItem key={item.href} pathname={pathname} item={item} />
                ))}
              </>
            ) : (
              <p className="px-2 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                Select a company under Companies to open user, participant, worker,
                roster, compliance, and document modules.
              </p>
            )}

            {superAdminPlatformItems.map((item) => (
              <NavItem key={item.href} pathname={pathname} item={item} />
            ))}
          </>
        ) : (
          navItems.map((item) => <NavItem key={item.href} pathname={pathname} item={item} />)
        )}
      </nav>
    </aside>
  );
}
