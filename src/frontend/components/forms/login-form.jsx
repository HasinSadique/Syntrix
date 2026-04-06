"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Button } from "@/frontend/components/ui/button";
import { authService } from "@/frontend/services/authService";
import { extractApiError } from "@/frontend/services/http";

export default function LoginForm({ mode = "company" }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const request =
        mode === "superadmin"
          ? authService.loginSuperadmin(form)
          : authService.login(form);
      const response = await request;
      const nextPath =
        response.data?.data?.redirectPath ||
        (mode === "superadmin" ? "/superadmin-dashboard" : "/dashboard");
      router.replace(nextPath);
    } catch (err) {
      setError(extractApiError(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
