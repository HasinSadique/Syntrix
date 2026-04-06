import { authController } from "@/backend/controllers/authController";

export async function POST(request) {
  return authController.registerCompany(request);
}
