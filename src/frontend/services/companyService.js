import { http } from "@/frontend/services/http";

export const companyService = {
  getProfile() {
    return http.get("/companies");
  },
  updateProfile(payload) {
    return http.put("/companies", payload);
  },
  listAllForSuperadmin() {
    return http.get("/superadmin/companies");
  },
  updateStatus(companyId, status) {
    return http.patch("/superadmin/companies", { companyId, status });
  },
  getSuperadminDashboard() {
    return http.get("/superadmin/dashboard");
  },
};
