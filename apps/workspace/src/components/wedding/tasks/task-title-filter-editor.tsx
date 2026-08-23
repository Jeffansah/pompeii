import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/shared/use-debounced-value";

const DEBOUNCE_MS = 300;

export function TaskTitleFilterEditor({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const [draft, setDraft] = useState(value ?? "");
  const debouncedDraft = useDebouncedValue(draft, DEBOUNCE_MS);

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  useEffect(() => {
    const next = debouncedDraft.trim();
    if (next !== (value ?? "")) {
      onChange(next === "" ? undefined : next);
    }
  }, [debouncedDraft, onChange, value]);

  return (
    <Input
      autoFocus
      onChange={(event) => setDraft(event.target.value)}
      placeholder="Search task titles"
      value={draft}
    />
  );
}
