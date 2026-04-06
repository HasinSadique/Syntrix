"use client";

import { useState } from "react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Select } from "@/frontend/components/ui/select";
import { Textarea } from "@/frontend/components/ui/textarea";

const initialForm = {
  fullName: "",
  ndisNumber: "",
  dateOfBirth: "",
  gender: "female",
  phone: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  supportNeeds: "",
  status: "active",
};

export default function ParticipantForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialForm);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialForm);
  };

  return (
    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>NDIS Number</Label>
        <Input value={form.ndisNumber} onChange={(e) => update("ndisNumber", e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Date of Birth</Label>
        <Input
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => update("dateOfBirth", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Gender</Label>
        <Select value={form.gender} onChange={(e) => update("gender", e.target.value)}>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={form.status} onChange={(e) => update("status", e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Address</Label>
        <Input value={form.address} onChange={(e) => update("address", e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Emergency Contact Name</Label>
        <Input
          value={form.emergencyContactName}
          onChange={(e) => update("emergencyContactName", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Emergency Contact Phone</Label>
        <Input
          value={form.emergencyContactPhone}
          onChange={(e) => update("emergencyContactPhone", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Support Needs</Label>
        <Textarea value={form.supportNeeds} onChange={(e) => update("supportNeeds", e.target.value)} required />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" variant="secondary" disabled={loading}>
          {loading ? "Saving..." : "Create Participant"}
        </Button>
      </div>
    </form>
  );
}
