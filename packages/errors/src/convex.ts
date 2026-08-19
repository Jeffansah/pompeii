import { ConvexError } from "convex/values";

import { AppErrorCode, appErrorMessages } from "./codes";
import type { ClientErrorData } from "./types";

export {
  AppErrorCode,
  appErrorMessages,
  COUPLE_NAME_MAX_LENGTH,
  PLACE_ID_MAX_LENGTH,
  PLACE_MAX_LENGTH,
  WEDDING_NAME_MAX_LENGTH,
} from "./codes";

export function throwAppError(code: AppErrorCode): never {
  throw new ConvexError({
    code,
    message: appErrorMessages[code],
  } satisfies ClientErrorData);
}
