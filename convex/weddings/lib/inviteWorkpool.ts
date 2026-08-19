import { Workpool } from "@convex-dev/workpool";

import { components } from "../../_generated/api";

export const inviteWorkpool = new Workpool(components.workpool, {
  maxParallelism: 10,
});
