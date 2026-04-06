import { http } from "@/frontend/services/http";

export const noteService = {
  list() {
    return http.get("/notes");
  },
  create(payload) {
    return http.post("/notes", payload);
  },
};
