import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kauvex-orange focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-kauvex-orange text-white hover:bg-kauvex-orange-dark shadow-sm hover:shadow-md",
        primary:
          "bg-kauvex-orange text-white hover:bg-kauvex-orange-dark shadow-sm hover:shadow-md",
        secondary:
          "bg-kauvex-navy text-white hover:bg-kauvex-navy-light shadow-sm",
        outline:
          "border-2 border-gray-200 bg-white hover:bg-gray-50 text-kauvex-navy hover:border-kauvex-orange",
        ghost: "hover:bg-gray-100 text-gray-600",
        link: "text-kauvex-orange underline-offset-4 hover:underline",
        destructive:
          "bg-brand-error text-white hover:bg-red-600 shadow-sm",
        danger:
          "bg-brand-error text-white hover:bg-red-600 shadow-sm",
        success:
          "bg-brand-success text-white hover:bg-green-600 shadow-sm",
        navy: "bg-kauvex-navy text-white hover:bg-kauvex-navy-light shadow-sm",
        orange:
          "bg-kauvex-orange text-white hover:bg-kauvex-orange-dark shadow-sm",
        cta: "bg-kauvex-orange text-white hover:bg-kauvex-orange-dark shadow-lg hover:shadow-xl font-semibold",
        "outline-orange":
          "border-2 border-kauvex-orange text-kauvex-orange bg-transparent hover:bg-kauvex-orange-tint",
        "outline-navy":
          "border-2 border-kauvex-navy text-kauvex-navy bg-transparent hover:bg-kauvex-navy-tint",
        "ghost-orange": "hover:bg-kauvex-orange-tint text-kauvex-orange",
        "ghost-navy": "hover:bg-kauvex-navy-tint text-kauvex-navy",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        default: "h-10 px-5 py-2",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
