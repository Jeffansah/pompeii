import { daysToGo, daysToGoLabel } from "@/lib/wedding/headline";

export function DaysToGo({ date }: { date: string }) {
  const days = daysToGo(date);
  if (days === null) {
    return null;
  }

  return (
    <div className="shrink-0 text-right">
      <h2 className="min-w-[3ch] font-serif text-4xl leading-tight sm:text-5xl">
        {days}
      </h2>
      <p className="text-muted-foreground">{daysToGoLabel(days)}</p>
    </div>
  );
}
