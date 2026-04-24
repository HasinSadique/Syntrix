import { requireRoles } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { CompanyOnboardingForm } from "@/components/companies/company-onboarding-form";

export default async function CompanyOnboardPage() {
  await requireRoles([ROLES.SUPER_ADMIN]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Company Onboarding</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Create and onboard a new company to the Syntrix platform.
        </p>
      </div>
      <CompanyOnboardingForm />
    </div>
  );
}
