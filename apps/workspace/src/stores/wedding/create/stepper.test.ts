import { describe, expect, it } from "vitest";

import {
  SAVE_ERROR_MESSAGE,
  createWeddingStepperStore,
} from "./stepper";

function storeWithNamePending() {
  const store = createWeddingStepperStore();
  store.getState().commitStep({
    step: 1,
    patch: { name: "Amara & Tomi", slug: "amara-tomi" },
  });
  return store;
}

describe("create-wedding-stepper-store", () => {
  it("commits a step into the WAL and advances immediately", () => {
    const store = storeWithNamePending();
    const state = store.getState();
    expect(state.draft).toEqual({ name: "Amara & Tomi", slug: "amara-tomi" });
    expect(state.pending).toEqual({
      step: 1,
      patch: { name: "Amara & Tomi", slug: "amara-tomi" },
    });
    expect(state.currentStep).toBe(2);
    expect(state.inFlight).toBe(true);
    expect(state.saveError).toBeNull();
  });

  it("acks a pending write", () => {
    const store = storeWithNamePending();
    store.getState().ackPending();
    const state = store.getState();
    expect(state.pending).toBeNull();
    expect(state.inFlight).toBe(false);
    expect(state.ackedStep).toBe(1);
    expect(state.currentStep).toBe(2);
  });

  it("keeps pending on failure and restores it for retry", () => {
    const store = storeWithNamePending();
    store.getState().failPending();
    expect(store.getState().pending?.step).toBe(1);
    expect(store.getState().inFlight).toBe(false);
    expect(store.getState().saveError).toBe(SAVE_ERROR_MESSAGE);
    expect(store.getState().currentStep).toBe(2);

    store.getState().beginRetry();
    expect(store.getState().inFlight).toBe(true);
    expect(store.getState().saveError).toBeNull();
    expect(store.getState().pending?.patch).toEqual({
      name: "Amara & Tomi",
      slug: "amara-tomi",
    });
  });

  it("goes back to the failed step", () => {
    const store = storeWithNamePending();
    store.getState().failPending();
    store.getState().goToFailedStep();
    expect(store.getState().currentStep).toBe(1);
  });

  it("shows the save error when pending is ahead of the server", () => {
    const store = storeWithNamePending();
    store.getState().failPending();
    store.getState().reconcileFromServer(null);
    expect(store.getState().saveError).toBe(SAVE_ERROR_MESSAGE);
    expect(store.getState().currentStep).toBe(2);
  });

  it("lets the server win when there is no pending write", () => {
    const store = createWeddingStepperStore();
    store.getState().reconcileFromServer({
      step: 1,
      name: "Amara & Tomi",
      slug: "amara-tomi",
    });
    const state = store.getState();
    expect(state.draft).toEqual({ name: "Amara & Tomi", slug: "amara-tomi" });
    expect(state.ackedStep).toBe(1);
    expect(state.currentStep).toBe(1);
  });

  it("commits couple names and advances to the date step", () => {
    const store = storeWithNamePending();
    store.getState().ackPending();
    store.getState().commitStep({
      step: 2,
      patch: { coupleA: "Amara", coupleB: "Tomi" },
    });
    const state = store.getState();
    expect(state.draft).toEqual({
      name: "Amara & Tomi",
      slug: "amara-tomi",
      coupleA: "Amara",
      coupleB: "Tomi",
    });
    expect(state.currentStep).toBe(3);
    expect(state.pending?.step).toBe(2);
  });

  it("advances past invite onto the done screen", () => {
    const store = createWeddingStepperStore();
    store.getState().commitStep({ step: 5, patch: {} });
    expect(store.getState().currentStep).toBe(6);
    expect(store.getState().pending?.step).toBe(5);
  });
});
