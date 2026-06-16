"use client";

import { useSplitText } from "@/hooks/use-gsap";

/** Wrap a heading to apply split-text animation on first paint. */
export function SplitHeading({ as: Tag = "h1", text, className }: { as?: keyof JSX.IntrinsicElements; text: string; className?: string }) {
  const ref = useSplitText(`[data-split="${text.slice(0,12)}"]`, [text]);
  return (
    <Tag
      data-split={text.slice(0, 12)}
      ref={ref as any}
      className={className}
    >
      {text}
    </Tag>
  );
}
