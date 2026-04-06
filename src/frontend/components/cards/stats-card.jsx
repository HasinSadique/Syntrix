import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";

export default function StatsCard({ title, value, helper, tone = "blue" }) {
  const toneClasses = {
    blue: "text-[#1E3A8A]",
    teal: "text-[#14B8A6]",
    green: "text-[#22C55E]",
    orange: "text-[#F97316]",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${toneClasses[tone] || toneClasses.blue}`}>{value}</p>
        {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}
