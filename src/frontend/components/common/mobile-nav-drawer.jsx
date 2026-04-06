"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/components/ui/dialog";
import { cn } from "@/frontend/utils/cn";
import { getLinksForRole } from "@/frontend/utils/navigation";

export default function MobileNavDrawer({
  role,
  brandName,
  workspaceLabel,
  onLogout,
  logoutLoading,
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const links = getLinksForRole(role);

  const handleLogout = async () => {
    await onLogout();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="left-0 top-0 h-screen max-w-[300px] translate-x-0 translate-y-0 rounded-none border-r border-slate-200 p-0">
        <div className="flex h-full flex-col bg-white">
          <DialogHeader className="border-b border-slate-100 p-5 pr-12">
            <DialogTitle>{brandName}</DialogTitle>
            <p className="text-xs text-slate-500">{workspaceLabel}</p>
          </DialogHeader>

          <nav className="space-y-1 p-3">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
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

          <div className="mt-auto border-t border-slate-100 p-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
