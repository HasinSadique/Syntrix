export const ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  COMPANY_ADMIN: "company_admin",
  STATE_MANAGER: "state_manager",
  SUPPORT_COORDINATOR: "support_coordinator",
  SUPPORT_WORKER: "support_worker"
});

export const ROLE_OPTIONS = [
  ROLES.SUPER_ADMIN,
  ROLES.COMPANY_ADMIN,
  ROLES.STATE_MANAGER,
  ROLES.SUPPORT_COORDINATOR,
  ROLES.SUPPORT_WORKER
];

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.COMPANY_ADMIN]: "Company Admin",
  [ROLES.STATE_MANAGER]: "State Manager",
  [ROLES.SUPPORT_COORDINATOR]: "Support Coordinator",
  [ROLES.SUPPORT_WORKER]: "Support Worker"
};
