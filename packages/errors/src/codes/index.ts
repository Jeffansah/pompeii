import { genericErrorCodes, genericErrorMessages } from "./generic";
import { loginErrorCodes, loginErrorMessages } from "./login";
import { placesErrorCodes, placesErrorMessages } from "./places";
import { weddingsErrorCodes, weddingsErrorMessages } from "./weddings";

export {
  COUPLE_NAME_MAX_LENGTH,
  PLACE_ID_MAX_LENGTH,
  PLACE_MAX_LENGTH,
  WEDDING_NAME_MAX_LENGTH,
} from "./weddings";

export const AppErrorCode = {
  ...genericErrorCodes,
  login: loginErrorCodes,
  places: placesErrorCodes,
  weddings: weddingsErrorCodes,
} as const;

type ErrorCodeLeaves<T> = T extends string
  ? T
  : T extends Record<string, unknown>
    ? { [K in keyof T]: ErrorCodeLeaves<T[K]> }[keyof T]
    : never;

export type AppErrorCode = ErrorCodeLeaves<typeof AppErrorCode>;

export const appErrorMessages = {
  ...genericErrorMessages,
  ...loginErrorMessages,
  ...placesErrorMessages,
  ...weddingsErrorMessages,
} as const satisfies Record<AppErrorCode, string>;

export function getErrorMessage(code: AppErrorCode): string {
  return appErrorMessages[code];
}
