import type { Id } from "@pompeii/api";
import { api } from "@pompeii/api";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePaginatedQuery } from "convex/react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { DropdownItem, DropdownList } from "@/components/ui/dropdown-list";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/shared/use-debounced-value";
import { cn } from "@/lib/shared/utils";

type MemberHit = {
  userId: Id<"users">;
  displayName: string;
  role: "couple" | "planner" | "groomsman" | "bridesmaid";
  isSelf: boolean;
};

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 15;

export function TaskAssigneeFilterField({
  weddingId,
  value,
  selectedLabel,
  onChange,
  onSearching,
}: {
  weddingId: Id<"weddings">;
  value: string;
  selectedLabel?: string;
  onChange: (value: string) => void;
  onSearching?: (searching: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const debouncedSearch = useDebouncedValue(
    editing ? draft.trim() : "",
    SEARCH_DEBOUNCE_MS,
  );
  const members = usePaginatedQuery(
    api.members.search.handler.search,
    open ? { weddingId, search: debouncedSearch } : "skip",
    { initialNumItems: PAGE_SIZE },
  );
  const cachedResults = useRef<MemberHit[]>([]);

  useEffect(() => {
    if (open && members.status !== "LoadingFirstPage") {
      cachedResults.current = members.results;
    }
  }, [members.results, members.status, open]);
  useEffect(() => {
    cachedResults.current = [];
  }, [weddingId]);

  useEffect(() => {
    if (value === "") {
      setDraft("");
      setEditing(false);
    }
  }, [value]);

  const displayedValue = editing
    ? draft
    : value === "unassigned"
      ? "Unassigned"
      : (selectedLabel ?? "");
  const isWaiting = editing && draft.trim() !== debouncedSearch;
  const isSearching =
    editing &&
    draft.trim().length > 0 &&
    (isWaiting ||
      members.status === "LoadingFirstPage" ||
      members.status === "LoadingMore");
  const isInitialLoading =
    open &&
    members.status === "LoadingFirstPage" &&
    cachedResults.current.length === 0;
  useEffect(() => {
    onSearching?.(isSearching);
  }, [isSearching, onSearching]);

  const shown = (
    open && members.status === "LoadingFirstPage"
      ? cachedResults.current
      : members.results
  ).filter((member) => member.displayName.length > 0);

  const selectMember = (member: MemberHit) => {
    onChange(member.userId);
    setDraft("");
    setEditing(false);
    setOpen(false);
    cachedResults.current = [];
  };

  const selectUnassigned = () => {
    onChange("unassigned");
    setDraft("");
    setEditing(false);
    setOpen(false);
    cachedResults.current = [];
  };

  const clear = () => {
    onChange("");
    setDraft("");
    setEditing(true);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setEditing(false);
      setDraft("");
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Input
          aria-autocomplete="list"
          aria-expanded={open}
          aria-label="Assignee"
          autoComplete="off"
          className={cn(
            "transition-[padding-right] duration-150 ease-out",
            value !== "" ? "pr-10" : undefined,
          )}
          onChange={(event) => {
            setEditing(true);
            setDraft(event.target.value);
            setOpen(true);
          }}
          onFocus={(event) => {
            setOpen(true);
            if (value !== "" && !editing) {
              event.currentTarget.select();
            }
          }}
          onKeyDown={onKeyDown}
          placeholder="Search workspace members"
          value={displayedValue}
        />
        {value !== "" ? (
          <Button
            aria-label="Clear assignee filter"
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2 p-0 text-muted-foreground hover:text-foreground"
            onClick={clear}
            size="icon"
            type="button"
            variant="ghost"
          >
            <HugeiconsIcon
              className="size-4"
              icon={Cancel01Icon}
              strokeWidth={1.5}
            />
          </Button>
        ) : null}
      </div>
      {open ? (
        <DropdownList className="absolute mt-1">
          <DropdownItem onClick={selectUnassigned}>Unassigned</DropdownItem>
          {shown.map((member) => (
            <DropdownItem
              className="gap-2"
              key={member.userId}
              onClick={() => selectMember(member)}
            >
              <MemberAvatar
                className="size-6"
                decorative
                name={member.displayName}
              />
              {member.isSelf ? "Me" : member.displayName}
            </DropdownItem>
          ))}
          {isInitialLoading ? (
            <li
              aria-live="polite"
              className="px-2 py-3 text-sm text-muted-foreground"
            >
              Loading members...
            </li>
          ) : null}
          {shown.length === 0 && !isSearching && !isInitialLoading ? (
            <li className="px-2 py-3 text-sm text-muted-foreground">
              No members found
            </li>
          ) : null}
          {members.status === "CanLoadMore" ||
          members.status === "LoadingMore" ? (
            <li className="flex justify-center px-2 py-1">
              <Button
                className="h-auto px-0"
                onClick={() => members.loadMore(PAGE_SIZE)}
                pending={members.status === "LoadingMore"}
                size="sm"
                type="button"
                variant="link"
              >
                Load more
              </Button>
            </li>
          ) : null}
        </DropdownList>
      ) : null}
    </div>
  );
}
