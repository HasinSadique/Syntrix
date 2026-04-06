"use client";

import { useState } from "react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Select } from "@/frontend/components/ui/select";
import { Textarea } from "@/frontend/components/ui/textarea";

const initialForm = {
  participantId: "",
  incidentType: "medical",
  severity: "low",
  description: "",
  incidentDate: "",
  status: "open",
};

export default function IncidentForm({ participants = [], onSubmit, loading }) {
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
        <Label>Participant</Label>
        <Select value={form.participantId} onChange={(e) => update("participantId", e.target.value)} required>
          <option value="">Select participant</option>
          {participants.map((participant) => (
            <option key={participant.id} value={participant.id}>
              {participant.fullName}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Incident Date</Label>
        <Input
          type="date"
          value={form.incidentDate}
          onChange={(e) => update("incidentDate", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Incident Type</Label>
        <Select value={form.incidentType} onChange={(e) => update("incidentType", e.target.value)}>
          <option value="medical">Medical</option>
          <option value="behavioural">Behavioural</option>
          <option value="medication">Medication</option>
          <option value="safety">Safety</option>
          <option value="other">Other</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Severity</Label>
        <Select value={form.severity} onChange={(e) => update("severity", e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} required />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" variant="accent" disabled={loading}>
          {loading ? "Submitting..." : "Submit Incident"}
        </Button>
      </div>
    </form>
  );
}
