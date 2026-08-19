import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";

import { components } from "../../_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  magicLinkCooldown: { kind: "token bucket", rate: 1, period: MINUTE, capacity: 1 },
  magicLinkHourly: { kind: "token bucket", rate: 5, period: HOUR, capacity: 5 },
  placesLookup: { kind: "token bucket", rate: 20, period: MINUTE, capacity: 5 },
});
