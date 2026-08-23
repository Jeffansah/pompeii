import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { api } from "@pompeii/api";
import { clientErrorMessage } from "@pompeii/errors/client";

import { DropdownItem, DropdownList } from "@/components/ui/dropdown-list";
import { Input } from "@/components/ui/input";
import { TextSwap } from "@/components/ui/text-swap";
import { usePlaceAutocomplete } from "@/hooks/wedding/create/use-place-autocomplete";
import type { WhereSchema } from "@/schemas/wedding/create/where-schema";

export function PlaceSearchField({
  selectedLabel,
  hasSelection,
  onClear,
  onSelect,
}: {
  selectedLabel: string;
  hasSelection: boolean;
  onClear: () => void;
  onSelect: (place: WhereSchema) => void;
}) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const convex = useConvex();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState(selectedLabel);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [sessionToken, setSessionToken] = useState(() => crypto.randomUUID());
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const searchInput = hasSelection ? "" : query;
  const { data, error, isFetching, isWaiting, debouncedInput } =
    usePlaceAutocomplete(searchInput, sessionToken);
  const suggestions = data?.suggestions ?? [];
  const searchError = error ? clientErrorMessage(error) : detailsError;
  const showList =
    isOpen &&
    !hasSelection &&
    (isWaiting ||
      isFetching ||
      isSelecting ||
      suggestions.length > 0 ||
      (debouncedInput.length >= 2 && !isFetching));

  useEffect(() => {
    setQuery(selectedLabel);
  }, [selectedLabel]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [debouncedInput]);

  useEffect(() => {
    const closeOnPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }
      if (wrapRef.current?.contains(event.target)) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnPointerDown);
    return () =>
      document.removeEventListener("pointerdown", closeOnPointerDown);
  }, []);

  const openList = () => {
    setIsOpen(true);
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setDetailsError(null);
    if (hasSelection) {
      onClear();
    }
    setIsOpen(true);
  };

  const selectSuggestion = async (placeId: string) => {
    setIsSelecting(true);
    setDetailsError(null);
    try {
      const place = await queryClient.fetchQuery({
        queryKey: ["places", "details", placeId],
        queryFn: () =>
          convex.action(api.places.details.handler.details, {
            placeId,
            sessionToken,
          }),
        staleTime: Infinity,
      });
      onSelect(place);
      setQuery(`${place.city}, ${place.country}`);
      setIsOpen(false);
      setSessionToken(crypto.randomUUID());
    } catch (caught) {
      setDetailsError(clientErrorMessage(caught));
    } finally {
      setIsSelecting(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (!showList || suggestions.length === 0) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => (index + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex(
        (index) => (index - 1 + suggestions.length) % suggestions.length,
      );
      return;
    }
    if (event.key === "Enter") {
      const suggestion = suggestions[highlightedIndex];
      if (!suggestion) {
        return;
      }
      event.preventDefault();
      void selectSuggestion(suggestion.placeId);
    }
  };

  const listStatus = isSelecting
    ? "Loading…"
    : suggestions.length === 0 && (isWaiting || isFetching)
      ? "Searching…"
      : suggestions.length === 0 && debouncedInput.length >= 2 && !isFetching
        ? "No cities found."
        : null;

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          aria-label="City and country"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={showList}
          autoComplete="off"
          placeholder="Search for a city"
          role="combobox"
          className="h-12 pl-9"
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
          onFocus={openList}
          onKeyDown={onKeyDown}
        />
      </div>
      {showList ? (
        <DropdownList
          className="absolute mt-1 rounded-md"
          id={listId}
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.placeId} role="none">
              <DropdownItem
                aria-selected={index === highlightedIndex}
                className="flex-col items-start rounded-sm"
                onClick={() => void selectSuggestion(suggestion.placeId)}
                onMouseEnter={() => setHighlightedIndex(index)}
                role="option"
              >
                <span>{suggestion.mainText || suggestion.label}</span>
                {suggestion.secondaryText ? (
                  <span className="text-xs text-muted-foreground">
                    {suggestion.secondaryText}
                  </span>
                ) : null}
              </DropdownItem>
            </li>
          ))}
          {listStatus ? (
            <li
              aria-live="polite"
              className="px-2 py-2 text-sm text-muted-foreground"
            >
              <TextSwap>{listStatus}</TextSwap>
            </li>
          ) : null}
        </DropdownList>
      ) : null}
      {searchError ? (
        <p className="t-error-msg text-sm text-destructive">{searchError}</p>
      ) : null}
    </div>
  );
}
