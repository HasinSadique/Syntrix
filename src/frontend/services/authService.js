import { http } from "@/frontend/services/http";

export const authService = {
  registerCompany(payload) {
    return http.post("/auth/register-company", payload);
  },
  login(payload) {
    return http.post("/auth/login", payload);
  },
  loginSuperadmin(payload) {
    return http.post("/superadmin/login", payload);
  },
  logout() {
    return http.post("/auth/logout");
  },
  me() {
    return http.get("/auth/me");
  },
};
