import { describe, expect, it } from "vitest";

import {
  AppErrorCode,
  COUPLE_NAME_MAX_LENGTH,
  getErrorMessage,
  WEDDING_NAME_MAX_LENGTH,
} from "../src/codes";

describe("AppErrorCode", () => {
  it("scopes create-wedding errors under weddings.createWedding", () => {
    expect(AppErrorCode.weddings.createWedding.NAME_REQUIRED).toBe(
      "WEDDINGS_CREATE_WEDDING_NAME_REQUIRED",
    );
    expect(
      getErrorMessage(AppErrorCode.weddings.createWedding.NAME_REQUIRED),
    ).toBe("Add a name so we can put a label on your wedding.");
    expect(
      getErrorMessage(AppErrorCode.weddings.createWedding.NAME_TOO_LONG),
    ).toBe(`That's a bit long, ${WEDDING_NAME_MAX_LENGTH} characters max.`);
    expect(
      getErrorMessage(AppErrorCode.weddings.createWedding.COUPLE_A_REQUIRED),
    ).toBe("Add your name.");
    expect(
      getErrorMessage(AppErrorCode.weddings.createWedding.COUPLE_B_REQUIRED),
    ).toBe("Add your partner's name.");
    expect(
      getErrorMessage(AppErrorCode.weddings.createWedding.COUPLE_NAME_TOO_LONG),
    ).toBe(`That's a bit long, ${COUPLE_NAME_MAX_LENGTH} characters max.`);
    expect(
      getErrorMessage(AppErrorCode.weddings.createWedding.DATE_INVALID),
    ).toBe("Pick a real date.");
    expect(
      getErrorMessage(AppErrorCode.weddings.createWedding.DATE_IN_PAST),
    ).toBe("Pick a date from today onward.");
    expect(
      getErrorMessage(AppErrorCode.weddings.createWedding.INVITE_EMAIL_INVALID),
    ).toBe("That doesn't look like an email.");
    expect(
      getErrorMessage(AppErrorCode.weddings.createWedding.PLACE_REQUIRED),
    ).toBe("Pick a city from the list.");
    expect(AppErrorCode.weddings.enter.NOT_FOUND).toBe(
      "WEDDINGS_ENTER_NOT_FOUND",
    );
    expect(getErrorMessage(AppErrorCode.weddings.enter.NOT_FOUND)).toBe(
      "Not found.",
    );
  });

  it("scopes places errors under places", () => {
    expect(AppErrorCode.places.RATE_LIMITED).toBe("PLACES_RATE_LIMITED");
    expect(getErrorMessage(AppErrorCode.places.RATE_LIMITED)).toBe(
      "Too many searches, wait a moment and try again.",
    );
  });

  it("scopes magic-link errors under login.magicLink", () => {
    expect(AppErrorCode.login.magicLink.EMAIL_REQUIRED).toBe(
      "LOGIN_MAGIC_LINK_EMAIL_REQUIRED",
    );
    expect(getErrorMessage(AppErrorCode.login.magicLink.EMAIL_REQUIRED)).toBe(
      "Enter your email so we can send the link.",
    );
    expect(getErrorMessage(AppErrorCode.login.magicLink.EMAIL_INVALID)).toBe(
      "That doesn't look like an email.",
    );
  });
});
