import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  FolderArchive,
  ShieldCheck,
} from "lucide-react";
import { ROLE_LABELS, ROLES } from "@/backend/constants/roles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";

const accents = ["violet", "cyan", "emerald", "amber"];

export function DashboardOverview({ user, stats }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {/* <Badge>{ROLE_LABELS[user.role] || user.role}</Badge> */}
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Unified visibility for participants, workforce, incidents, and
          compliance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.summary.map((item, index) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            accent={accents[index % accents.length]}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Company activity</CardTitle>
            <CardDescription>
              Company related insights and operational status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.companies.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Company-level table and stats
              </p>
            ) : (
              <div className="space-y-3">
                {stats.companies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <div>
                      <p className="text-sm font-medium">{company.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {company.state}
                      </p>
                    </div>
                    <Badge
                      variant={
                        company.status === "active" ? "success" : "warning"
                      }
                    >
                      {company.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>
              Core modules and roadmap placeholders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              href="/roster"
              title="Roster & Scheduling"
              icon={<CalendarRange className="h-4 w-4" />}
              comingSoon
            />
            <QuickAction
              href="/compliance"
              title="Compliance"
              icon={<ShieldCheck className="h-4 w-4" />}
              comingSoon
            />
            <QuickAction
              href="/documents"
              title="Document Center"
              icon={<FolderArchive className="h-4 w-4" />}
              comingSoon
            />
            {user.role === ROLES.SUPER_ADMIN ? (
              <QuickAction href="/companies" title="Manage companies" />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({ href, title, icon, comingSoon = false }) {
  if (comingSoon) {
    return (
      <div className="flex h-10 items-center justify-between rounded-xl bg-zinc-100 px-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
        <span className="inline-flex items-center gap-2">
          {icon}
          {title}
        </span>
        <Badge variant="warning">Coming soon</Badge>
      </div>
    );
  }

  return (
    <Button variant="secondary" className="w-full justify-between" asChild>
      <Link href={href}>
        <span className="inline-flex items-center gap-2">
          {icon}
          {title}
        </span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}
