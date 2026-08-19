import { Button } from "@/components/ui/button";

export function StepNav({
  isSaving,
  canContinue = true,
  onBack,
  onSkip,
}: {
  isSaving: boolean;
  canContinue?: boolean;
  onBack: () => void;
  onSkip?: () => void;
}) {
  const skip = () => {
    onSkip?.();
  };

  return (
    <>
      <Button
        type="submit"
        className="h-12"
        pending={isSaving}
        disabled={!canContinue}
      >
        Continue
      </Button>
      {onSkip ? (
        <Button
          type="button"
          variant="secondary"
          className="h-12"
          disabled={isSaving}
          onClick={skip}
        >
          Skip
        </Button>
      ) : null}
      <Button
        type="button"
        variant="link"
        className="h-12 px-0"
        onClick={onBack}
      >
        Back
      </Button>
    </>
  );
}
