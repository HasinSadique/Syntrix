import { authController } from "@/backend/controllers/authController";
import { companyService } from "@/backend/services/companyService";
import { errorResponse, successResponse } from "@/backend/utils/response";
import { requireAuth, requireRole } from "@/backend/utils/guards";

export const superAdminController = {
  async login(request) {
    return authController.loginSuperadmin(request);
  },

  async dashboard(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["superadmin"]);

      const stats = await companyService.getPlatformStats();
      const companies = await companyService.listCompanies();

      return successResponse(
        {
          stats,
          recentCompanies: companies.slice(0, 5),
        },
        "Superadmin dashboard loaded",
      );
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async listCompanies(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["superadmin"]);
      const companies = await companyService.listCompanies();
      return successResponse(companies, "Companies loaded");
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async updateCompanyStatus(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["superadmin"]);
      const body = await request.json();
      const { companyId, status } = body;
      if (!companyId || !status) {
        return errorResponse("companyId and status are required", 400);
      }
      const company = await companyService.updateCompanyStatus(companyId, status);
      return successResponse(company, "Company status updated");
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },
};
