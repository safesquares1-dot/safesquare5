import { cn } from "@/lib/utils";

/** Editorial display heading that animates in with a single orchestrated reveal. */
export function DisplayHeading({
  children,
  as: Tag = "h1",
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  delay?: number;
}) {
  return (
    <Tag
      className={cn("h-display reveal text-balance", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </Tag>
  );
}
