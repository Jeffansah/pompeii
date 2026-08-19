import { useEffect, useState } from "react";
import { useRateLimit } from "@convex-dev/rate-limiter/react";
import { api } from "@pompeii/api";

export function useMagicLinkCooldown(email: string) {
  const { status } = useRateLimit(
    api.login.magicLinkCooldown.handler.getRateLimit,
    {
      key: email,
      count: 1,
      getServerTimeMutation: api.login.magicLinkCooldown.handler.getServerTime,
    },
  );

  const [now, setNow] = useState(() => Date.now());
  const retryAt = status?.ok === false ? status.retryAt : undefined;

  useEffect(() => {
    if (retryAt === undefined) {
      return;
    }
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [retryAt]);

  const remainingMs =
    retryAt === undefined ? 0 : Math.max(0, retryAt - now);

  return {
    isLoading: status === undefined,
    isCooling: remainingMs > 0,
    remainingMs,
  };
}

export function formatResendLabel(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `Resend in ${minutes}:${seconds.toString().padStart(2, "0")}`;
}
