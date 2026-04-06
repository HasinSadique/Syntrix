"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/frontend/components/common/page-header";
import StaffForm from "@/frontend/components/forms/staff-form";
import StaffTable from "@/frontend/components/tables/staff-table";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Select } from "@/frontend/components/ui/select";
import { userService } from "@/frontend/services/userService";
import { extractApiError } from "@/frontend/services/http";
import { useCurrentUser } from "@/frontend/hooks/useCurrentUser";

export default function StaffPage() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useCurrentUser();

  const loadUsers = async () => {
    try {
      const response = await userService.list(roleFilter ? { role: roleFilter } : {});
      setUsers(response.data?.data || []);
    } catch (err) {
      setError(extractApiError(err, "Unable to load staff"));
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const createStaff = async (payload) => {
    setSaving(true);
    setError("");
    try {
      await userService.create(payload);
      await loadUsers();
    } catch (err) {
      setError(extractApiError(err, "Failed to create staff"));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (staff) => {
    const nextStatus = staff.status === "active" ? "inactive" : "active";
    try {
      await userService.updateStatus(staff.id, nextStatus);
      await loadUsers();
    } catch (err) {
      setError(extractApiError(err, "Failed to update status"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Staff Management" description="Create, filter, and update staff status by role." />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {user?.role === "company_admin" ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <StaffForm onSubmit={createStaff} loading={saving} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Staff List</CardTitle>
          <div className="w-52">
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="company_admin">Company Admin</option>
              <option value="support_worker">Support Worker</option>
              <option value="manager">Manager</option>
              <option value="coordinator">Coordinator</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <StaffTable rows={users} />
          {user?.role === "company_admin" ? (
            <div className="flex flex-wrap gap-2">
              {users.map((staff) => (
                <Button key={staff.id} size="sm" variant="outline" onClick={() => toggleStatus(staff)}>
                  {staff.fullName}: set {staff.status === "active" ? "inactive" : "active"}
                </Button>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
