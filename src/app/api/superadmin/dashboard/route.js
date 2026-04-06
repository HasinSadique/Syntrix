import { superAdminController } from "@/backend/controllers/superAdminController";

export async function GET(request) {
  return superAdminController.dashboard(request);
}
