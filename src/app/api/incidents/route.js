import { incidentController } from "@/backend/controllers/incidentController";

export async function GET(request) {
  return incidentController.listIncidents(request);
}

export async function POST(request) {
  return incidentController.createIncident(request);
}

export async function PATCH(request) {
  return incidentController.updateIncidentStatus(request);
}
