export const ROLES = Object.freeze({
    SUPER_ADMIN: "super_admin",
    COMPANY_ADMIN: "company_admin",
    STATE_MANAGER: "state_manager",
    CARE_MANAGER: "care_manager",
    SUPPORT_WORKER: "support_worker",
});

export const ROLE_OPTIONS = [
    ROLES.SUPER_ADMIN,
    ROLES.COMPANY_ADMIN,
    ROLES.STATE_MANAGER,
    ROLES.CARE_MANAGER,
    ROLES.SUPPORT_WORKER,
];

export const ROLE_LABELS = {
    [ROLES.SUPER_ADMIN]: "Super Admin",
    [ROLES.COMPANY_ADMIN]: "Company Admin",
    [ROLES.STATE_MANAGER]: "State Manager",
    [ROLES.CARE_MANAGER]: "Care Manager",
    [ROLES.SUPPORT_WORKER]: "Support Worker",
};