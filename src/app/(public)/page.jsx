import Link from "next/link";

const features = [
  "Multi-tenant company workspaces",
  "Staff, participants, assignments, notes, incidents",
  "Role-aware dashboards and routing",
  "Dummy data now, MongoDB later with one switch",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10 md:px-10">
        <header className="flex items-center justify-between">
          <div className="text-2xl font-bold text-[#1E3A8A]">Syntrix</div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md border border-[#1E3A8A] px-4 py-2 text-sm font-medium text-[#1E3A8A] transition hover:bg-blue-50"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-[#F97316] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#FB923C]"
            >
              Register Company
            </Link>
          </nav>
        </header>

        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-[#1E3A8A]">
              NDIS Operations Platform Prototype
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-[#0F172A] md:text-5xl">
              One platform for many NDIS companies.
            </h1>
            <p className="max-w-xl text-base text-slate-600 md:text-lg">
              Syntrix helps providers manage staff, participants, assignments,
              case notes, and incidents with clean role-based workflows.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-md bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#2563EB]"
              >
                Start Company Registration
              </Link>
              <Link
                href="/superadmin-login"
                className="rounded-md border border-[#F97316] px-5 py-3 text-sm font-semibold text-[#F97316] hover:bg-orange-50"
              >
                Superadmin Access
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1E3A8A]">
              Built for clean scaling
            </h2>
            <ul className="mt-4 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#14B8A6]" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
