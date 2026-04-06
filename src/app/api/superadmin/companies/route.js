import { superAdminController } from "@/backend/controllers/superAdminController";

export async function GET(request) {
  return superAdminController.listCompanies(request);
}

export async function PATCH(request) {
  return superAdminController.updateCompanyStatus(request);
}
