import { getUserFromRequest } from "@/backend/config/auth";

export function requireAuth(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  return user;
}

export function requireRole(user, roles = []) {
  if (!roles.includes(user.role)) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }
}

export function requireCompanyScope(user, companyId) {
  if (!companyId) return;
  if (user.role === "superadmin") return;
  if (user.companyId !== companyId) {
    const error = new Error("Cross-company access denied");
    error.status = 403;
    throw error;
  }
}
