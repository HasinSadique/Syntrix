import { http } from "@/frontend/services/http";

export const assignmentService = {
  list() {
    return http.get("/assignments");
  },
  create(payload) {
    return http.post("/assignments", payload);
  },
};
