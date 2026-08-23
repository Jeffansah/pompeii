import { useLayoutEffect, useRef, type ReactNode } from "react";

import { CREATE_WEDDING_STEP_COUNT } from "@/stores/wedding/create/stepper";

export function StepLayout({
  step,
  title,
  subtitle,
  isActive = true,
  showProgress = true,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  isActive?: boolean;
  showProgress?: boolean;
  children?: ReactNode;
}) {
  const staggerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isActive) {
      return;
    }
    const block = staggerRef.current;
    if (!block) {
      return;
    }
    block.classList.remove("is-hiding");
    block.classList.remove("is-shown");
    void block.offsetHeight;
    block.classList.add("is-shown");
  }, [step, title, isActive]);

  return (
    <div
      ref={staggerRef}
      className="t-stagger flex w-full flex-col gap-8 text-left"
    >
      <div className="flex flex-col gap-2">
        {showProgress ? (
          <p className="t-stagger-line t-stagger-line--1 text-sm text-muted-foreground">
            {step} of {CREATE_WEDDING_STEP_COUNT}
          </p>
        ) : null}
        <h1 className="t-stagger-line t-stagger-line--1 font-serif text-4xl sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="t-stagger-line t-stagger-line--2 text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {children ? (
        <div className="t-stagger-line t-stagger-line--3">{children}</div>
      ) : null}
    </div>
  );
}
