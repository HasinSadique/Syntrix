"use client";

import Link from "next/link";
import {
  CircleDollarSign,
  FileClock,
  NotebookText,
  Pencil,
  Siren,
  UserPlus,
} from "lucide-react";
import { useParticipantProfileAccordion } from "@/components/participants/participant-profile-accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ParticipantProfileQuickControls({ participantId }) {
  const { expandSection } = useParticipantProfileAccordion();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Controls</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        <Button
          type="button"
          variant="outline"
          className="justify-start"
          onClick={() => expandSection("personal-medical")}
        >
          <Pencil className="h-4 w-4" />
          Edit personal and care details
        </Button>
        <Button
          type="button"
          variant="outline"
          className="justify-start"
          onClick={() => expandSection("funding-management")}
        >
          <Pencil className="h-4 w-4" />
          Edit funding and service details
        </Button>
        <Button
          type="button"
          variant="outline"
          className="justify-start"
          onClick={() => expandSection("participant-logs")}
        >
          <FileClock className="h-4 w-4" />
          View participant logs
        </Button>
        <Button asChild variant="outline" className="justify-start">
          <Link href={`/participants/${participantId}/support-setup`}>
            <UserPlus className="h-4 w-4" />
            Setup support
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="justify-start"
          onClick={() =>
            expandSection("care-documentation", { scrollToId: "shift-notes" })
          }
        >
          <NotebookText className="h-4 w-4" />
          View shift notes
        </Button>
        <Button
          type="button"
          variant="outline"
          className="justify-start"
          onClick={() =>
            expandSection("care-documentation", {
              scrollToId: "incident-history",
            })
          }
        >
          <Siren className="h-4 w-4" />
          View incident reports
        </Button>
        <Button
          type="button"
          variant="outline"
          className="justify-start"
          onClick={() => expandSection("expenses")}
        >
          <CircleDollarSign className="h-4 w-4" />
          View expenses
        </Button>
      </CardContent>
    </Card>
  );
}
