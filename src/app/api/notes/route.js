import { noteController } from "@/backend/controllers/noteController";

export async function GET(request) {
  return noteController.listNotes(request);
}

export async function POST(request) {
  return noteController.createNote(request);
}
