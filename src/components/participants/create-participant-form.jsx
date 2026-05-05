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
  preferredName: "",
  dob: "",
  gender: "prefer_not_to_say",
  ndisNumber: "",
  state: "NSW",
  phone: "",
  address: "",
  primaryDisability: "",
  secondaryDisability: "",
  medicalAlerts: "",
  highRiskFlags: "",
  epilepsyProtocol: "",
  managementType: "",
  staffRatio: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",
};

export function CreateParticipantForm({ canCreate, activeCompanyId }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [isDobFocused, setIsDobFocused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canCreate) {
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const medicalAlerts = form.medicalAlerts
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const highRiskFlags = form.highRiskFlags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const emergencyContact = {
        name: form.emergencyContactName.trim(),
        phone: form.emergencyContactPhone.trim(),
        relationship: form.emergencyContactRelationship.trim(),
      };
      const body = {
        ...form,
        medicalAlerts,
        highRiskFlags,
        emergencyContact,
      };
      delete body.emergencyContactName;
      delete body.emergencyContactPhone;
      delete body.emergencyContactRelationship;
      if (!body.managementType) {
        delete body.managementType;
      }
      if (!Object.values(emergencyContact).some(Boolean)) {
        delete body.emergencyContact;
      }

      if (activeCompanyId) {
        body.companyId = activeCompanyId;
      }

      const response = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
        ) : !isExpanded ? (
          <Button type="button" onClick={() => setIsExpanded(true)}>
            Onboard new participant
          </Button>
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
              placeholder="Preferred name"
              value={form.preferredName}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  preferredName: event.target.value,
                }))
              }
            />
            <Input
              required
              type={isDobFocused || form.dob ? "date" : "text"}
              placeholder="Date of Birth"
              value={form.dob}
              onFocus={() => setIsDobFocused(true)}
              onBlur={() => setIsDobFocused(false)}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dob: event.target.value }))
              }
            />
            <select
              value={form.gender}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, gender: event.target.value }))
              }
              className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="prefer_not_to_say">Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non_binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
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
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
            <Input
              placeholder="Primary disability"
              value={form.primaryDisability}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  primaryDisability: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Secondary disability"
              value={form.secondaryDisability}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  secondaryDisability: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Emergency contact name"
              value={form.emergencyContactName}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  emergencyContactName: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Emergency contact phone"
              value={form.emergencyContactPhone}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  emergencyContactPhone: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Emergency contact relationship"
              value={form.emergencyContactRelationship}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  emergencyContactRelationship: event.target.value,
                }))
              }
            />
            <select
              value={form.managementType}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  managementType: event.target.value,
                }))
              }
              className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">Management type</option>
              <option value="agency_managed">Agency managed</option>
              <option value="plan_managed">Plan managed</option>
              <option value="self_managed">Self managed</option>
            </select>
            <Input
              placeholder="Staff ratio (e.g. 1:1)"
              value={form.staffRatio}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, staffRatio: event.target.value }))
              }
            />
            <Input
              placeholder="Medical alerts (comma separated)"
              className="md:col-span-2"
              value={form.medicalAlerts}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  medicalAlerts: event.target.value,
                }))
              }
            />
            <Input
              placeholder="High-risk behaviour flags (comma separated)"
              className="md:col-span-2"
              value={form.highRiskFlags}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  highRiskFlags: event.target.value,
                }))
              }
            />
            <Input
              placeholder="Epilepsy protocol / critical medical instructions"
              className="md:col-span-2"
              value={form.epilepsyProtocol}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  epilepsyProtocol: event.target.value,
                }))
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
            <div className="md:col-span-2">
              <Button type="submit" disabled={isSaving}>
                <UserPlus className="h-4 w-4" />
                {isSaving ? "Saving..." : "Create participant"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="ml-2"
                onClick={() => {
                  setIsExpanded(false);
                  setError("");
                }}
              >
                Cancel
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
