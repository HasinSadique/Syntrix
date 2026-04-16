import mongoose from "mongoose";
import { requireAuthUser } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import { Participant } from "@/backend/models";
import { CreateParticipantForm } from "@/components/participants/create-participant-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ParticipantsPage() {
  const user = await requireAuthUser();

  const scopedCompanyId =
    user.role === ROLES.SUPER_ADMIN ? user.activeCompanyId : user.companyId;

  if (!scopedCompanyId) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Participants</h2>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Super Admin must select a company first from sidebar `Companies`
              before managing participants.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  await connectToDatabase();

  const filter = { companyId: new mongoose.Types.ObjectId(scopedCompanyId) };

  const participants = await Participant.find(filter)
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();

  const canCreate = [
    ROLES.SUPER_ADMIN,
    ROLES.COMPANY_ADMIN,
    ROLES.STATE_MANAGER,
    ROLES.SUPPORT_COORDINATOR,
  ].includes(user.role);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Participants</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Participant onboarding and management.
        </p>
      </div>
      <CreateParticipantForm
        canCreate={canCreate}
        activeCompanyId={user.activeCompanyId || undefined}
      />

      <Card>
        <CardHeader>
          <CardTitle>Participant list</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {participants.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No participants yet.
              </p>
            ) : (
              participants.map((participant) => (
                <div
                  key={participant._id.toString()}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                >
                  <div>
                    <p className="font-medium">
                      {participant.firstName} {participant.lastName}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      NDIS #{participant.ndisNumber} - {participant.state}
                    </p>
                  </div>
                  <Badge
                    variant={
                      participant.status === "active" ? "success" : "warning"
                    }
                  >
                    {participant.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
