import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200",
        secondary:
          "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200",
        success:
          "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-200",
        warning:
          "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
