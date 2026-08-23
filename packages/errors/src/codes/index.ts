import { genericErrorCodes, genericErrorMessages } from "./generic";
import { commentsErrorCodes, commentsErrorMessages } from "./comments";
import { loginErrorCodes, loginErrorMessages } from "./login";
import { placesErrorCodes, placesErrorMessages } from "./places";
import { tasksErrorCodes, tasksErrorMessages } from "./tasks";
import { weddingsErrorCodes, weddingsErrorMessages } from "./weddings";

export {
  COUPLE_NAME_MAX_LENGTH,
  PLACE_ID_MAX_LENGTH,
  PLACE_MAX_LENGTH,
  WEDDING_NAME_MAX_LENGTH,
} from "./weddings";

export const AppErrorCode = {
  ...genericErrorCodes,
  comments: commentsErrorCodes,
  login: loginErrorCodes,
  places: placesErrorCodes,
  tasks: tasksErrorCodes,
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
  ...commentsErrorMessages,
  ...loginErrorMessages,
  ...placesErrorMessages,
  ...tasksErrorMessages,
  ...weddingsErrorMessages,
} as const satisfies Record<AppErrorCode, string>;

export function getErrorMessage(code: AppErrorCode): string {
  return appErrorMessages[code];
}
