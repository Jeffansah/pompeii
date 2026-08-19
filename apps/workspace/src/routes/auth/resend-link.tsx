import { useLayoutEffect, useRef, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  formatResendLabel,
  useMagicLinkCooldown,
} from "@/hooks/auth/use-magic-link-cooldown";
import { getPendingMagicLinkEmail } from "@/lib/auth/get-pending-magic-link";
import { requestMagicLink } from "@/lib/auth/request-magic-link";

export const Route = createFileRoute("/auth/resend-link")({
  beforeLoad: async () => {
    const email = await getPendingMagicLinkEmail();
    if (!email) {
      throw redirect({ to: "/auth/login" });
    }
    return { email };
  },
  component: ResendLinkPage,
});

function ResendLinkPage() {
  const { email } = Route.useRouteContext();
  const staggerRef = useRef<HTMLDivElement>(null);
  const { isLoading, isCooling, remainingMs } = useMagicLinkCooldown(email);
  const [isResending, setIsResending] = useState(false);

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

  const resend = async () => {
    setIsResending(true);
    try {
      await requestMagicLink(email);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      ref={staggerRef}
      className="t-stagger flex w-full flex-col gap-8 text-left"
    >
      <div className="flex flex-col gap-2">
        <h1 className="t-stagger-line t-stagger-line--1 text-4xl sm:text-5xl">
          Check your email
        </h1>
        <p className="t-stagger-line t-stagger-line--2 text-muted-foreground">
          We sent a link to {email}.
        </p>
      </div>
      <div className="t-stagger-line t-stagger-line--3">
        <Button
          type="button"
          className="h-12 w-full"
          disabled={isLoading || isCooling}
          pending={isResending}
          onClick={() => void resend()}
        >
          {isCooling ? formatResendLabel(remainingMs) : "Resend link"}
        </Button>
      </div>
    </div>
  );
}
