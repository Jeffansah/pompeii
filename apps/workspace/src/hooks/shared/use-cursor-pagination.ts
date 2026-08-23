import { useEffect, useState } from "react";

type PaginatedData<T> = {
  page: T[];
  continueCursor: string;
  isDone: boolean;
};

type StoredPage<T> = {
  cursor: string | null;
  items: T[];
  loaded: boolean;
};

export function useCursorPagination<T>({
  contextKey,
  cursor,
  data,
  isFetching,
  isPending,
}: {
  contextKey: string;
  cursor: string | null;
  data: PaginatedData<T> | undefined;
  isFetching: boolean;
  isPending: boolean;
}) {
  const [pages, setPages] = useState<Array<StoredPage<T>>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pagesContextKey, setPagesContextKey] = useState(contextKey);
  const isCurrentContext = pagesContextKey === contextKey;
  const activePages = isCurrentContext ? pages : [];
  const effectiveIndex = isCurrentContext ? currentIndex : 0;
  const currentPage = activePages[effectiveIndex];
  const isCurrentPageLoading = currentPage?.loaded !== true;
  const displayedPage =
    isCurrentPageLoading && effectiveIndex > 0
      ? activePages[effectiveIndex - 1]
      : currentPage;

  useEffect(() => {
    setPages([]);
    setCurrentIndex(0);
    setPagesContextKey(contextKey);
  }, [contextKey]);

  useEffect(() => {
    if (!isCurrentContext) {
      return;
    }
    const pageIndex = pages.findIndex((page) => page.cursor === cursor);
    if (pageIndex !== -1) {
      setCurrentIndex(pageIndex);
      return;
    }
    setPages((previous) => [
      ...previous,
      { cursor, items: [], loaded: false },
    ]);
    setCurrentIndex(pages.length);
  }, [cursor, isCurrentContext, pages]);

  useEffect(() => {
    if (data === undefined) {
      return;
    }

    setPages((previous) => {
      const pageIndex = previous.findIndex((page) => page.cursor === cursor);
      const nextPage = { cursor, items: data.page, loaded: true };
      if (pageIndex === -1) {
        return [...previous, nextPage];
      }
      const next = [...previous];
      next[pageIndex] = nextPage;
      return next;
    });
  }, [cursor, data]);

  return {
    canGoNext:
      activePages.length > 0 && data !== undefined && !data.isDone,
    canGoPrevious: effectiveIndex > 0,
    isLoading:
      isPending &&
      effectiveIndex === 0 &&
      isCurrentPageLoading,
    isNavigating: cursor !== null && isFetching,
    nextCursor:
      data !== undefined && !data.isDone ? data.continueCursor : null,
    page: displayedPage?.items ?? [],
    pageNumber: effectiveIndex + 1,
    previousCursor:
      effectiveIndex > 0
        ? (activePages[effectiveIndex - 1]?.cursor ?? null)
        : null,
  };
}
