"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import { authService } from "@/frontend/services/authService";
import MobileNavDrawer from "@/frontend/components/common/mobile-nav-drawer";

function toLabel(role) {
  return (role || "user").replaceAll("_", " ");
}

export default function Navbar({
  title,
  user,
  companyName = "",
  brandName = "Workspace",
  workspaceLabel = "Workspace",
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-start gap-3">
          <MobileNavDrawer
            role={user?.role}
            brandName={brandName}
            workspaceLabel={workspaceLabel}
            onLogout={onLogout}
            logoutLoading={loading}
          />
          <div>
            <h1 className="text-lg font-semibold text-[#1E3A8A]">{title}</h1>
            <p className="text-xs text-slate-500">
              {user?.fullName || user?.name || "User"} ({toLabel(user?.role)})
              {user?.role !== "superadmin" && companyName
                ? ` - ${companyName}`
                : ""}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onLogout}
          disabled={loading}
          className="hidden lg:inline-flex"
        >
          {loading ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </header>
  );
}
