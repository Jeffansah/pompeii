import { useLayoutEffect, useState, type CSSProperties, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { CoupleStep } from "@/components/wedding/create/steps/couple";
import { DateStep } from "@/components/wedding/create/steps/date";
import { InviteStep } from "@/components/wedding/create/steps/invite";
import { NameStep } from "@/components/wedding/create/steps/name";
import { RecapStep } from "@/components/wedding/create/steps/recap";
import { WhereStep } from "@/components/wedding/create/steps/where";
import { useCreateWeddingStepper } from "@/hooks/wedding/create/use-create-wedding-stepper";
import {
  CREATE_WEDDING_DONE_STEP,
  SAVE_ERROR_MESSAGE,
} from "@/stores/wedding/create/stepper";

function pageFromX(pageId: number, currentPage: number) {
  if (pageId < currentPage) {
    return "calc(var(--page-slide-distance) * -1)";
  }
  return "var(--page-slide-distance)";
}

export function CreateWeddingStepper() {
  const {
    isReady,
    currentStep,
    draft,
    saveError,
    savingStep,
    continueName,
    continueCouple,
    continueDate,
    skipDate,
    continueWhere,
    skipWhere,
    continueInvite,
    skipInvite,
    retry,
    goBack,
    goToFailedStep,
  } = useCreateWeddingStepper();
  const [exitEnabled, setExitEnabled] = useState(false);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      setExitEnabled(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!isReady) {
    return null;
  }

  const currentPage = Math.min(currentStep, CREATE_WEDDING_DONE_STEP);

  const retrySave = () => {
    void retry();
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      {saveError ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-destructive">{SAVE_ERROR_MESSAGE}</p>
          <div className="flex items-center gap-4">
            <Button type="button" className="h-12" onClick={retrySave}>
              Retry
            </Button>
            <Button
              type="button"
              variant="link"
              className="h-12 px-0"
              onClick={goToFailedStep}
            >
              Go back
            </Button>
          </div>
        </div>
      ) : null}
      <div
        className="t-page-slide"
        data-page={String(currentPage)}
        style={
          {
            "--page-exit-enabled": exitEnabled ? 1 : 0,
          } as CSSProperties
        }
      >
        <SlidePage pageId={1} currentPage={currentPage}>
          <NameStep
            defaultName={draft.name ?? ""}
            isActive={currentPage === 1}
            isSaving={savingStep === 1}
            onContinue={continueName}
          />
        </SlidePage>
        <SlidePage pageId={2} currentPage={currentPage}>
          <CoupleStep
            defaultCoupleA={draft.coupleA ?? ""}
            defaultCoupleB={draft.coupleB ?? ""}
            isActive={currentPage === 2}
            isSaving={savingStep === 2}
            onBack={goBack}
            onContinue={continueCouple}
          />
        </SlidePage>
        <SlidePage pageId={3} currentPage={currentPage}>
          <DateStep
            defaultDate={draft.date ?? ""}
            isActive={currentPage === 3}
            isSaving={savingStep === 3}
            onBack={goBack}
            onContinue={continueDate}
            onSkip={skipDate}
          />
        </SlidePage>
        <SlidePage pageId={4} currentPage={currentPage}>
          <WhereStep
            defaultCity={draft.city ?? ""}
            defaultCountry={draft.country ?? ""}
            defaultLat={draft.lat}
            defaultLng={draft.lng}
            defaultPlaceId={draft.placeId ?? ""}
            isActive={currentPage === 4}
            isSaving={savingStep === 4}
            onBack={goBack}
            onContinue={continueWhere}
            onSkip={skipWhere}
          />
        </SlidePage>
        <SlidePage pageId={5} currentPage={currentPage}>
          <InviteStep
            defaultInviteEmail={draft.inviteEmail ?? ""}
            isActive={currentPage === 5}
            isSaving={savingStep === 5}
            onBack={goBack}
            onContinue={continueInvite}
            onSkip={skipInvite}
          />
        </SlidePage>
        <SlidePage pageId={6} currentPage={currentPage}>
          <RecapStep
            draft={draft}
            isActive={currentPage === 6}
            onBack={goBack}
          />
        </SlidePage>
      </div>
    </div>
  );
}

function SlidePage({
  pageId,
  currentPage,
  children,
}: {
  pageId: number;
  currentPage: number;
  children: ReactNode;
}) {
  return (
    <section
      className="t-page"
      data-page-id={String(pageId)}
      aria-hidden={currentPage !== pageId}
      style={
        {
          "--t-page-from-x": pageFromX(pageId, currentPage),
        } as CSSProperties
      }
    >
      {children}
    </section>
  );
}
