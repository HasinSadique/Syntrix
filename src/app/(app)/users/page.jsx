import mongoose from "mongoose";
import { requireAuthUser } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import { User } from "@/backend/models";
import { CreateUserForm } from "@/components/users/create-user-form";
import { UserListTable } from "@/components/users/user-list-table";
import { Card, CardContent } from "@/components/ui/card";

export default async function UsersPage() {
  const user = await requireAuthUser();
  await connectToDatabase();

  const filter = {};
  const isSuperAdmin = user.role === ROLES.SUPER_ADMIN;
  const selectedCompanyId = isSuperAdmin
    ? user.activeCompanyId
    : user.companyId;

  if (!selectedCompanyId && isSuperAdmin) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Select a company from the sidebar `Companies` menu first to manage
              users.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedCompanyId) {
    filter.companyId = new mongoose.Types.ObjectId(selectedCompanyId);
  } else {
    return (
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You are not assigned to a company.
          </p>
        </CardContent>
      </Card>
    );
  }

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .limit(500)
    .populate("roleId", "name description")
    .populate("companyId", "name")
    .lean();

  const usersPayload = JSON.parse(JSON.stringify(users));

  const allowedRoles = isSuperAdmin
    ? [
        ROLES.COMPANY_ADMIN,
        ROLES.STATE_MANAGER,
        ROLES.CARE_MANAGER,
        ROLES.SUPPORT_WORKER,
      ]
    : user.role === ROLES.COMPANY_ADMIN
      ? [ROLES.STATE_MANAGER, ROLES.CARE_MANAGER, ROLES.SUPPORT_WORKER]
      : user.role === ROLES.STATE_MANAGER
        ? [ROLES.CARE_MANAGER, ROLES.SUPPORT_WORKER]
        : [];

  const canCreateUsers =
    [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.STATE_MANAGER].includes(
      user.role,
    ) && Boolean(selectedCompanyId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">User Management</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          User onboarding and role management.
        </p>
      </div>

      {canCreateUsers && (
        <CreateUserForm
          canCreate
          activeCompanyId={selectedCompanyId || undefined}
          title="Add user"
          allowedRoles={allowedRoles}
        />
      )}

      <UserListTable users={usersPayload} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
