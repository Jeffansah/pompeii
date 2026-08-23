import type { Id } from "@pompeii/api";
import { api } from "@pompeii/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TaskAssigneeField } from "./task-assignee-field";
import { TaskCategoryChips } from "./task-category-chips";
import { TaskPriorityChips } from "./task-priority-chips";
import type { Task } from "./task-table";
import {
  taskCreateSchema,
  type TaskCreateSchema,
} from "@/schemas/wedding/tasks/create-schema";
import { clientErrorMessage } from "@pompeii/errors/client";

const valuesFor = (task: Task): TaskCreateSchema => ({
  title: task.title,
  dueDate: task.dueDate ?? "",
  priority: task.priority,
  category: task.category ?? "",
  notes: task.notes ?? "",
  assignedTo: task.assignedTo ?? "",
});

export function TaskEditDialog({
  task,
  weddingId,
  onOpenChange,
}: {
  task: Task | null;
  weddingId: Id<"weddings">;
  onOpenChange: (open: boolean) => void;
}) {
  const convex = useConvex();
  const form = useForm<TaskCreateSchema>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: task ? valuesFor(task) : undefined,
    mode: "onChange",
  });
  useEffect(() => {
    if (task) form.reset(valuesFor(task));
  }, [form, task]);
  const updateTask = useMutation({
    mutationFn: (values: TaskCreateSchema) =>
      convex.mutation(api.tasks.update.handler.update, {
        weddingId,
        taskId: task!._id,
        title: values.title,
        notes: values.notes || null,
        dueDate: values.dueDate || null,
        priority: values.priority,
        category: values.category || null,
        assignedTo: (values.assignedTo || null) as Id<"users"> | null,
      }),
    onSuccess: () => {
      toast.success("Task updated");
      onOpenChange(false);
    },
  });
  const onSubmit = async (values: TaskCreateSchema) => {
    try {
      await updateTask.mutateAsync(values);
    } catch (error) {
      toast.error("Task could not be updated", {
        description: clientErrorMessage(error),
      });
    }
  };
  return (
    <Dialog onOpenChange={onOpenChange} open={task !== null}>
      <DialogContent className="gap-6">
        <DialogHeader className="text-left">
          <DialogTitle className="font-serif text-2xl font-normal">
            Edit task
          </DialogTitle>
          <DialogDescription>
            Update the details for this task.
          </DialogDescription>
        </DialogHeader>
        <Form
          {...form}
          className="grid gap-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task title</FormLabel>
                <FormControl>
                  <Input {...field} variant="line" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={(value) => field.onChange(value ?? "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee</FormLabel>
                <FormControl>
                  <TaskAssigneeField
                    {...field}
                    onChange={field.onChange}
                    weddingId={weddingId}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <TaskPriorityChips {...field} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <TaskCategoryChips {...field} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} variant="line" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="sm:justify-start">
            <Button
              disabled={!form.formState.isValid || !form.formState.isDirty}
              pending={updateTask.isPending}
              type="submit"
            >
              Save changes
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
