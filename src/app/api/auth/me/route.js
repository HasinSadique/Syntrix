import { authController } from "@/backend/controllers/authController";

export async function GET(request) {
  return authController.me(request);
}
