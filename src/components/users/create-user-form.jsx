"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { ROLES } from "@/backend/constants/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialForm = {
  role: ROLES.SUPPORT_WORKER,
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  state: "NSW",
  status: "active",
  workerProfile: {
    employmentType: "casual",
    jobTitle: "Support Worker",
    availabilityStatus: "available",
  },
};

const roleOptions = [
  { value: ROLES.COMPANY_ADMIN, label: "Company Admin" },
  { value: ROLES.STATE_MANAGER, label: "State Manager" },
  { value: ROLES.SUPPORT_COORDINATOR, label: "Support Coordinator" },
  { value: ROLES.SUPPORT_WORKER, label: "Support Worker" },
];

export function CreateUserForm({
  canCreate,
  activeCompanyId,
  title = "Add user",
  allowedRoles = roleOptions.map((item) => item.value),
  defaultRole,
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    ...initialForm,
    role: defaultRole || initialForm.role,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const visibleRoleOptions = roleOptions.filter((item) =>
    allowedRoles.includes(item.value),
  );

  const isSupportWorker = form.role === ROLES.SUPPORT_WORKER;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canCreate) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const body = {
        ...form,
      };

      if (activeCompanyId) {
        body.companyId = activeCompanyId;
      }

      if (!isSupportWorker) {
        delete body.workerProfile;
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to create user");
        return;
      }

      setForm({
        ...initialForm,
        role: defaultRole || initialForm.role,
      });
      router.refresh();
    } catch (requestError) {
      setError("Unable to create user right now.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!canCreate ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Select a company first to manage users.
          </p>
        ) : (
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
            {defaultRole ? null : (
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, role: event.target.value }))
                }
                className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {visibleRoleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            )}

            <Input
              required
              placeholder="First name"
              value={form.firstName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, firstName: event.target.value }))
              }
            />
            <Input
              required
              placeholder="Last name"
              value={form.lastName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, lastName: event.target.value }))
              }
            />
            <Input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
            />
            <Input
              required
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
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
            {/* 
              The following fields are only necessary for support workers because 
              the workerProfile fields (like jobTitle and employee code) are specific 
              to support worker roles and not applicable to general users. 
            */}
            {/* 
              For Support Workers, the employee code is always auto-generated and the job title typically defaults to "Support Worker".
              Having a "Job title" input here is redundant since selecting the "Support Worker" role already implies the job title, 
              and the field does not usually require user input. Thus, we don't display unnecessary or redundant fields for support workers.
            */}
            {isSupportWorker ? (
              <p className="md:col-span-2 text-xs text-zinc-500 dark:text-zinc-400">
                Employee code and job title are set automatically when creating
                a Support Worker.
              </p>
            ) : null}

            <div className="md:col-span-2">
              <Button type="submit" disabled={isSaving}>
                <UserPlus className="h-4 w-4" />
                {isSaving ? "Saving..." : "Create user"}
              </Button>
            </div>
            {error ? (
              <p className="md:col-span-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : null}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
