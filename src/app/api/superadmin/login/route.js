import { superAdminController } from "@/backend/controllers/superAdminController";

export async function POST(request) {
  return superAdminController.login(request);
}
