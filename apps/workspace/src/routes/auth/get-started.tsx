import { useLayoutEffect, useRef } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Squiggle } from "@/components/ui/squiggle";

export const Route = createFileRoute("/auth/get-started")({
  component: GetStartedPage,
});

function GetStartedPage() {
  const staggerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const block = staggerRef.current;
    if (!block) {
      return;
    }
    block.classList.remove("is-hiding");
    block.classList.remove("is-shown");
    void block.offsetHeight;
    block.classList.add("is-shown");
  }, []);

  return (
    <div
      ref={staggerRef}
      className="t-stagger flex flex-col items-center gap-6 text-center"
    >
      <h1 className="t-stagger-line t-stagger-line--1 font-serif text-4xl sm:text-5xl">
        Welcome to <Squiggle>Pompeii</Squiggle>
      </h1>
      <p className="t-stagger-line t-stagger-line--2 max-w-md text-muted-foreground">
        The premier wedding planner suite for couples and wedding professionals.
      </p>
      <div className="t-stagger-line t-stagger-line--3">
        <Button asChild className="h-14 gap-1 px-8 text-lg">
          <Link to="/auth/login">
            Get started
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              className="size-7"
              strokeWidth={1.5}
            />
          </Link>
        </Button>
      </div>
    </div>
  );
}
