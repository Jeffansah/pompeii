import betterAuth from "@convex-dev/better-auth/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import resend from "@convex-dev/resend/convex.config";
import workpool from "@convex-dev/workpool/convex.config";
import invitations from "@vllnt/convex-invitations/convex.config";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(betterAuth);
app.use(resend);
app.use(rateLimiter);
app.use(invitations);
app.use(workpool);

export default app;
