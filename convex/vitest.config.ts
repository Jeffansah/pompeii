import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: {
    environment: "edge-runtime",
    server: {
      deps: {
        inline: ["convex-test"],
      },
    },
    include: ["**/*.test.ts"],
    env: {
      BETTER_AUTH_SECRET: "test-better-auth-secret-32chars!",
      GOOGLE_PLACES_API_KEY: "test-places-key",
      SITE_URL: "http://localhost:3000",
    },
  },
});
