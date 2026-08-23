const PRIORITY_RANK = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
} as const;

const UNDATED_SORT_BASE = Number.MAX_SAFE_INTEGER - 100;
const DESC_SORT_BASE = Number.MAX_SAFE_INTEGER - 10_000;

export function priorityRank(priority: keyof typeof PRIORITY_RANK) {
  return PRIORITY_RANK[priority];
}

export function dueSortAt(
  dueDate: string | undefined,
  priority: keyof typeof PRIORITY_RANK,
) {
  const priorityRank = PRIORITY_RANK[priority];
  if (dueDate === undefined) {
    return UNDATED_SORT_BASE + priorityRank;
  }
  return Date.parse(`${dueDate}T00:00:00.000Z`) * 10 + priorityRank;
}

export function dueSortDescAt(dueDate: string | undefined) {
  if (dueDate === undefined) {
    return UNDATED_SORT_BASE;
  }
  return DESC_SORT_BASE - Date.parse(`${dueDate}T00:00:00.000Z`);
}
