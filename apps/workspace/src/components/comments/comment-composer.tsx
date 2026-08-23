import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useRef } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  commentBodySchema,
  type CommentBodyValues,
} from "@/schemas/comments/comment-schema";

export function CommentComposer({
  label,
  pending,
  error,
  initialBody,
  autoFocus = false,
  onCancel,
  onDraftChange,
  onSubmit,
  refocusAfterSubmit = false,
  submitLabel,
}: {
  label: string;
  pending: boolean;
  error?: string | null;
  initialBody?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  onDraftChange?: (body: string) => void;
  onSubmit: (body: string) => Promise<void>;
  refocusAfterSubmit?: boolean;
  submitLabel?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const form = useForm<CommentBodyValues>({
    resolver: zodResolver(commentBodySchema),
    defaultValues: { body: initialBody ?? "" },
  });

  const submit = async ({ body }: CommentBodyValues) => {
    try {
      await onSubmit(body);
      form.reset({ body: "" });
      onDraftChange?.("");
      if (refocusAfterSubmit) textareaRef.current?.focus();
    } catch {
      textareaRef.current?.focus();
    }
  };

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  return (
    <Form {...form} onSubmit={form.handleSubmit(submit)}>
      <FormField
        control={form.control}
        name="body"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                {...field}
                aria-keyshortcuts="Meta+Enter Control+Enter"
                aria-label={label}
                disabled={pending}
                onChange={(event) => {
                  field.onChange(event);
                  onDraftChange?.(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && onCancel) {
                    event.preventDefault();
                    onCancel();
                    return;
                  }
                  if (
                    event.key === "Enter" &&
                    (event.metaKey || event.ctrlKey)
                  ) {
                    event.preventDefault();
                    void form.handleSubmit(submit)();
                  }
                }}
                placeholder={label}
                ref={(element) => {
                  field.ref(element);
                  textareaRef.current = element;
                }}
                variant="default"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex justify-end gap-2">
        {onCancel ? (
          <Button
            disabled={pending}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        ) : null}
        <Button pending={pending} type="submit" variant="secondary">
          {submitLabel ??
            (label.startsWith("Reply") ? "Post reply" : "Post comment")}
        </Button>
      </div>
    </Form>
  );
}
