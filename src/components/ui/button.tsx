import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group/btn",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_14px_0_hsl(var(--primary)/0.4)] hover:shadow-[0_6px_20px_hsl(var(--primary)/0.5)] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:shadow-[0_2px_8px_hsl(var(--primary)/0.3)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_4px_14px_0_hsl(var(--destructive)/0.4)] hover:shadow-[0_6px_20px_hsl(var(--destructive)/0.5)] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]",
        outline:
          "border-2 border-primary/30 bg-background text-foreground shadow-[0_2px_8px_hsl(var(--primary)/0.1)] hover:border-primary/60 hover:bg-primary/5 hover:shadow-[0_4px_16px_hsl(var(--primary)/0.2)] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_4px_14px_0_hsl(var(--secondary)/0.3)] hover:shadow-[0_6px_20px_hsl(var(--secondary)/0.4)] hover:scale-[1.02] hover:-translate-y-0.5 hover:bg-secondary/80 active:scale-[0.98]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-[0_2px_12px_hsl(var(--accent)/0.3)] hover:scale-[1.02] active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-success text-success-foreground shadow-[0_4px_14px_0_hsl(var(--success)/0.4)] hover:shadow-[0_6px_20px_hsl(var(--success)/0.5)] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]",
        warning:
          "bg-warning text-warning-foreground shadow-[0_4px_14px_0_hsl(var(--warning)/0.4)] hover:shadow-[0_6px_20px_hsl(var(--warning)/0.5)] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3.5",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const showShine = variant !== "link" && variant !== "ghost";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {props.children}
        {showShine && (
          <span className="pointer-events-none absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
          </span>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
