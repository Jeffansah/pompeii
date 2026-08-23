import { api } from "@pompeii/api";
import type { FunctionArgs, FunctionReturnType } from "convex/server";

export type CommentSubject = FunctionArgs<
  typeof api.comments.summary.handler.summary
>["subject"];

export type CommentItem = FunctionReturnType<
  typeof api.comments.create.handler.create
>;

export type CommentRoot = Extract<CommentItem, { kind: "root" }>;
export type CommentReply = Extract<CommentItem, { kind: "reply" }>;
