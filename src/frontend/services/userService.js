import { http } from "@/frontend/services/http";

export const userService = {
  list(params = {}) {
    return http.get("/users", { params });
  },
  create(payload) {
    return http.post("/users", payload);
  },
  updateStatus(userId, status) {
    return http.patch("/users", { userId, status });
  },
};
