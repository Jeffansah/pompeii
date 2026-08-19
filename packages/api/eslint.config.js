import { config } from "@pompeii/eslint-config/base";

export default [
  ...config,
  {
    ignores: ["../../convex/_generated/**"],
  },
];
