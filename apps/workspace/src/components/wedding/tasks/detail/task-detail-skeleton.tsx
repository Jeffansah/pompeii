import { Skeleton } from "@/components/ui/skeleton";

export function TaskDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-7 w-56" />
      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
