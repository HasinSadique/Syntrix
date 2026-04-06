"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/frontend/components/common/page-header";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { companyService } from "@/frontend/services/companyService";
import { extractApiError } from "@/frontend/services/http";
import { useCurrentUser } from "@/frontend/hooks/useCurrentUser";

export default function CompanyProfilePage() {
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({
    companyName: "",
    abn: "",
    email: "",
    phone: "",
    address: "",
    status: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useCurrentUser();

  const canEdit = user?.role === "company_admin";

  useEffect(() => {
    async function load() {
      try {
        const response = await companyService.getProfile();
        const companyData = response.data?.data?.company;
        setCompany(companyData);
        setForm({
          companyName: companyData?.companyName || "",
          abn: companyData?.abn || "",
          email: companyData?.email || "",
          phone: companyData?.phone || "",
          address: companyData?.address || "",
          status: companyData?.status || "",
        });
      } catch (err) {
        setError(extractApiError(err, "Failed to load company profile"));
      }
    }
    load();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await companyService.updateProfile(form);
      setSuccess("Company profile updated.");
    } catch (err) {
      setError(extractApiError(err, "Failed to update company profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Company Profile" description="Manage core company details and contact information." />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-600">{success}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>{company?.companyName || "Company Profile"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={form.companyName}
                onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>ABN</Label>
              <Input
                value={form.abn}
                onChange={(e) => setForm((prev) => ({ ...prev, abn: e.target.value }))}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input value={form.status} disabled />
            </div>
            {canEdit ? (
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
