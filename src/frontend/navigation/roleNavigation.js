import { ROLES } from "@/backend/constants/roles";

export const companyWorkspaceItems = [
  { title: "User Management", href: "/users", icon: "user-cog" },
  { title: "Participants", href: "/participants", icon: "users-round" },
  { title: "Support Workers", href: "/workers", icon: "briefcase-business" },
  {
    title: "Roster Mgt.",
    href: "/roster",
    icon: "calendar-range",
    comingSoon: true
  },
  {
    title: "Compliance",
    href: "/compliance",
    icon: "shield-check",
    comingSoon: true
  },
  {
    title: "Document Center",
    href: "/documents",
    icon: "folder-archive",
    comingSoon: true
  }
];

export const navigationByRole = {
  [ROLES.SUPER_ADMIN]: [{ title: "Dashboard", href: "/dashboard", icon: "layout-dashboard" }],
  [ROLES.COMPANY_ADMIN]: [
    { title: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
    ...companyWorkspaceItems
  ],
  [ROLES.STATE_MANAGER]: [
    { title: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
    ...companyWorkspaceItems
  ],
  [ROLES.CARE_MANAGER]: [
    { title: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
    ...companyWorkspaceItems
  ],
  [ROLES.SUPPORT_WORKER]: [
    { title: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
    { title: "Schedule", href: "/schedule", icon: "calendar-range" },
    {
      title: "Incidents",
      href: "/compliance",
      icon: "triangle-alert",
      comingSoon: true
    },
    { title: "Profile", href: "/profile", icon: "user-circle" }
  ]
};