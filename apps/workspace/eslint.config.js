import { config } from "@pompeii/eslint-config/react-internal";

export default [
  ...config,
  {
    ignores: ["src/routeTree.gen.ts", "dist/**"],
  },
];
