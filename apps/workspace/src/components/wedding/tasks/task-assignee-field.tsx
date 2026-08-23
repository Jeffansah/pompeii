import type { Id } from "@pompeii/api";
import { api } from "@pompeii/api";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { usePaginatedQuery } from "convex/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { MemberAvatar } from "@/components/shared/member-avatar";
import { Button } from "@/components/ui/button";
import { DropdownItem, DropdownList } from "@/components/ui/dropdown-list";
import { Input } from "@/components/ui/input";
import { LoaderDots } from "@/components/ui/loader-dots";
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
const PLACEHOLDER_IDLE = "Assign this task to a member of your workspace";
const PLACEHOLDER_SEARCH = "Search workspace members";
const PLACEHOLDER_HIDE_MS = 200;

function memberLabel(member: MemberHit) {
  return member.isSelf ? "Me" : member.displayName;
}

function PlaceholderReveal({ open }: { open: boolean }) {
  const blockRef = useRef<HTMLDivElement>(null);
  const skipFirstOpen = useRef(true);
  const [copy, setCopy] = useState(() =>
    open ? PLACEHOLDER_SEARCH : PLACEHOLDER_IDLE,
  );
  const [phase, setPhase] = useState<"shown" | "hiding" | "enter">("shown");

  useEffect(() => {
    const next = open ? PLACEHOLDER_SEARCH : PLACEHOLDER_IDLE;
    if (skipFirstOpen.current) {
      skipFirstOpen.current = false;
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
      setCopy(next);
      setPhase("shown");
      return;
    }

    setPhase("hiding");
    const timer = window.setTimeout(() => {
      setCopy(next);
      setPhase("enter");
    }, PLACEHOLDER_HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (phase !== "enter") {
      return;
    }
    void blockRef.current?.offsetHeight;
    setPhase("shown");
  }, [phase]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "t-stagger pointer-events-none absolute inset-0 flex items-center overflow-hidden text-sm text-muted-foreground",
        phase === "shown" && "is-shown",
        phase === "hiding" && "is-hiding",
      )}
      ref={blockRef}
    >
      <span className="t-stagger-line t-stagger-line--1 min-w-0 truncate">
        {copy}
      </span>
    </div>
  );
}

