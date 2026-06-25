import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-kauvex-orange text-white",
        sale: "bg-brand-error text-white",
        hot: "bg-kauvex-orange text-white",
        new: "bg-brand-success text-white",
        featured: "bg-kauvex-navy text-white",
        trending: "bg-violet text-white",
        bestseller: "bg-amber text-text-1",
        "top-rated": "bg-amber-300 text-text-1",
        outline: "border border-gray-200 text-gray-600",
        success: "bg-green-50 text-green-700",
        warning: "bg-amber-50 text-amber-700",
        error: "bg-red-50 text-red-700",
        info: "bg-blue-50 text-blue-700",
        navy: "bg-kauvex-navy text-white",
        orange: "bg-kauvex-orange text-white",
        "flash-deal": "bg-kauvex-orange text-white",
        verified: "bg-kauvex-navy text-white",
        premium:
          "bg-gradient-to-r from-kauvex-navy to-kauvex-orange text-white",
        express: "bg-kauvex-orange text-white",
        fbk: "bg-emerald text-white",
        pay: "bg-amber text-white",
        live: "bg-brand-error text-white",
        partners: "bg-violet text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
