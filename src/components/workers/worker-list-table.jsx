"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function formatDate(value) {
  if (!value) {
    return "—";
  }
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return d.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function WorkerListTable({ workers, canViewProfile = false }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return workers.filter((row) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : (row.userId?.status || "").toLowerCase() === statusFilter;
      const matchesAvailability =
        availabilityFilter === "all"
          ? true
          : (row.availabilityStatus || "").toLowerCase() === availabilityFilter;
      const matchesState =
        stateFilter === "all"
          ? true
          : (row.userId?.state || "").toUpperCase() === stateFilter;
      if (!matchesStatus || !matchesAvailability || !matchesState) {
        return false;
      }
      if (!q) {
        return true;
      }
      const profileId = (row._id || "").toLowerCase();
      const code = (row.employeeCode || "").toLowerCase();
      const userId = (row.userId?._id || "").toString().toLowerCase();
      const email = (row.userId?.email || "").toLowerCase();
      const name =
        `${row.userId?.firstName || ""} ${row.userId?.lastName || ""}`.toLowerCase();
      return (
        profileId.includes(q) ||
        code.includes(q) ||
        userId.includes(q) ||
        email.includes(q) ||
        name.includes(q)
      );
    });
  }, [workers, search, statusFilter, availabilityFilter, stateFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support worker list</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              placeholder="Search by employee code, profile ID, user ID, name, or email..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="all">All user status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value)}
            className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="all">All availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="leave">Leave</option>
          </select>
          <select
            value={stateFilter}
            onChange={(event) => setStateFilter(event.target.value)}
            className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900 md:col-start-3"
          >
            <option value="all">All states</option>
            {["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"].map(
              (state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[1020px] text-center text-sm">
            <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
              <tr>
                <th className="px-3 py-2 align-middle text-center">Profile ID</th>
                <th className="px-3 py-2 align-middle text-center">Employee code</th>
                <th className="px-3 py-2 align-middle text-center">User ID</th>
                <th className="px-3 py-2 align-middle text-center">Name</th>
                <th className="px-3 py-2 align-middle text-center">Email</th>
                <th className="px-3 py-2 align-middle text-center">User state</th>
                <th className="px-3 py-2 align-middle text-center">User status</th>
                <th className="px-3 py-2 align-middle text-center">Employment</th>
                <th className="px-3 py-2 align-middle text-center">Job title</th>
                <th className="px-3 py-2 align-middle text-center">Availability</th>
                <th className="px-3 py-2 align-middle text-center">Joined</th>
                <th className="px-3 py-2 align-middle text-center">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={12}
                    className="px-3 py-6 align-middle text-center text-zinc-500 dark:text-zinc-400"
                  >
                    No support workers match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row._id}
                    className="border-t border-zinc-200 dark:border-zinc-800"
                  >
                    <td className="px-3 py-2 align-middle text-center font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {canViewProfile ? (
                        <Link
                          href={`/workers/${row._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-600 underline-offset-2 hover:underline dark:text-violet-400"
                        >
                          {row._id}
                        </Link>
                      ) : (
                        row._id
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle text-center font-mono text-xs font-medium">
                      {row.employeeCode}
                    </td>
                    <td className="px-3 py-2 align-middle text-center font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {row.userId?._id || "—"}
                    </td>
                    <td className="px-3 py-2 align-middle text-center font-medium">
                      {row.userId?.firstName} {row.userId?.lastName}
                    </td>
                    <td className="px-3 py-2 align-middle text-center">{row.userId?.email || "—"}</td>
                    <td className="px-3 py-2 align-middle text-center">{row.userId?.state || "—"}</td>
                    <td className="px-3 py-2 align-middle text-center">
                      {row.userId?.status ? (
                        <Badge
                          variant={
                            row.userId.status === "active" ? "success" : "warning"
                          }
                        >
                          {row.userId.status}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle text-center">{row.employmentType || "—"}</td>
                    <td className="px-3 py-2 align-middle text-center">{row.jobTitle || "—"}</td>
                    <td className="px-3 py-2 align-middle text-center">
                      <Badge
                        variant={
                          row.availabilityStatus === "available"
                            ? "success"
                            : "warning"
                        }
                      >
                        {row.availabilityStatus}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 align-middle text-center whitespace-nowrap text-xs">
                      {formatDate(row.joinedAt)}
                    </td>
                    <td className="px-3 py-2 align-middle text-center whitespace-nowrap text-xs">
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
