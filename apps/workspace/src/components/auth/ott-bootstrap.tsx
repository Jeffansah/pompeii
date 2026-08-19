import { useEffect, useState, type ReactNode } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import {
  consumeOneTimeToken,
  urlHasOneTimeToken,
} from "@/lib/auth/consume-one-time-token";

export function OttBootstrap({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(() => !urlHasOneTimeToken());

  useEffect(() => {
    if (isReady) {
      return;
    }

    let cancelled = false;

    const consume = async () => {
      try {
        await consumeOneTimeToken();
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    void consume();

    return () => {
      cancelled = true;
    };
  }, [isReady]);

  if (!isReady) {
    return <AuthShell />;
  }

  return children;
}
