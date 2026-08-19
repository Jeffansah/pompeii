export type ClientErrorData = {
  code: string;
  message: string;
};

export function isClientErrorData(value: unknown): value is ClientErrorData {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value &&
    typeof value.code === "string" &&
    typeof value.message === "string"
  );
}
