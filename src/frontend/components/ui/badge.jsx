import { cva } from "class-variance-authority";
import { cn } from "@/frontend/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#1E3A8A] text-white",
        success: "border-transparent bg-[#22C55E] text-white",
        warning: "border-transparent bg-[#F97316] text-white",
        info: "border-transparent bg-[#14B8A6] text-white",
        outline: "border-slate-300 text-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
