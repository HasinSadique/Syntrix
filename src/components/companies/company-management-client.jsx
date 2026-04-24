"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Power, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function CompanyManageToggle({ checked, disabled, busy, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-busy={busy}
      disabled={disabled}
      onClick={() => onToggle(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950",
        checked
          ? "border-violet-600 bg-violet-600 dark:border-violet-500 dark:bg-violet-500"
          : "border-zinc-300 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-700"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-out",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

export function CompanyManagementClient({ companies, selectedCompanyId }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);
  const [actionCompanyId, setActionCompanyId] = useState("");
  const [error, setError] = useState("");

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return companies;
    }

    return companies.filter((company) =>
      company.name.toLowerCase().includes(normalizedSearch)
    );
  }, [companies, searchTerm]);

  async function handleSetCompanyContext(companyId) {
    setIsSwitching(true);
    setError("");

    try {
      const response = await fetch("/api/super-admin/company-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to select company");
        return;
      }

      router.push("/users");
      router.refresh();
    } catch (requestError) {
      setError("Unable to update active company.");
    } finally {
      setIsSwitching(false);
    }
  }

  async function handleClearCompanyContext() {
    setIsSwitching(true);
    setError("");

    try {
      const response = await fetch("/api/super-admin/company-context", {
        method: "DELETE"
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to clear company selection");
        return;
      }

      router.push("/companies");
      router.refresh();
    } catch (requestError) {
      setError("Unable to clear company selection.");
    } finally {
      setIsSwitching(false);
    }
  }

  async function handleManageToggle(companyId, nextChecked) {
    if (nextChecked) {
      await handleSetCompanyContext(companyId);
      return;
    }
    await handleClearCompanyContext();
  }

  async function handleCompanyStatusChange(company) {
    const nextStatus = company.status === "active" ? "inactive" : "active";
    const confirmed = window.confirm(
      nextStatus === "inactive"
        ? `Deactivate ${company.name}? Their company users will not be able to login.`
        : `Activate ${company.name}? Their users will regain login access.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setActionCompanyId(company.id);

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to update company status");
        return;
      }

      router.refresh();
    } catch (requestError) {
      setError("Unable to update company status right now.");
    } finally {
      setActionCompanyId("");
    }
  }

  async function handleDeleteCompany(company) {
    const confirmed = window.confirm(
      `Delete ${company.name}? This will permanently remove the company and all its associated data.`
    );
    if (!confirmed) {
      return;
    }

    setError("");
    setActionCompanyId(company.id);

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "DELETE"
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to delete company");
        return;
      }

      router.refresh();
    } catch (requestError) {
      setError("Unable to delete company right now.");
    } finally {
      setActionCompanyId("");
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Onboarded companies</CardTitle>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Manage tenant companies and access workspace controls.
            </p>
          </div>
          <Button asChild>
            <Link href="/companies/onboard">
              <Building2 className="h-4 w-4" />
              Onboard new company
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-9"
              placeholder="Search company by name..."
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                <tr>
                  <th className="px-4 py-3 text-left">Company name</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400"
                    >
                      No matching companies found.
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => {
                    const isActive = selectedCompanyId === company.id;
                    const isBusy = actionCompanyId === company.id;

                    return (
                      <tr
                        key={company.id}
                        className="border-t border-zinc-200 dark:border-zinc-800"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium">{company.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              company.status === "active" ? "success" : "warning"
                            }
                          >
                            {company.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                Manage
                              </span>
                              <CompanyManageToggle
                                checked={isActive}
                                busy={isSwitching}
                                disabled={isSwitching || isBusy}
                                onToggle={(next) =>
                                  handleManageToggle(company.id, next)
                                }
                              />
                            </div>
                            <Button
                              size="sm"
                              variant={
                                company.status === "active" ? "outline" : "secondary"
                              }
                              disabled={isBusy}
                              onClick={() => handleCompanyStatusChange(company)}
                            >
                              <Power className="h-4 w-4" />
                              {company.status === "active" ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={isBusy}
                              onClick={() => handleDeleteCompany(company)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
