import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ComingSoonPanel({ title, description }) {
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <Badge className="w-fit" variant="warning">
          Coming soon!!
        </Badge>
        <CardTitle className="mt-2 text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
        {/* <p className="inline-flex items-center gap-2 text-sm text-violet-600 dark:text-violet-300">
          <Sparkles className="h-4 w-4" />
          Backend implementation
        </p> */}
      </CardContent>
    </Card>
  );
}
