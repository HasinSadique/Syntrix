"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/frontend/components/common/sidebar";
import Navbar from "@/frontend/components/common/navbar";
import { useCurrentUser } from "@/frontend/hooks/useCurrentUser";
import { companyService } from "@/frontend/services/companyService";

export default function DashboardLayout({ children }) {
  const { user, loading } = useCurrentUser();
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    async function loadCompanyContext() {
      if (!user || user.role === "superadmin") {
        setCompanyName("");
        return;
      }

      try {
        const response = await companyService.getProfile();
        const company = response.data?.data?.company;
        setCompanyName(company?.companyName || "");
      } catch {
        setCompanyName("");
      }
    }

    loadCompanyContext();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading workspace...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Session expired. Please login again.
      </div>
    );
  }

  const brandName =
    user.role === "superadmin" ? "Syntrix" : companyName || "Company Workspace";
  const workspaceLabel =
    user.role === "superadmin" ? "Platform Workspace" : "Company Workspace";
  const title =
    user.role === "superadmin" ? "Syntrix Platform" : companyName || "Company Workspace";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role={user.role}
        brandName={brandName}
        workspaceLabel={workspaceLabel}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar
          title={title}
          companyName={companyName}
          brandName={brandName}
          workspaceLabel={workspaceLabel}
          user={user}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
