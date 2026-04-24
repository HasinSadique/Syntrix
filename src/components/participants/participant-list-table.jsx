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

function emergencySummary(ec) {
  if (!ec || (!ec.name && !ec.phone && !ec.relationship)) {
    return "—";
  }
  return [ec.name, ec.phone, ec.relationship].filter(Boolean).join(" · ");
}

export function ParticipantListTable({ participants, canViewProfile = false }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return participants.filter((row) => {
      const matchesStatus =
        statusFilter === "all" ? true : (row.status || "active") === statusFilter;
      const matchesState =
        stateFilter === "all" ? true : (row.state || "").toUpperCase() === stateFilter;
      if (!matchesStatus || !matchesState) {
        return false;
      }
      if (!q) {
        return true;
      }
      const id = (row._id || "").toLowerCase();
      const ndis = (row.ndisNumber || "").toLowerCase();
      const name = `${row.firstName || ""} ${row.lastName || ""}`.toLowerCase();
      return id.includes(q) || ndis.includes(q) || name.includes(q);
    });
  }, [participants, search, statusFilter, stateFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participant list</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              placeholder="Search by participant ID, NDIS number, or name..."
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={stateFilter}
              onChange={(event) => setStateFilter(event.target.value)}
              className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
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
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full min-w-[1100px] text-center text-sm">
            <thead className="bg-zinc-100 text-xs uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
              <tr>
                <th className="px-3 py-2 align-middle text-center">Participant ID</th>
                <th className="px-3 py-2 align-middle text-center">NDIS #</th>
                <th className="px-3 py-2 align-middle text-center">Name</th>
                <th className="px-3 py-2 align-middle text-center">DOB</th>
                <th className="px-3 py-2 align-middle text-center">Gender</th>
                <th className="px-3 py-2 align-middle text-center">Phone</th>
                <th className="px-3 py-2 align-middle text-center">Address</th>
                <th className="px-3 py-2 align-middle text-center">Emergency</th>
                <th className="px-3 py-2 align-middle text-center">State</th>
                <th className="px-3 py-2 align-middle text-center">Status</th>
                <th className="px-3 py-2 align-middle text-center">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-3 py-6 text-center align-middle text-zinc-500 dark:text-zinc-400"
                  >
                    No participants match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row._id}
                    className="border-t border-zinc-200 dark:border-zinc-800"
                  >
                    <>
                      <td className="px-3 py-2 align-middle text-center font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {canViewProfile ? (
                          <Link
                            href={`/participants/${row._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block hover:underline"
                          >
                            {row._id}
                          </Link>
                        ) : (
                          row._id
                        )}
                      </td>
                      <td className="px-3 py-2 align-middle text-center font-mono text-xs">{row.ndisNumber}</td>
                      <td className="px-3 py-2 align-middle text-center font-medium">
                        {row.firstName} {row.lastName}
                      </td>
                      <td className="px-3 py-2 align-middle text-center whitespace-nowrap">{formatDate(row.dob)}</td>
                      <td className="px-3 py-2 align-middle text-center">{row.gender || "—"}</td>
                      <td className="px-3 py-2 align-middle text-center">{row.phone || "—"}</td>
                      <td className="max-w-[180px] px-3 py-2 align-middle text-center text-xs text-zinc-600 dark:text-zinc-400">
                        {row.address || "—"}
                      </td>
                      <td className="max-w-[200px] px-3 py-2 align-middle text-center text-xs text-zinc-600 dark:text-zinc-400">
                        {emergencySummary(row.emergencyContact)}
                      </td>
                      <td className="px-3 py-2 align-middle text-center">{row.state}</td>
                      <td className="px-3 py-2 align-middle text-center">
                        <Badge
                          variant={row.status === "active" ? "success" : "warning"}
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 align-middle text-center whitespace-nowrap text-xs">
                        {formatDate(row.createdAt)}
                      </td>
                    </>
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
