import { userController } from "@/backend/controllers/userController";

export async function GET(request) {
  return userController.listUsers(request);
}

export async function POST(request) {
  return userController.createUser(request);
}

export async function PATCH(request) {
  return userController.updateUserStatus(request);
}
