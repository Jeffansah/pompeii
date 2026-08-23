export function CommentSkeleton() {
  return (
    <div>
      <span className="block h-8 w-32 rounded-sm bg-muted" />
      <span className="mt-4 block h-28 w-full rounded-sm bg-muted" />
    </div>
  );
}

export function CommentRepliesSkeleton() {
  return (
    <div>
      <span className="block h-4 w-2/3 rounded-sm bg-muted" />
      <span className="mt-3 block h-4 w-1/2 rounded-sm bg-muted" />
    </div>
  );
}
