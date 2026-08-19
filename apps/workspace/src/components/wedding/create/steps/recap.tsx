import type { ReactNode } from "react";
import { format, isValid, parse } from "date-fns";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StepLayout } from "@/components/wedding/create/step-layout";
import { useCreateWedding } from "@/hooks/wedding/create/use-create-wedding";
import type { DraftFields } from "@/stores/wedding/create/stepper";

export function RecapStep({
  draft,
  isActive,
  onBack,
}: {
  draft: DraftFields;
  isActive: boolean;
  onBack: () => void;
}) {
  const { isCreating, createError, confirmCreate } = useCreateWedding();

  const confirm = () => {
    void confirmCreate();
  };

  return (
    <StepLayout step={6} title="Recap" isActive={isActive} showProgress={false}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <RecapField label="Name">
            <p>{draft.name}</p>
            {draft.slug ? (
              <p className="text-sm text-muted-foreground">
                wedding.pompeii.com/{draft.slug}
              </p>
            ) : null}
          </RecapField>
          <Separator />
          <RecapField label="Couple">
            <p>
              {draft.coupleA} and {draft.coupleB}
            </p>
          </RecapField>
          <Separator />
          <RecapField label="Date">
            <p>{dateValue(draft.date)}</p>
          </RecapField>
          <Separator />
          <RecapField label="Where">
            <p>{placeValue(draft)}</p>
          </RecapField>
          <Separator />
          <RecapField label="Invited Partner Email">
            <p>{inviteValue(draft.inviteEmail)}</p>
          </RecapField>
        </div>
        {createError ? (
          <p className="text-sm text-destructive">{createError}</p>
        ) : null}
        <Button
          type="button"
          className="h-12"
          pending={isCreating}
          onClick={confirm}
        >
          Let's get married!
        </Button>
        <Button
          type="button"
          variant="link"
          className="h-12 px-0"
          disabled={isCreating}
          onClick={onBack}
        >
          Back
        </Button>
      </div>
    </StepLayout>
  );
}

function RecapField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function dateValue(date: string | undefined) {
  if (date === undefined || date.length === 0) {
    return "We'll add this later";
  }
  const parsed = parse(date, "yyyy-MM-dd", new Date());
  if (!isValid(parsed)) {
    return "We'll add this later";
  }
  return format(parsed, "d MMMM yyyy");
}

function placeValue(draft: DraftFields) {
  if (draft.city && draft.country) {
    return `${draft.city}, ${draft.country}`;
  }
  return "We'll add this later";
}

function inviteValue(email: string | undefined) {
  if (email !== undefined && email.length > 0) {
    return email;
  }
  return "None";
}
