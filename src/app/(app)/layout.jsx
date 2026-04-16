import { requireAuthUser } from "@/backend/auth/guards";
import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import { Company } from "@/backend/models";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }) {
  const user = await requireAuthUser();
  let companyOptions = [];

  if (user.role === ROLES.SUPER_ADMIN) {
    await connectToDatabase();
    const companies = await Company.find({})
      .sort({ name: 1 })
      .select("name state status")
      .lean();

    companyOptions = companies.map((company) => ({
      id: company._id.toString(),
      name: company.name,
      state: company.state,
      status: company.status
    }));
  }

  return (
    <AppShell user={user} companyOptions={companyOptions}>
      {children}
    </AppShell>
  );
}
