import { useEffect, useRef, useState } from "react";

import { motionDuration, prefersReducedMotion } from "@/lib/shared/motion";

export function TextSwap({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(children);
  const [display, setDisplay] = useState(children);

  useEffect(() => {
    if (children === shown.current) {
      return;
    }
    const element = ref.current;
    if (element === null || prefersReducedMotion()) {
      shown.current = children;
      setDisplay(children);
      return;
    }
    element.classList.add("is-exit");
    const timeout = window.setTimeout(() => {
      shown.current = children;
      setDisplay(children);
      element.classList.remove("is-exit");
      element.classList.add("is-enter-start");
      void element.offsetHeight;
      element.classList.remove("is-enter-start");
    }, motionDuration("--text-swap-dur", 150));
    return () => window.clearTimeout(timeout);
  }, [children]);

  return (
    <span className="t-text-swap" ref={ref}>
      {display}
    </span>
  );
}
