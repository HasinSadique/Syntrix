import { ComingSoonPanel } from "@/components/common/coming-soon-panel";
import { requireRoles } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";

export default async function SubscriptionPage() {
    await requireRoles([ROLES.SUPER_ADMIN]);

    return ( <
        ComingSoonPanel title = "Subscription"
        description = "Subscription module is coming soon. Billing plans and billing controls will be added here." /
        >
    );
}