"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/frontend/utils/cn";
import { getLinksForRole } from "@/frontend/utils/navigation";

export default function Sidebar({
  role = "company_admin",
  brandName = "Syntrix",
  workspaceLabel = "Company Workspace",
}) {
  const pathname = usePathname();
  const links = getLinksForRole(role);

  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
      <div className="p-5">
        <h2 className="text-xl font-bold text-[#1E3A8A]">{brandName}</h2>
        <p className="mt-1 text-xs text-slate-500">{workspaceLabel}</p>
      </div>
      <nav className="space-y-1 px-3 pb-4">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-blue-50 text-[#1E3A8A]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
