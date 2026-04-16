import mongoose from "mongoose";
import { requireAuthUser } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import { User } from "@/backend/models";
import { CreateUserForm } from "@/components/users/create-user-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    .limit(100)
    .populate("roleId", "name description")
    .populate("companyId", "name")
    .lean();

  const allowedRoles = isSuperAdmin
    ? [
        ROLES.COMPANY_ADMIN,
        ROLES.STATE_MANAGER,
        ROLES.SUPPORT_COORDINATOR,
        ROLES.SUPPORT_WORKER,
      ]
    : [ROLES.STATE_MANAGER, ROLES.SUPPORT_COORDINATOR, ROLES.SUPPORT_WORKER];

  const canCreate =
    [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN].includes(user.role) &&
    Boolean(selectedCompanyId);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">User Management</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          User onboarding and role management.
        </p>
      </div>

      <CreateUserForm
        canCreate={canCreate}
        activeCompanyId={selectedCompanyId || undefined}
        title="Add user"
        allowedRoles={allowedRoles}
      />

      <Card>
        <CardHeader>
          <CardTitle>User list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No users found for this view.
            </p>
          ) : (
            users.map((item) => (
              <div
                key={item._id.toString()}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div>
                  <p className="font-medium">
                    {item.firstName} {item.lastName}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.email}
                    {item.companyId?.name
                      ? ` - ${item.companyId.name}`
                      : " - Platform"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {item.roleId?.name || "unknown"}
                  </Badge>
                  <Badge
                    variant={item.status === "active" ? "success" : "warning"}
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
