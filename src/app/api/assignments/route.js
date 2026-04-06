import { assignmentController } from "@/backend/controllers/assignmentController";

export async function GET(request) {
  return assignmentController.listAssignments(request);
}

export async function POST(request) {
  return assignmentController.createAssignment(request);
}
