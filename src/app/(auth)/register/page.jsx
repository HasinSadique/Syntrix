import Link from "next/link";
import RegisterCompanyForm from "@/frontend/components/forms/register-company-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Register Your NDIS Company</CardTitle>
            <CardDescription>
              Create a company workspace and your initial company admin account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterCompanyForm />
            <p className="mt-6 text-sm text-slate-500">
              Already registered?{" "}
              <Link href="/login" className="font-medium text-[#2563EB] hover:underline">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
