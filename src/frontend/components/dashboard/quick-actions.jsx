import Link from "next/link";

const actionsByRole = {
  company_admin: [
    { href: "/staff", label: "Add staff member", color: "hover:border-[#1E3A8A]" },
    { href: "/participants", label: "Add participant", color: "hover:border-[#14B8A6]" },
    { href: "/assignments", label: "Create assignment", color: "hover:border-[#2563EB]" },
    { href: "/incidents", label: "Review incidents", color: "hover:border-[#F97316]" },
  ],
  support_worker: [
    { href: "/participants", label: "View assigned participants", color: "hover:border-[#14B8A6]" },
    { href: "/assignments", label: "View my assignments", color: "hover:border-[#2563EB]" },
    { href: "/notes", label: "Create case note", color: "hover:border-[#1E3A8A]" },
    { href: "/incidents", label: "Submit incident", color: "hover:border-[#F97316]" },
  ],
  manager: [
    { href: "/staff", label: "Review staff", color: "hover:border-[#1E3A8A]" },
    { href: "/participants", label: "Monitor participants", color: "hover:border-[#14B8A6]" },
    { href: "/notes", label: "Review notes", color: "hover:border-[#2563EB]" },
    { href: "/incidents", label: "Review incidents", color: "hover:border-[#F97316]" },
  ],
  coordinator: [
    { href: "/participants", label: "Participant oversight", color: "hover:border-[#14B8A6]" },
    { href: "/assignments", label: "Manage assignments", color: "hover:border-[#2563EB]" },
    { href: "/notes", label: "Review case notes", color: "hover:border-[#1E3A8A]" },
    { href: "/incidents", label: "Track incidents", color: "hover:border-[#F97316]" },
  ],
};

export default function QuickActions({ role = "support_worker" }) {
  const actions = actionsByRole[role] || actionsByRole.support_worker;
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={`rounded-lg border border-slate-200 bg-white p-4 text-sm transition ${action.color}`}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
