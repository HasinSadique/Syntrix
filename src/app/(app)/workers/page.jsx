import mongoose from "mongoose";
import { requireAuthUser } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import { WorkerProfile } from "@/backend/models";
import { CreateUserForm } from "@/components/users/create-user-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    .limit(25)
    .populate("userId", "firstName lastName email state")
    .lean();

  const canCreate = [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN].includes(
    user.role,
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Support Workers</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Support worker profiles and availability overview.
        </p>
      </div>
      <CreateUserForm
        canCreate={canCreate}
        activeCompanyId={user.activeCompanyId || undefined}
        title="Add support worker"
        defaultRole={ROLES.SUPPORT_WORKER}
        allowedRoles={[ROLES.SUPPORT_WORKER]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Support worker list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {workers.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              No workers yet.
            </p>
          ) : (
            workers.map((worker) => (
              <div
                key={worker._id.toString()}
                className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div>
                  <p className="font-medium">
                    {worker.userId?.firstName} {worker.userId?.lastName}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {worker.jobTitle || "Support Worker"} -{" "}
                    {worker.employeeCode}
                  </p>
                </div>
                <Badge
                  variant={
                    worker.availabilityStatus === "available"
                      ? "success"
                      : "warning"
                  }
                >
                  {worker.availabilityStatus}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
