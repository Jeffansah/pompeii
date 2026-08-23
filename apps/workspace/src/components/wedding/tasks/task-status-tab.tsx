import { TabsTrigger } from "@/components/ui/tabs";

export function TaskStatusTab({
  value,
  label,
  count,
}: {
  value: "todo" | "in_progress" | "completed";
  label: string;
  count: number | string | undefined;
}) {
  return (
    <TabsTrigger className="gap-2" value={value}>
      <span>{label}</span>
      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[10px] leading-5 tabular-nums text-muted-foreground">
        {count ?? "…"}
      </span>
    </TabsTrigger>
  );
}
