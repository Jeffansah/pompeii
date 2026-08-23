import { Migrations } from "@convex-dev/migrations";

import { components } from "../_generated/api";
import schema from "../schema";
import { seedWeddingMembers } from "../weddings/lib/seedMembers";

const migrations = new Migrations(components.migrations, { schema });

export const seedAssigneeMembers = migrations.define({
  table: "weddings",
  migrateOne: async (ctx, wedding) => {
    await seedWeddingMembers(ctx, wedding);
  },
});
