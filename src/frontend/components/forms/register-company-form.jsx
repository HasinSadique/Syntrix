"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { authService } from "@/frontend/services/authService";
import { extractApiError } from "@/frontend/services/http";

const initialForm = {
  companyName: "",
  abn: "",
  companyEmail: "",
  phone: "",
  address: "",
  adminFullName: "",
  adminEmail: "",
  adminPassword: "",
};

export default function RegisterCompanyForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await authService.registerCompany(form);
      setSuccess("Company registered successfully. Redirecting to login...");
      setForm(initialForm);
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      setError(extractApiError(err, "Company registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input id="companyName" name="companyName" value={form.companyName} onChange={onChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="abn">ABN (Optional)</Label>
        <Input id="abn" name="abn" value={form.abn} onChange={onChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyEmail">Company Email</Label>
        <Input
          id="companyEmail"
          name="companyEmail"
          type="email"
          value={form.companyEmail}
          onChange={onChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" value={form.phone} onChange={onChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" value={form.address} onChange={onChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminFullName">Admin Full Name</Label>
        <Input
          id="adminFullName"
          name="adminFullName"
          value={form.adminFullName}
          onChange={onChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminEmail">Admin Email</Label>
        <Input
          id="adminEmail"
          name="adminEmail"
          type="email"
          value={form.adminEmail}
          onChange={onChange}
          required
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="adminPassword">Admin Password</Label>
        <Input
          id="adminPassword"
          name="adminPassword"
          type="password"
          value={form.adminPassword}
          onChange={onChange}
          required
        />
      </div>
      {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="md:col-span-2 text-sm text-green-600">{success}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" variant="accent" disabled={loading}>
          {loading ? "Registering..." : "Register Company"}
        </Button>
      </div>
    </form>
  );
}
