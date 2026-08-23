import { cn } from "@/lib/shared/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TaskTableSkeleton({
  compact = false,
  rows = 4,
}: {
  compact?: boolean;
  rows?: number;
}) {
  return (
    <Table aria-busy="true">
      {!compact ? (
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" />
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Assigned to</TableHead>
          </TableRow>
        </TableHeader>
      ) : null}
      <TableBody>
        {Array.from({ length: rows }, (_, index) => (
          <TableRow key={index}>
            <TableCell className={cn("w-12", compact && "px-4 py-4")}>
              <div
                className={cn(
                  "flex items-center justify-center",
                  compact ? "size-7" : "h-7 w-8",
                )}
              >
                <span className="block size-4 rounded-full border border-muted-foreground/40" />
              </div>
            </TableCell>
            <TableCell
              className={cn(
                compact
                  ? "w-full max-w-0 min-w-0 overflow-hidden px-4 py-4"
                  : "max-w-md",
              )}
            >
              <span className="block h-4 w-2/3 animate-pulse rounded-sm bg-muted" />
            </TableCell>
            {!compact ? (
              <>
                <TableCell>
                  <span className="block h-7 w-20 animate-pulse rounded-none bg-muted" />
                </TableCell>
                <TableCell>
                  <span className="block h-3 w-16 animate-pulse rounded-sm bg-muted" />
                </TableCell>
                <TableCell>
                  <span className="block h-3 w-14 animate-pulse rounded-sm bg-muted" />
                </TableCell>
              </>
            ) : null}
            <TableCell
              className={cn(
                "whitespace-nowrap text-sm",
                compact && "w-auto px-4 py-4 text-right",
              )}
            >
              <div className={cn("flex items-center gap-2", compact && "justify-end")}>
                {compact ? (
                  <>
                    <span className="h-7 w-14 shrink-0 animate-pulse rounded-none bg-muted" />
                    <span className="h-7 w-16 shrink-0 animate-pulse rounded-none bg-muted" />
                    <span className="h-7 w-14 shrink-0 animate-pulse rounded-none bg-muted" />
                    <span className="size-6 animate-pulse rounded-full bg-muted" />
                  </>
                ) : null}
                <span className="block h-3 w-16 animate-pulse rounded-sm bg-muted" />
              </div>
            </TableCell>
            {!compact ? (
              <TableCell>
                <span className="block h-3 w-20 animate-pulse rounded-sm bg-muted" />
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
