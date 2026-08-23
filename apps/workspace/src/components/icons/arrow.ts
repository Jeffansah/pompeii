import type { IconSvgElement } from "@hugeicons/react";

const stroke = {
  stroke: "currentColor",
  strokeLinecap: "butt",
  strokeLinejoin: "miter",
  strokeWidth: 1.5,
} as const;

export const ArrowRightIcon = [
  ["path", { d: "M5 12h12", ...stroke, key: "shaft" }],
  ["path", { d: "M13 6l6 6-6 6", ...stroke, key: "head" }],
] satisfies IconSvgElement;

export const ArrowLeftIcon = [
  ["path", { d: "M19 12H7", ...stroke, key: "shaft" }],
  ["path", { d: "M11 6l-6 6 6 6", ...stroke, key: "head" }],
] satisfies IconSvgElement;

export const ArrowUpIcon = [
  ["path", { d: "M12 19V7", ...stroke, key: "shaft" }],
  ["path", { d: "M6 11l6-6 6 6", ...stroke, key: "head" }],
] satisfies IconSvgElement;

export const ArrowDownIcon = [
  ["path", { d: "M12 5v12", ...stroke, key: "shaft" }],
  ["path", { d: "M6 13l6 6 6-6", ...stroke, key: "head" }],
] satisfies IconSvgElement;
