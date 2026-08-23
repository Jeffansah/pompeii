import { z } from "zod";

export const taskSearchSchema = z.object({
  status: z.enum(["todo", "in_progress", "completed"]).catch("todo"),
  sort: z
    .enum([
      "default",
      "dueDateAsc",
      "dueDateDesc",
      "priority",
      "createdDesc",
      "createdAsc",
    ])
    .catch("default"),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  category: z.string().optional(),
  title: z.string().optional(),
  assignee: z.string().optional(),
  dueFrom: z.string().optional(),
  dueTo: z.string().optional(),
});

export type TaskSearch = z.infer<typeof taskSearchSchema>;
