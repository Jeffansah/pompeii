import { dayGreeting } from "@/lib/wedding/headline";

export function WorkspaceHeadlineSkeleton() {
  const greeting = dayGreeting();

  return (
    <div
      aria-busy="true"
      aria-label="Loading workspace"
      className="flex w-full flex-col"
    >
      <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
        Your wedding workspace
      </p>
      <div className="mt-1 flex w-full items-start justify-between gap-3 sm:gap-6">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl leading-tight sm:text-5xl">
            {greeting},{" "}
            <span
              aria-hidden="true"
              className="inline-block h-[0.72em] w-[12ch] translate-y-[-0.08em] animate-pulse rounded-sm bg-muted align-baseline"
            />
            .
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            A beautiful day is taking shape. Here is what feels most useful
            right now.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <h2 className="font-serif text-3xl leading-tight sm:text-5xl">
            <span
              aria-hidden="true"
              className="inline-block h-[0.72em] w-[3ch] translate-y-[-0.08em] animate-pulse rounded-sm bg-muted align-baseline"
            />
          </h2>
          <p className="invisible text-muted-foreground">days to go</p>
        </div>
      </div>
    </div>
  );
}
