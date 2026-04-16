"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const initialForm = {
  name: "",
  abn: "",
  email: "",
  phone: "",
  address: "",
  state: "NSW",
  status: "active",
};

export function CompanyManagementClient({ companies, selectedCompanyId }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [actionCompanyId, setActionCompanyId] = useState("");
  const [error, setError] = useState("");

  async function handleCreateCompany(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to create company");
        return;
      }

      setForm(initialForm);
      router.refresh();
    } catch (requestError) {
      setError("Unable to create company right now.");
    } finally {
      setIsSaving(false);
    }
  }

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

  async function handleCompanyStatusChange(company) {
    const nextStatus = company.status === "active" ? "inactive" : "active";
    const confirmed = window.confirm(
      nextStatus === "inactive"
        ? `Deactivate ${company.name}? Their company users will not be able to login.`
        : `Activate ${company.name}? Their users will regain login access.`,
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
        body: JSON.stringify({ status: nextStatus }),
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
      `Delete ${company.name}? This will permanently remove the company and all its associated data.`,
    );
    if (!confirmed) {
      return;
    }

    setError("");
    setActionCompanyId(company.id);

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "DELETE",
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
        <CardHeader>
          <CardTitle>Create new company</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={handleCreateCompany}
          >
            <Input
              required
              placeholder="Company name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
            <Input
              required
              placeholder="ABN"
              value={form.abn}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, abn: event.target.value }))
              }
            />
            <Input
              required
              type="email"
              placeholder="Company email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
            <Input
              placeholder="Address"
              className="md:col-span-2"
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, address: event.target.value }))
              }
            />
            <select
              value={form.state}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, state: event.target.value }))
              }
              className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"].map(
                (state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ),
              )}
            </select>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value }))
              }
              className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="suspended">suspended</option>
            </select>
            <div className="md:col-span-2">
              <Button type="submit" disabled={isSaving}>
                <Building2 className="h-4 w-4" />
                {isSaving ? "Creating..." : "Create company"}
              </Button>
            </div>
            {error ? (
              <p className="md:col-span-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {companies.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No companies yet.
            </p>
          ) : null}
          {companies.map((company) => {
            const isActive = selectedCompanyId === company.id;
            const isBusy = actionCompanyId === company.id;

            return (
              <div
                key={company.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div>
                  <p className="font-medium">{company.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {company.state} - ABN {company.abn}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      company.status === "active" ? "success" : "warning"
                    }
                  >
                    {company.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant={isActive ? "secondary" : "default"}
                    disabled={isSwitching || isActive}
                    onClick={() => handleSetCompanyContext(company.id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isActive ? "Active" : "Manage company"}
                  </Button>
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
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
