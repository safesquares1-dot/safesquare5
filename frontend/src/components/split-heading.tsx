"use client";

import * as React from "react";
import { useSplitText } from "@/hooks/use-gsap";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/** Wrap a heading to apply split-text animation on first paint. */
export function SplitHeading({ as, text, className }: { as?: HeadingTag; text: string; className?: string }) {
  const key = text.slice(0, 12);
  useSplitText(`[data-split="${key}"]`, [text]);
  const Tag: HeadingTag = as ?? "h1";
  return (
    <Tag data-split={key} className={className}>
      {text}
    </Tag>
  );
}
