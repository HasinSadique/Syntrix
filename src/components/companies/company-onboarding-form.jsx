"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialForm = {
  name: "",
  abn: "",
  email: "",
  phone: "",
  address: "",
  state: "NSW",
  status: "active"
};

export function CompanyOnboardingForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateCompany(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to create company");
        return;
      }

      router.push("/companies");
      router.refresh();
    } catch (requestError) {
      setError("Unable to create company right now.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader className="space-y-3">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link href="/companies">
            <ArrowLeft className="h-4 w-4" />
            Back to companies
          </Link>
        </Button>
        <CardTitle>Onboard new company</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreateCompany}>
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
            {["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"].map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
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
              {isSaving ? "Onboarding..." : "Create company"}
            </Button>
          </div>
          {error ? (
            <p className="md:col-span-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
