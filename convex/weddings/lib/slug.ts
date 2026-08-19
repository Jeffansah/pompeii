const RESERVED_SLUGS = new Set([
  "new",
  "auth",
  "login",
  "site",
  "create",
  "weddings",
]);

export function slugify(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  if (base.length === 0) {
    return "wedding";
  }

  if (RESERVED_SLUGS.has(base)) {
    return `${base}-wedding`;
  }

  return base;
}
