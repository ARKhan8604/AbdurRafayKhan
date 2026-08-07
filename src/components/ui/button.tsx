import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[transform,background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-fg)] hover:brightness-110 shadow-[0_8px_30px_-12px_var(--glow)] hover:shadow-[0_10px_40px_-10px_var(--glow)]",
  secondary:
    "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)]",
  outline:
    "border border-[var(--border-strong)] text-[var(--text)] hover:bg-[var(--surface-2)] hover:border-[var(--accent)]",
  ghost: "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
  icon: "h-10 w-10",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={buttonVariants({ variant, size, className })} {...props} />
  )
);
Button.displayName = "Button";
