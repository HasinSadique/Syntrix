import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({ label, value, accent = "violet" }) {
  const accentStyles = {
    violet: "from-violet-500/25 to-violet-500/5",
    cyan: "from-cyan-500/25 to-cyan-500/5",
    emerald: "from-emerald-500/25 to-emerald-500/5",
    amber: "from-amber-500/25 to-amber-500/5"
  };

  return (
    <Card className={`bg-gradient-to-br ${accentStyles[accent] || accentStyles.violet}`}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
