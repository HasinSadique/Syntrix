import mongoose from "mongoose";
import { requireAuthUser } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import { WorkerProfile } from "@/backend/models";
import { WorkerListTable } from "@/components/workers/worker-list-table";
import { Card, CardContent } from "@/components/ui/card";

export default async function WorkersPage() {
  const user = await requireAuthUser();

  const scopedCompanyId =
    user.role === ROLES.SUPER_ADMIN ? user.activeCompanyId : user.companyId;

  if (!scopedCompanyId) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Support Workers</h2>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Super Admin must select a company first from sidebar `Companies`
              before managing support workers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  await connectToDatabase();

  const filter = { companyId: new mongoose.Types.ObjectId(scopedCompanyId) };

  const workers = await WorkerProfile.find(filter)
    .sort({ createdAt: -1 })
    .limit(500)
    .populate("userId", "firstName lastName email state phone status")
    .lean();

  const workersPayload = JSON.parse(JSON.stringify(workers));
  const canViewProfile = [
    ROLES.SUPER_ADMIN,
    ROLES.COMPANY_ADMIN,
    ROLES.STATE_MANAGER,
    ROLES.CARE_MANAGER,
  ].includes(user.role);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Support Workers</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Support worker profiles and availability overview.
        </p>
      </div>

      <WorkerListTable workers={workersPayload} canViewProfile={canViewProfile} />
    </div>
  );
}
