import { http } from "@/frontend/services/http";

export const participantService = {
  list() {
    return http.get("/participants");
  },
  create(payload) {
    return http.post("/participants", payload);
  },
  update(participantId, payload) {
    return http.patch("/participants", { participantId, ...payload });
  },
};
