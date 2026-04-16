import { ComingSoonPanel } from "@/components/common/coming-soon-panel";
import { requireAuthUser } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { Card, CardContent } from "@/components/ui/card";

export default async function CompliancePage() {
  const user = await requireAuthUser();

  if (user.role === ROLES.SUPER_ADMIN && !user.activeCompanyId) {
    return (
      <Card>
        <CardContent className="pt-5">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Select a company from sidebar `Companies` to view compliance management.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ComingSoonPanel
      title="Compliance"
      description="Compliance management module is under development. This workspace will open for the selected company."
    />
  );
}