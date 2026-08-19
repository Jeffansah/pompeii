import { useState } from "react";
import { useMutation } from "convex/react";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@pompeii/api";

import { useCreateWeddingStepperStore } from "@/stores/wedding/create/stepper";

export const CREATE_ERROR_MESSAGE =
  "This wedding didn't save, please try again.";

export function useCreateWedding() {
  const navigate = useNavigate();
  const createWedding = useMutation(api.weddings.create.handler.create);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const confirmCreate = async () => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const { slug } = await createWedding({});
      useCreateWeddingStepperStore.getState().reset();
      await navigate({ to: "/$slug", params: { slug } });
    } catch {
      setCreateError(CREATE_ERROR_MESSAGE);
    } finally {
      setIsCreating(false);
    }
  };

  return { isCreating, createError, confirmCreate };
}
