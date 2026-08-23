import { HugeiconsIcon } from "@hugeicons/react";

import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons/arrow";
import { Button } from "@/components/ui/button";

export function TablePagination({
  canGoFirst,
  canGoNext,
  canGoPrevious,
  isLoading = false,
  onFirst,
  onNext,
  onPrevious,
}: {
  canGoFirst: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLoading?: boolean;
  onFirst: () => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <Button
        className="bg-transparent"
        disabled={!canGoFirst || isLoading}
        onClick={onFirst}
        size="sm"
        variant="outline"
      >
        <HugeiconsIcon icon={ArrowLeftIcon} />
        Back to first
      </Button>
      <div className="flex items-center gap-2">
        <Button
          className="bg-transparent"
          disabled={!canGoPrevious || isLoading}
          onClick={onPrevious}
          size="sm"
          variant="outline"
        >
          <HugeiconsIcon icon={ArrowLeftIcon} />
          Previous
        </Button>
        <Button
          className="bg-transparent"
          disabled={!canGoNext || isLoading}
          onClick={onNext}
          pending={isLoading}
          size="sm"
          variant="outline"
        >
          Next
          <HugeiconsIcon icon={ArrowRightIcon} />
        </Button>
      </div>
    </div>
  );
}
