import { authController } from "@/backend/controllers/authController";

export async function POST() {
  return authController.logout();
}
