import { useEffect } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@pompeii/api";

import { slugify } from "@/lib/wedding/create/slugify";
import {
  useCreateWeddingStepperStore,
  type DraftFields,
} from "@/stores/wedding/create/stepper";
import type { CoupleSchema } from "@/schemas/wedding/create/couple-schema";
import type { DateSchema } from "@/schemas/wedding/create/date-schema";
import type { InviteSchema } from "@/schemas/wedding/create/invite-schema";
import type { NameSchema } from "@/schemas/wedding/create/name-schema";
import type { WhereSchema } from "@/schemas/wedding/create/where-schema";

export function useCreateWeddingStepper() {
  const hasHydrated = useCreateWeddingStepperStore((state) => state.hasHydrated);
  const currentStep = useCreateWeddingStepperStore((state) => state.currentStep);
  const draft = useCreateWeddingStepperStore((state) => state.draft);
  const saveError = useCreateWeddingStepperStore((state) => state.saveError);
  const inFlight = useCreateWeddingStepperStore((state) => state.inFlight);
  const pending = useCreateWeddingStepperStore((state) => state.pending);

  const { isAuthenticated } = useConvexAuth();
  const serverDraft = useQuery(
    api.weddings.getDraft.handler.getDraft,
    isAuthenticated ? {} : "skip",
  );
  const saveDraft = useMutation(api.weddings.saveDraft.handler.saveDraft);

  useEffect(() => {
    if (!hasHydrated || serverDraft === undefined) {
      return;
    }
    useCreateWeddingStepperStore.getState().reconcileFromServer(serverDraft);
  }, [hasHydrated, serverDraft]);

  const saveStep = async (step: number, patch: DraftFields) => {
    useCreateWeddingStepperStore.getState().commitStep({ step, patch });
    try {
      const { slug: _slug, ...serverPatch } = patch;
      await saveDraft({ step, ...serverPatch });
      useCreateWeddingStepperStore.getState().ackPending();
    } catch {
      useCreateWeddingStepperStore.getState().failPending();
    }
  };

  const continueName = async ({ name }: NameSchema) => {
    await saveStep(1, { name, slug: slugify(name) });
  };

  const continueCouple = async ({ coupleA, coupleB }: CoupleSchema) => {
    await saveStep(2, { coupleA, coupleB });
  };

  const continueDate = async ({ date }: DateSchema) => {
    await saveStep(3, { date });
  };

  const skipDate = async () => {
    await saveStep(3, {});
  };

  const continueWhere = async ({
    city,
    country,
    lat,
    lng,
    placeId,
  }: WhereSchema) => {
    await saveStep(4, { city, country, lat, lng, placeId });
  };

  const skipWhere = async () => {
    await saveStep(4, {});
  };

  const continueInvite = async ({ inviteEmail }: InviteSchema) => {
    await saveStep(5, { inviteEmail });
  };

  const skipInvite = async () => {
    await saveStep(5, {});
  };

  const retry = async () => {
    const pending = useCreateWeddingStepperStore.getState().pending;
    if (!pending) {
      return;
    }
    useCreateWeddingStepperStore.getState().beginRetry();
    try {
      await saveDraft({ step: pending.step, ...pending.patch });
      useCreateWeddingStepperStore.getState().ackPending();
    } catch {
      useCreateWeddingStepperStore.getState().failPending();
    }
  };

  const goBack = () => {
    useCreateWeddingStepperStore.getState().goBack();
  };

  const goToFailedStep = () => {
    useCreateWeddingStepperStore.getState().goToFailedStep();
  };

  return {
    isReady: hasHydrated,
    currentStep,
    draft,
    saveError,
    inFlight,
    savingStep: inFlight ? (pending?.step ?? null) : null,
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
  };
}
