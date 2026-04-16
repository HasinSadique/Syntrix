"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialForm = {
  firstName: "",
  lastName: "",
  dob: "",
  ndisNumber: "",
  state: "NSW",
  phone: "",
  address: ""
};

export function CreateParticipantForm({ canCreate, activeCompanyId }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canCreate) {
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const body = {
        ...form
      };

      if (activeCompanyId) {
        body.companyId = activeCompanyId;
      }

      const response = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to create participant");
        return;
      }

      setForm(initialForm);
      router.refresh();
    } catch (requestError) {
      setError("Unable to create participant right now.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add participant</CardTitle>
      </CardHeader>
      <CardContent>
        {!canCreate ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You do not have permission to add participants.
          </p>
        ) : (
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
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
              type="date"
              value={form.dob}
              onChange={(event) => setForm((prev) => ({ ...prev, dob: event.target.value }))}
            />
            <Input
              required
              placeholder="NDIS number"
              value={form.ndisNumber}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, ndisNumber: event.target.value }))
              }
            />
            <select
              value={form.state}
              onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
              className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"].map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <Input
              placeholder="Address"
              className="md:col-span-2"
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, address: event.target.value }))
              }
            />
            <div className="md:col-span-2">
              <Button type="submit" disabled={isSaving}>
                <UserPlus className="h-4 w-4" />
                {isSaving ? "Saving..." : "Create participant"}
              </Button>
            </div>
            {error ? (
              <p className="md:col-span-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : null}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
