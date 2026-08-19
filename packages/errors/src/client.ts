import { ConvexError } from "convex/values";

import { isClientErrorData, type ClientErrorData } from "./types";

export class ClientError extends Error {
  readonly code: string;

  constructor(data: ClientErrorData) {
    super(data.message);
    this.name = "ClientError";
    this.code = data.code;
  }
}

export function clientErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
): string {
  return normalizeClientError(error, fallback).message;
}

export function normalizeClientError(
  error: unknown,
  fallback = "Something went wrong.",
): ClientError {
  const parsed = parseClientError(error);
  if (parsed) {
    return new ClientError(parsed);
  }

  const clientMessage = readClientErrorMessage(error);
  if (clientMessage) {
    return new ClientError({
      code: readClientErrorCode(error) ?? "UNKNOWN",
      message: clientMessage,
    });
  }

  return new ClientError({
    code: "UNKNOWN",
    message: fallback,
  });
}

export function parseClientError(error: unknown): ClientErrorData | null {
  if (error instanceof ClientError) {
    return { code: error.code, message: error.message };
  }

  if (error instanceof ConvexError && isClientErrorData(error.data)) {
    return error.data;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    isClientErrorData(error.data)
  ) {
    return error.data;
  }

  return null;
}

function readClientErrorCode(error: unknown): string | null {
  if (error && typeof error === "object" && "code" in error) {
    const code = error.code;
    if (typeof code === "string" && code.length > 0) {
      return code;
    }
  }

  return null;
}

function readClientErrorMessage(error: unknown): string | null {
  if (error instanceof Error) {
    const message = error.message.trim();
    return message.length > 0 ? message : null;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = error.message;
    if (typeof message === "string") {
      const trimmed = message.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  }

  return null;
}
