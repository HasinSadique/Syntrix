"use client";

import { useState } from "react";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Select } from "@/frontend/components/ui/select";
import { Textarea } from "@/frontend/components/ui/textarea";

const initialForm = {
  participantId: "",
  noteTitle: "",
  noteDetails: "",
  serviceDate: "",
};

export default function NoteForm({ participants = [], onSubmit, loading }) {
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
        <Label>Service Date</Label>
        <Input
          type="date"
          value={form.serviceDate}
          onChange={(e) => update("serviceDate", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Note Title</Label>
        <Input value={form.noteTitle} onChange={(e) => update("noteTitle", e.target.value)} required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Note Details</Label>
        <Textarea value={form.noteDetails} onChange={(e) => update("noteDetails", e.target.value)} required />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Submit Note"}
        </Button>
      </div>
    </form>
  );
}
