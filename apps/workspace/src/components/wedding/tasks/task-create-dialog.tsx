import type { Id } from "@pompeii/api";
import { api } from "@pompeii/api";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { TaskAssigneeField } from "@/components/wedding/tasks/task-assignee-field";
import { TaskCategoryChips } from "@/components/wedding/tasks/task-category-chips";
import { TaskPriorityChips } from "@/components/wedding/tasks/task-priority-chips";
import {
  taskCreateSchema,
  type TaskCreateSchema,
} from "@/schemas/wedding/tasks/create-schema";

const emptyTask = {
  title: "",
  dueDate: "",
  priority: "normal",
  category: "",
  notes: "",
  assignedTo: "",
} as const;

export function TaskCreateDialog({
  weddingId,
  defaultOpen = false,
  variant = "secondary",
}: {
  weddingId: Id<"weddings">;
  defaultOpen?: boolean;
  variant?: "default" | "outline" | "secondary";
}) {
  const convex = useConvex();
  const [open, setOpen] = useState(defaultOpen);
  const form = useForm<TaskCreateSchema>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: emptyTask,
    mode: "onChange",
  });
  const createTask = useMutation({
    mutationFn: (values: TaskCreateSchema) =>
      convex.mutation(api.tasks.create.handler.create, {
        weddingId,
        title: values.title,
        ...(values.notes.length > 0 ? { notes: values.notes } : {}),
        ...(values.dueDate.length > 0 ? { dueDate: values.dueDate } : {}),
        priority: values.priority,
        ...(values.category.length > 0 ? { category: values.category } : {}),
        ...(values.assignedTo.length > 0
          ? { assignedTo: values.assignedTo as Id<"users"> }
          : {}),
      }),
    onSuccess: () => {
      form.reset(emptyTask);
      setOpen(false);
    },
  });

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      form.reset(emptyTask);
    }
  };

  const onSubmit = async (values: TaskCreateSchema) => {
    await createTask.mutateAsync(values);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <Button asChild size="sm" variant={variant}>
        <DialogTrigger>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={1.5} />
          Add new task
        </DialogTrigger>
      </Button>
      <DialogContent className="gap-8 p-8">
        <DialogHeader className="gap-1 text-left">
          <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            Task / New record
          </p>
          <DialogTitle className="font-serif text-3xl font-normal">
            Add task
          </DialogTitle>
          <DialogDescription className="sr-only">
            Keep the next thing clear and easy to move forward.
          </DialogDescription>
        </DialogHeader>
        <Form
          {...form}
          className="grid gap-8"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal text-muted-foreground">
                  Task title
                </FormLabel>
                <FormControl>
                  <Input
                    autoFocus
                    placeholder="Confirm the menu"
                    variant="line"
                    {...field}
                  />
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
                <FormLabel className="font-normal text-muted-foreground">
                  Due date
                </FormLabel>
                <FormControl>
                  <DatePicker
                    onBlur={field.onBlur}
                    onChange={(nextDate) => field.onChange(nextDate ?? "")}
                    placeholder="Pick a date"
                    value={field.value}
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
                <FormLabel className="font-normal text-muted-foreground">
                  Assignee
                </FormLabel>
                <FormControl>
                  <TaskAssigneeField
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value}
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
              <FormItem className="gap-3">
                <FormLabel className="font-normal text-muted-foreground">
                  Priority
                </FormLabel>
                <FormControl>
                  <TaskPriorityChips
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel className="font-normal text-muted-foreground">
                  Category
                </FormLabel>
                <FormControl>
                  <TaskCategoryChips
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal text-muted-foreground">
                  Notes
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add a little context"
                    variant="line"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="sm:justify-start">
            <Button
              className="rounded-none"
              disabled={!form.formState.isValid}
              pending={createTask.isPending || form.formState.isSubmitting}
              type="submit"
            >
              Save task
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
