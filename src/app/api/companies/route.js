import { companyController } from "@/backend/controllers/companyController";

export async function GET(request) {
  return companyController.getProfile(request);
}

export async function PUT(request) {
  return companyController.updateProfile(request);
}
