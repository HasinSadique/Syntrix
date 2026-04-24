"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const defaultFormState = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const [form, setForm] = useState(defaultFormState);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to sign in");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (requestError) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-zinc-950 p-10 text-zinc-100 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.35),_transparent_55%)]" />
        <div className="relative z-10">
          {" "}
          {/* <p className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-xs">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        Production-style architecture
                      </p> */}{" "}
          <h1 className=" text-4xl font-semibold tracking-tight"> Syntrix </h1>{" "}
          <p className="mt-3 max-w-md text-zinc-300">
            A single platform for managing your NDIS operations and
            workflows.{" "}
          </p>
          <div className="mt-10 space-y-3 text-sm text-zinc-300">
            <p> Super Admin: superadmin @syntrix.com </p>{" "}
            <p> Password: Password123! </p>{" "}
          </div>{" "}
        </div>{" "}
      </section>
      <section className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl"> Sign in </CardTitle>{" "}
            <CardDescription>
              Access Syntrix with your company staff credentials{" "}
            </CardDescription>{" "}
          </CardHeader>{" "}
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Email{" "}
                </label>{" "}
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                />{" "}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Password{" "}
                </label>{" "}
                <Input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                />{" "}
              </div>
              {error ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {" "}
                  {error}{" "}
                </p>
              ) : null}
              <Button className="w-full" disabled={isLoading} type="submit">
                <LockKeyhole className="h-4 w-4" />{" "}
                {isLoading ? "Signing in..." : "Sign in"}{" "}
              </Button>{" "}
            </form>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </section>{" "}
    </div>
  );
}
