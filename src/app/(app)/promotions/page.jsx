import { ComingSoonPanel } from "@/components/common/coming-soon-panel";
import { requireRoles } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";

export default async function PromotionsPage() {
  await requireRoles([ROLES.SUPER_ADMIN]);

  return (
    <ComingSoonPanel
      title="Promotions"
      description="Promotions module is coming soon. Campaigns and promotional workflows will appear here."
    />
  );
}
