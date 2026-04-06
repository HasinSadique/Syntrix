import Link from "next/link";
import LoginForm from "@/frontend/components/forms/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Company Login</CardTitle>
          <CardDescription>Sign in with your staff or admin account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm mode="company" />
          <div className="text-sm text-slate-500">
            New company?{" "}
            <Link href="/register" className="font-medium text-[#2563EB] hover:underline">
              Register here
            </Link>
          </div>
          <div className="text-sm text-slate-500">
            Platform admin?{" "}
            <Link href="/superadmin-login" className="font-medium text-[#F97316] hover:underline">
              Superadmin login
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
