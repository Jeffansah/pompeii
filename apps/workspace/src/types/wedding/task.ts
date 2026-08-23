import { api } from "@pompeii/api";
import type { Id } from "@pompeii/api";
import type { FunctionReturnType } from "convex/server";

type TaskListResult = FunctionReturnType<typeof api.tasks.list.handler.list>;

export type Task = TaskListResult["page"][number];

export type TaskDetail = NonNullable<
  FunctionReturnType<typeof api.tasks.get.handler.get>
>;

export type TaskCapabilities = Task["capabilities"];
export type TaskId = Id<"tasks">;
