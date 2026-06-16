"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 font-mono text-[12px] uppercase tracking-[0.18em] transition-all disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:   "bg-ink text-bone hover:bg-oxblood px-6 py-3.5",
        secondary: "bg-bone text-ink border border-ink/30 hover:border-ink hover:bg-bone-2 px-6 py-3.5",
        outline:   "border border-ink text-ink hover:bg-ink hover:text-bone px-6 py-3.5",
        ghost:     "text-ink hover:text-oxblood px-3 py-2",
        oxblood:   "bg-oxblood text-bone hover:bg-oxblood-2 px-6 py-3.5",
        link:      "text-ink link-underline px-0 py-0",
        destructive: "bg-ink text-bone hover:bg-oxblood px-6 py-3.5",
      },
      size: {
        sm: "text-[10px] px-4 py-2.5",
        default: "",
        lg: "text-[13px] px-7 py-4",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
export { buttonVariants };
