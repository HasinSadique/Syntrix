"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/frontend/components/common/page-header";
import NoteForm from "@/frontend/components/forms/note-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/frontend/components/ui/table";
import { noteService } from "@/frontend/services/noteService";
import { participantService } from "@/frontend/services/participantService";
import { extractApiError } from "@/frontend/services/http";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const participantMap = useMemo(
    () => Object.fromEntries(participants.map((participant) => [participant.id, participant.fullName])),
    [participants],
  );

  const loadAll = async () => {
    try {
      const [notesRes, participantsRes] = await Promise.all([noteService.list(), participantService.list()]);
      setNotes(notesRes.data?.data || []);
      setParticipants(participantsRes.data?.data || []);
    } catch (err) {
      setError(extractApiError(err, "Failed to load notes"));
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createNote = async (payload) => {
    setSaving(true);
    setError("");
    try {
      await noteService.create(payload);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err, "Failed to create note"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Case Notes" description="Create and review participant case notes." />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Create Case Note</CardTitle>
        </CardHeader>
        <CardContent>
          <NoteForm participants={participants} onSubmit={createNote} loading={saving} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Service Date</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>{participantMap[note.participantId] || note.participantId}</TableCell>
                  <TableCell>{note.noteTitle}</TableCell>
                  <TableCell>{note.serviceDate}</TableCell>
                  <TableCell className="max-w-sm truncate">{note.noteDetails}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
