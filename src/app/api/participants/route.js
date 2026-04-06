import { participantController } from "@/backend/controllers/participantController";

export async function GET(request) {
  return participantController.listParticipants(request);
}

export async function POST(request) {
  return participantController.createParticipant(request);
}

export async function PATCH(request) {
  return participantController.updateParticipant(request);
}
