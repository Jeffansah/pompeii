import { useLayoutEffect, useRef, type ReactNode } from "react";

import floral from "@/assets/onboarding/floral.png";

export function AuthShell({ children }: { children?: ReactNode }) {
  const floralRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const skel = floralRef.current;
    if (!skel) {
      return;
    }

    const img = skel.querySelector("img");
    if (!img) {
      return;
    }

    const revealFloral = () => {
      skel.classList.remove("is-revealed");
      void skel.offsetHeight;
      skel.classList.add("is-revealed");
    };

    if (img.complete && img.naturalWidth > 0) {
      revealFloral();
      return;
    }

    img.addEventListener("load", revealFloral);
    img.addEventListener("error", revealFloral);
    return () => {
      img.removeEventListener("load", revealFloral);
      img.removeEventListener("error", revealFloral);
    };
  }, []);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div ref={floralRef} className="t-skel size-full">
          <img
            src={floral}
            alt=""
            aria-hidden
            fetchPriority="high"
            className="t-skel-content size-full object-cover object-bottom translate-y-24 sm:translate-y-40"
          />
        </div>
      </div>
      <div className="relative z-10 w-full min-w-0 px-6 sm:w-auto sm:min-w-96">
        {children}
      </div>
    </div>
  );
}
