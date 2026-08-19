import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";

import { AppErrorCode, appErrorMessages } from "../src/codes";
import { throwAppError } from "../src/convex";

describe("throwAppError", () => {
  it("throws a generic catalog message", () => {
    expect.assertions(2);
    try {
      throwAppError(AppErrorCode.UNAUTHENTICATED);
    } catch (error) {
      expect(error).toBeInstanceOf(ConvexError);
      expect(error instanceof ConvexError && error.data).toEqual({
        code: AppErrorCode.UNAUTHENTICATED,
        message: appErrorMessages.UNAUTHENTICATED,
      });
    }
  });

  it("throws a domain catalog message", () => {
    expect.assertions(2);
    try {
      throwAppError(AppErrorCode.weddings.createWedding.NAME_REQUIRED);
    } catch (error) {
      expect(error).toBeInstanceOf(ConvexError);
      expect(error instanceof ConvexError && error.data).toEqual({
        code: AppErrorCode.weddings.createWedding.NAME_REQUIRED,
        message: appErrorMessages.WEDDINGS_CREATE_WEDDING_NAME_REQUIRED,
      });
    }
  });
});
