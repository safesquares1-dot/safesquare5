import * as React from "react";
import { cn } from "@/lib/utils";

export const Badge = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("pill", className)} {...props} />
);

export const Pill = ({
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "ox" | "fill" }) => {
  const map = { default: "pill", ox: "pill-ox", fill: "pill-fill" } as const;
  return <span className={cn(map[variant], className)} {...props} />;
};
