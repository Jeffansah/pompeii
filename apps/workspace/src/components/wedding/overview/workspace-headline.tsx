import { DaysToGo } from "./days-to-go";
import { dayGreeting, displayCoupleNames } from "@/lib/wedding/headline";

export function WorkspaceHeadline({
  coupleA,
  coupleB,
  date,
}: {
  coupleA: string;
  coupleB: string;
  date?: string;
}) {
  const greeting = dayGreeting();
  const coupleNames = displayCoupleNames(coupleA, coupleB);

  return (
    <div className="flex w-full flex-col">
      <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
        Your wedding workspace
      </p>
      <div className="mt-1 flex w-full items-start justify-between gap-3 sm:gap-6">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl leading-tight sm:text-5xl">
            {greeting}, <em className="italic capitalize">{coupleNames}</em>.
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            A beautiful day is taking shape. Here is what feels most useful
            right now.
          </p>
        </div>
        {date !== undefined && date.length > 0 ? (
          <DaysToGo date={date} />
        ) : (
          <div aria-hidden="true" className="invisible shrink-0 text-right">
            <h2 className="min-w-[3ch] font-serif text-3xl leading-tight sm:text-5xl">
              000
            </h2>
            <p className="text-muted-foreground">days to go</p>
          </div>
        )}
      </div>
    </div>
  );
}
