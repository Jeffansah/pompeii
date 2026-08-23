export function productDay(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function editorialCardIndex(
  weddingId: string,
  workspaceSessionId: string,
  productDayValue: string,
  cardCount: number,
) {
  if (cardCount === 0) {
    return null;
  }

  let hash = 2166136261;
  for (const character of `${weddingId}:${workspaceSessionId}:${productDayValue}`) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % cardCount;
}
