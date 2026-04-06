import { http } from "@/frontend/services/http";

export const incidentService = {
  list() {
    return http.get("/incidents");
  },
  create(payload) {
    return http.post("/incidents", payload);
  },
  updateStatus(incidentId, status) {
    return http.patch("/incidents", { incidentId, status });
  },
};
