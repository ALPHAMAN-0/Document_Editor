import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  variant: {
    default:
      "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90",
    destructive:
      "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90",
    outline:
      "border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
    ghost: "hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
    link: "text-[var(--primary)] underline-offset-4 hover:underline",
  },
  size: {
    sm: "h-8 rounded-md px-3 text-xs",
    default: "h-9 rounded-md px-4 py-2 text-sm",
    lg: "h-10 rounded-md px-6 text-base",
    icon: "h-9 w-9 rounded-md",
  },
} as const;

type ButtonVariant = keyof typeof buttonVariants.variant;
type ButtonSize = keyof typeof buttonVariants.size;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
