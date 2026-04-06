import { authService } from "@/backend/services/authService";
import { errorResponse, successResponse } from "@/backend/utils/response";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getUserFromRequest,
  signToken,
} from "@/backend/config/auth";

export const authController = {
  async registerCompany(request) {
    try {
      const body = await request.json();
      const result = await authService.registerCompany(body);
      return successResponse(result, "Company registered successfully", 201);
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async login(request) {
    try {
      const body = await request.json();
      const { user, redirectPath } = await authService.login(body);

      const token = signToken({
        userId: user.id,
        companyId: user.companyId,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
      });

      const response = successResponse({ user, redirectPath }, "Login successful");
      response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
      return response;
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async loginSuperadmin(request) {
    try {
      const body = await request.json();
      const { user, redirectPath } = await authService.loginSuperadmin(body);
      const token = signToken({
        userId: user.id,
        role: "superadmin",
        name: user.name,
        email: user.email,
      });

      const response = successResponse({ user, redirectPath }, "Superadmin login successful");
      response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
      return response;
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async logout() {
    try {
      const response = successResponse(null, "Logged out successfully");
      response.cookies.set(AUTH_COOKIE_NAME, "", {
        ...getAuthCookieOptions(),
        maxAge: 0,
      });
      return response;
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  },

  async me(request) {
    try {
      const user = getUserFromRequest(request);
      if (!user) {
        return errorResponse("Unauthorized", 401);
      }
      return successResponse(user, "Current user loaded");
    } catch (error) {
      return errorResponse(error.message, 500);
    }
  },
};
