import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export type DraftFields = {
  name?: string;
  slug?: string;
  coupleA?: string;
  coupleB?: string;
  date?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  inviteEmail?: string;
};

export type PendingWrite = {
  step: number;
  patch: DraftFields;
};

export type ServerDraft = DraftFields & {
  step: number;
};

export const CREATE_WEDDING_STEPPER_STORAGE_KEY =
  "pompeii.create-wedding-stepper";
export const CREATE_WEDDING_STEP_COUNT = 5;
export const CREATE_WEDDING_DONE_STEP = CREATE_WEDDING_STEP_COUNT + 1;
export const SAVE_ERROR_MESSAGE = "This step didn't save, go back or retry.";

function draftFromServer(server: ServerDraft): DraftFields {
  const { step: _step, ...fields } = server;
  return fields;
}

function clampStep(step: number, maxStep: number) {
  return Math.min(Math.max(step, 1), Math.max(maxStep, 1));
}

export type CreateWeddingStepperStore = {
  draft: DraftFields;
  currentStep: number;
  ackedStep: number;
  pending: PendingWrite | null;
  saveError: string | null;
  inFlight: boolean;
  hasHydrated: boolean;
  commitStep: (input: { step: number; patch: DraftFields }) => void;
  ackPending: () => void;
  failPending: () => void;
  beginRetry: () => void;
  goBack: () => void;
  goToFailedStep: () => void;
  reconcileFromServer: (server: ServerDraft | null) => void;
  setHasHydrated: (value: boolean) => void;
  reset: () => void;
};

const initialState = {
  draft: {} as DraftFields,
  currentStep: 1,
  ackedStep: 0,
  pending: null as PendingWrite | null,
  saveError: null as string | null,
  inFlight: false,
};

export function createStepperState(
  set: (
    partial:
      | Partial<CreateWeddingStepperStore>
      | ((
          state: CreateWeddingStepperStore,
        ) => Partial<CreateWeddingStepperStore>),
  ) => void,
  get: () => CreateWeddingStepperStore,
  hasHydrated: boolean,
): CreateWeddingStepperStore {
  return {
    ...initialState,
    hasHydrated,
    commitStep: ({ step, patch }) => {
      set({
        draft: { ...get().draft, ...patch },
        pending: { step, patch },
        inFlight: true,
        saveError: null,
        currentStep: Math.min(step + 1, CREATE_WEDDING_DONE_STEP),
      });
    },
    ackPending: () => {
      const pending = get().pending;
      set({
        pending: null,
        inFlight: false,
        saveError: null,
        ackedStep: pending?.step ?? get().ackedStep,
      });
    },
    failPending: () => {
      set({
        inFlight: false,
        saveError: SAVE_ERROR_MESSAGE,
      });
    },
    beginRetry: () => {
      if (!get().pending) {
        return;
      }
      set({ inFlight: true, saveError: null });
    },
    goBack: () => {
      set({ currentStep: Math.max(1, get().currentStep - 1) });
    },
    goToFailedStep: () => {
      const pending = get().pending;
      if (!pending) {
        return;
      }
      set({ currentStep: pending.step });
    },
    reconcileFromServer: (server) => {
      const { pending, inFlight, currentStep } = get();

      if (inFlight) {
        if (server && pending && server.step >= pending.step) {
          set({
            pending: null,
            inFlight: false,
            saveError: null,
            ackedStep: server.step,
            draft: draftFromServer(server),
          });
        }
        return;
      }

      if (pending) {
        if (server && server.step >= pending.step) {
          set({
            pending: null,
            saveError: null,
            ackedStep: server.step,
            draft: draftFromServer(server),
            currentStep: clampStep(currentStep, server.step + 1),
          });
          return;
        }
        set({ saveError: SAVE_ERROR_MESSAGE });
        return;
      }

      if (!server) {
        return;
      }

      set({
        draft: draftFromServer(server),
        ackedStep: server.step,
        currentStep: clampStep(currentStep, server.step + 1),
        saveError: null,
      });
    },
    setHasHydrated: (value) => {
      set({ hasHydrated: value });
    },
    reset: () => {
      set({ ...initialState, hasHydrated: get().hasHydrated });
    },
  };
}

export function createWeddingStepperStore() {
  return createStore<CreateWeddingStepperStore>()((set, get) =>
    createStepperState(set, get, true),
  );
}

export const useCreateWeddingStepperStore = create<CreateWeddingStepperStore>()(
  persist((set, get) => createStepperState(set, get, false), {
    name: CREATE_WEDDING_STEPPER_STORAGE_KEY,
    partialize: (state) => ({
      draft: state.draft,
      currentStep: state.currentStep,
      ackedStep: state.ackedStep,
      pending: state.pending,
    }),
    onRehydrateStorage: () => (state) => {
      state?.setHasHydrated(true);
    },
  }),
);

if (useCreateWeddingStepperStore.persist.hasHydrated()) {
  useCreateWeddingStepperStore.setState({ hasHydrated: true });
}
