export const AVATAR_TONE_COUNT = 20;

export function avatarToneIndex(id: string) {
  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return (hash % AVATAR_TONE_COUNT) + 1;
}

export function avatarToneVar(id: string) {
  return `var(--avatar-${avatarToneIndex(id)})`;
}

export function avatarInitial(name?: string | null, email?: string | null) {
  const fromName = name?.trim().charAt(0);
  if (fromName) {
    return fromName.toUpperCase();
  }
  const fromEmail = email?.trim().charAt(0);
  if (fromEmail) {
    return fromEmail.toUpperCase();
  }
  return "P";
}
