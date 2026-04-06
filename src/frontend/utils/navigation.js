export const linksByRole = {
  company_admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/staff", label: "Staff" },
    { href: "/participants", label: "Participants" },
    { href: "/assignments", label: "Assignments" },
    { href: "/notes", label: "Case Notes" },
    { href: "/incidents", label: "Incidents" },
    { href: "/company-profile", label: "Company Profile" },
  ],
  support_worker: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/participants", label: "Participants" },
    { href: "/assignments", label: "Assignments" },
    { href: "/notes", label: "Case Notes" },
    { href: "/incidents", label: "Incidents" },
  ],
  manager: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/staff", label: "Staff" },
    { href: "/participants", label: "Participants" },
    { href: "/notes", label: "Case Notes" },
    { href: "/incidents", label: "Incidents" },
  ],
  coordinator: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/staff", label: "Staff" },
    { href: "/participants", label: "Participants" },
    { href: "/assignments", label: "Assignments" },
    { href: "/notes", label: "Case Notes" },
    { href: "/incidents", label: "Incidents" },
  ],
};

export const superadminLinks = [
  { href: "/superadmin-dashboard", label: "Platform Dashboard" },
  { href: "/superadmin-companies", label: "Companies" },
];

export function getLinksForRole(role) {
  if (role === "superadmin") return superadminLinks;
  return linksByRole[role] || linksByRole.support_worker;
}
