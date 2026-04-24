"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function formatDate(value) {
  if (!value) {
    return "—";
  }
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return d.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

const USER_STATUSES = ["active", "inactive", "suspended"];

const selectClassName =
  "h-10 w-full min-w-0 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900";

export function UserListTable({ users, isSuperAdmin }) {
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [createdSort, setCreatedSort] = useState("newest");

  const roleOptions = useMemo(() => {
    const names = new Set();
    for (const row of users) {
      const n = row.roleId?.name;
      if (n) {
        names.add(n);
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = q
      ? users.filter((row) => {
          const name =
            `${row.firstName || ""} ${row.lastName || ""}`.toLowerCase();
          const email = (row.email || "").toLowerCase();
          return name.includes(q) || email.includes(q);
        })
      : users;

    if (filterState) {
      rows = rows.filter((row) => (row.state || "") === filterState);
    }
    if (filterRole) {
      rows = rows.filter((row) => (row.roleId?.name || "") === filterRole);
    }
    if (filterStatus) {
      rows = rows.filter((row) => row.status === filterStatus);
    }
    return [...rows].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      if (Number.isNaN(ta) && Number.isNaN(tb)) {
        return 0;
      }
      if (Number.isNaN(ta)) {
        return 1;
      }
      if (Number.isNaN(tb)) {
        return -1;
      }
      return createdSort === "oldest" ? ta - tb : tb - ta;
    });
  }, [users, search, filterState, filterRole, filterStatus, createdSort]);

  const hasActiveFilters = Boolean(
    filterState || filterRole || filterStatus || createdSort !== "newest",
  );

  const clearFilters = () => {
    setFilterState("");
    setFilterRole("");
    setFilterStatus("");
    setCreatedSort("newest");
  };

  const emptyListMessage = (() => {
    const q = search.trim();
    if (q && hasActiveFilters) {
      return "No users match your search or filters.";
    }
    if (q) {
      return "No users match your search.";
    }
    if (hasActiveFilters) {
      return "No users match your filters.";
    }
    return "No users in this list.";
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle>User list</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            placeholder="Search by name or email…"
          />
        </div>

        <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Filters
            </p>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-zinc-600 dark:text-zinc-300"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              State
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className={selectClassName}
              >
                <option value="">All states</option>
                {AU_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Role
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={selectClassName}
              >
                <option value="">All roles</option>
                {roleOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Status
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={selectClassName}
              >
                <option value="">All statuses</option>
                {USER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Created
              <select
                value={createdSort}
                onChange={(e) => setCreatedSort(e.target.value)}
                className={selectClassName}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
              <tr>
                <th className="px-3 py-2">User ID</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">State</th>
                <th className="px-3 py-2">Role</th>
                {isSuperAdmin ? (
                  <th className="px-3 py-2">Role details</th>
                ) : null}
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Last login</th>
                <th className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 10 : 9}
                    className="px-3 py-6 text-center text-zinc-500 dark:text-zinc-400"
                  >
                    {emptyListMessage}
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row._id}
                    className="border-t border-zinc-200 dark:border-zinc-800"
                  >
                    <td className="px-3 py-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {row._id}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {row.firstName} {row.lastName}
                    </td>
                    <td className="px-3 py-2">{row.email}</td>
                    <td className="px-3 py-2">{row.phone || "—"}</td>
                    <td className="px-3 py-2">{row.state || "—"}</td>
                    <td className="px-3 py-2">
                      <Badge variant="secondary">
                        {row.roleId?.name || "—"}
                      </Badge>
                    </td>
                    {isSuperAdmin ? (
                      <td className="max-w-[220px] px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {row.roleId?.description || "—"}
                      </td>
                    ) : null}
                    <td className="px-3 py-2">
                      <Badge
                        variant={
                          row.status === "active" ? "success" : "warning"
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {formatDate(row.lastLoginAt)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {formatDate(row.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
