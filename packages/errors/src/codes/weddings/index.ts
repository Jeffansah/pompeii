import {
  createWeddingErrorCodes,
  createWeddingErrorMessages,
} from "./create-wedding";
import {
  enterWeddingErrorCodes,
  enterWeddingErrorMessages,
} from "./enter";

export {
  COUPLE_NAME_MAX_LENGTH,
  PLACE_ID_MAX_LENGTH,
  PLACE_MAX_LENGTH,
  WEDDING_NAME_MAX_LENGTH,
} from "./create-wedding";

export const weddingsErrorCodes = {
  createWedding: createWeddingErrorCodes,
  enter: enterWeddingErrorCodes,
} as const;

export const weddingsErrorMessages = {
  ...createWeddingErrorMessages,
  ...enterWeddingErrorMessages,
} as const;
