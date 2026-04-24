import mongoose from "mongoose";
import { requireAuthUser } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import { Participant } from "@/backend/models";
import { CreateParticipantForm } from "@/components/participants/create-participant-form";
import { ParticipantListTable } from "@/components/participants/participant-list-table";
import { Card, CardContent } from "@/components/ui/card";

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
    .limit(500)
    .lean();

  const participantsPayload = JSON.parse(JSON.stringify(participants));

  const canCreate = [
    ROLES.SUPER_ADMIN,
    ROLES.COMPANY_ADMIN,
    ROLES.STATE_MANAGER,
    ROLES.CARE_MANAGER,
  ].includes(user.role);
  const canViewProfile = [
    ROLES.COMPANY_ADMIN,
    ROLES.STATE_MANAGER,
    ROLES.CARE_MANAGER,
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

      <ParticipantListTable
        participants={participantsPayload}
        canViewProfile={canViewProfile}
      />
    </div>
  );
}
