import { useEffect, useState, type ReactNode } from "react";

import { motionDuration, prefersReducedMotion } from "@/lib/shared/motion";
import { cn } from "@/lib/shared/utils";

export function SkeletonReveal({
  ready,
  skeleton,
  className,
  children,
}: {
  ready: boolean;
  skeleton: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const [revealed, setRevealed] = useState(ready);
  const [keepSkeleton, setKeepSkeleton] = useState(!ready);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!ready) {
      setKeepSkeleton(true);
      setResetting(true);
      setRevealed(false);
      return;
    }
    if (prefersReducedMotion()) {
      setResetting(false);
      setRevealed(true);
      setKeepSkeleton(false);
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      setResetting(false);
      setRevealed(true);
    });
    const timeout = window.setTimeout(
      () => setKeepSkeleton(false),
      motionDuration("--reveal-dur", 400),
    );
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [ready]);

  return (
    <div
      aria-busy={!ready}
      className={cn(
        "t-skel t-skel-stack",
        revealed && "is-revealed",
        resetting && "is-resetting",
        className,
      )}
    >
      {keepSkeleton ? (
        <div className="t-skel-skeleton is-pulsing">{skeleton}</div>
      ) : null}
      <div className="t-skel-content">{children}</div>
    </div>
  );
}
