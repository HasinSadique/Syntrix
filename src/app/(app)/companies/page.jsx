import { ROLES } from "@/backend/constants/roles";
import { requireRoles } from "@/backend/auth/guards";
import { connectToDatabase } from "@/backend/db/mongoose";
import { Company } from "@/backend/models";
import { CompanyManagementClient } from "@/components/companies/company-management-client";

export default async function CompaniesPage() {
  const user = await requireRoles([ROLES.SUPER_ADMIN]);
  await connectToDatabase();

  const companies = await Company.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Company Management</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Company onboarding and management.
        </p>
      </div>
      <CompanyManagementClient
        companies={companies.map((company) => ({
          id: company._id.toString(),
          name: company.name,
          abn: company.abn,
          state: company.state,
          status: company.status,
        }))}
        selectedCompanyId={user.activeCompanyId || ""}
      />
    </div>
  );
}
