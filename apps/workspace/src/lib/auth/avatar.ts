export function avatarInitials(name?: string | null, email?: string | null) {
  const words = name?.trim().split(/\s+/).filter((word) => word.length > 0) ?? [];
  const first = words[0]?.charAt(0);
  const last = words.at(-1)?.charAt(0);
  if (first && last && words.length > 1) {
    return `${first}${last}`.toUpperCase();
  }
  if (first) {
    return first.toUpperCase();
  }
  const fromEmail = email?.trim().charAt(0);
  if (fromEmail) {
    return fromEmail.toUpperCase();
  }
  return "P";
}
