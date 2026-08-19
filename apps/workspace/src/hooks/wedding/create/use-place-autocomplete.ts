import { useQuery } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { api } from "@pompeii/api";

import { useDebouncedValue } from "@/hooks/shared/use-debounced-value";

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const AUTOCOMPLETE_STALE_MS = 5 * 60 * 1000;

export function usePlaceAutocomplete(input: string, sessionToken: string) {
  const convex = useConvex();
  const debouncedInput = useDebouncedValue(input.trim(), SEARCH_DEBOUNCE_MS);
  const enabled = debouncedInput.length >= MIN_QUERY_LENGTH;

  const query = useQuery({
    queryKey: ["places", "autocomplete", debouncedInput],
    queryFn: () =>
      convex.action(api.places.autocomplete.handler.autocomplete, {
        input: debouncedInput,
        sessionToken,
      }),
    enabled,
    staleTime: AUTOCOMPLETE_STALE_MS,
    retry: 1,
  });

  return {
    ...query,
    debouncedInput,
    isWaiting: enabled && input.trim() !== debouncedInput,
  };
}
