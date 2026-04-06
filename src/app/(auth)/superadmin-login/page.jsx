import Link from "next/link";
import LoginForm from "@/frontend/components/forms/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";

export default function SuperadminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Superadmin Login</CardTitle>
          <CardDescription>Access the platform-wide Syntrix workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm mode="superadmin" />
          <p className="text-sm text-slate-500">
            Back to{" "}
            <Link href="/login" className="font-medium text-[#2563EB] hover:underline">
              company login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