export function TaskAssigneeField({
  weddingId,
  value,
  onChange,
  onBlur,
  allowUnassigned = false,
  variant = "line",
  placeholder,
}: {
  weddingId: Id<"weddings">;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  allowUnassigned?: boolean;
  variant?: "default" | "line";
  placeholder?: string;
}) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MemberHit | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const hasSelection = selected !== null && value.length > 0;
  const searchInput = hasSelection ? "" : query.trim();
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const members = usePaginatedQuery(
    api.members.search.handler.search,
    open ? { weddingId, search: debouncedSearch } : "skip",
    { initialNumItems: PAGE_SIZE },
  );
  const cachedResults = useRef<MemberHit[]>([]);

  if (open && members.status !== "LoadingFirstPage") {
    cachedResults.current = members.results;
  }

  const shown = (
    open && members.status === "LoadingFirstPage"
      ? cachedResults.current
      : members.results
  )
    .filter((member) => member.displayName.length > 0)
    .slice()
    .sort((left, right) => Number(right.isSelf) - Number(left.isSelf));
  const isWaiting =
    open && searchInput.length > 0 && searchInput !== debouncedSearch;
  const isSearching =
    isWaiting ||
    (open &&
      (members.status === "LoadingFirstPage" ||
        members.status === "LoadingMore"));
  const showListDots = open && shown.length === 0 && isSearching;
  const showSearchDots =
    open && searchInput.length > 0 && isSearching && shown.length > 0;

  useEffect(() => {
    if (value.length === 0) {
      setSelected(null);
      return;
    }
    const match = shown.find((member) => member.userId === value);
    if (match !== undefined) {
      setSelected(match);
    }
  }, [shown, value]);

  useEffect(() => {
    if (selected !== null) {
      setQuery(memberLabel(selected));
    }
  }, [selected]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [debouncedSearch]);

  useEffect(() => {
    const closeOnPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }
      if (wrapRef.current?.contains(event.target)) {
        return;
      }
      setOpen(false);
      onBlur?.();
    };
    document.addEventListener("pointerdown", closeOnPointerDown);
    return () =>
      document.removeEventListener("pointerdown", closeOnPointerDown);
  }, [onBlur]);

  const changeQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    if (hasSelection) {
      setSelected(null);
      onChange("");
    }
    setOpen(true);
  };

  const selectMember = (member: MemberHit) => {
    setSelected(member);
    setQuery(memberLabel(member));
    onChange(member.userId);
    setOpen(false);
    cachedResults.current = [];
  };

  const clear = () => {
    setSelected(null);
    setQuery("");
    onChange("");
    setOpen(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || shown.length === 0) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => (index + 1) % shown.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => (index - 1 + shown.length) % shown.length);
      return;
    }
    if (event.key === "Enter") {
      const member = shown[highlightedIndex];
      if (!member) {
        return;
      }
      event.preventDefault();
      selectMember(member);
    }
  };

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="relative">
        {selected ? (
          <span
            className={cn(
              "pointer-events-none absolute top-1/2 z-10 -translate-y-1/2",
              variant === "line" ? "left-0" : "left-3",
            )}
          >
            <MemberAvatar
              className="size-6"
              decorative
              name={selected.displayName}
            />
          </span>
        ) : null}
        {variant === "line" && query.length === 0 && !selected ? (
          <PlaceholderReveal open={open} />
        ) : null}
        <Input
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open}
          aria-label="Assignee"
          autoComplete="off"
          className={cn(
            "relative z-10",
            selected && (variant === "line" ? "pl-8" : "pl-10"),
            variant === "line" ? "pr-16" : "pr-14",
          )}
          onChange={(event) => changeQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={
            variant === "line" ? "" : (placeholder ?? PLACEHOLDER_SEARCH)
          }
          role="combobox"
          value={query}
          variant={variant}
        />
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2",
            variant === "line" ? "right-8" : "right-9",
          )}
        >
          <LoaderDots open={showSearchDots} />
        </span>
        {selected ? (
          <button
            aria-label="Clear assignee"
            className={cn(
              "absolute top-1/2 z-10 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground",
              variant === "line" ? "right-0" : "right-2",
            )}
            onClick={clear}
            type="button"
          >
            <HugeiconsIcon
              className="size-4"
              icon={Cancel01Icon}
              strokeWidth={1.5}
            />
          </button>
        ) : null}
      </div>
      {open ? (
        <DropdownList className="absolute mt-1" id={listId} role="listbox">
          {allowUnassigned ? (
            <li role="none">
              <DropdownItem
                aria-selected={value === "unassigned"}
                onClick={() => {
                  setSelected(null);
                  setQuery("");
                  onChange("unassigned");
                  setOpen(false);
                  cachedResults.current = [];
                }}
                role="option"
              >
                Unassigned
              </DropdownItem>
            </li>
          ) : null}
          {showListDots ? (
            <li className="flex items-center justify-center px-2 py-3">
              <LoaderDots open />
            </li>
          ) : null}
          {shown.map((member, index) => (
            <li key={member.userId} role="none">
              <DropdownItem
                aria-selected={index === highlightedIndex}
                className="gap-2"
                onClick={() => selectMember(member)}
                onMouseEnter={() => setHighlightedIndex(index)}
                role="option"
              >
                <MemberAvatar
                  className="size-6"
                  decorative
                  name={member.displayName}
                />
                {memberLabel(member)}
              </DropdownItem>
            </li>
          ))}
          {shown.length === 0 && !isSearching ? (
            <li className="px-2 py-3 text-sm text-muted-foreground">
              No members found
            </li>
          ) : null}
          {members.status === "CanLoadMore" ||
          members.status === "LoadingMore" ? (
            <li className="px-2 py-1 flex justify-center">
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
