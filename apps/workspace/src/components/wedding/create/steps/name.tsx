import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StepLayout } from "@/components/wedding/create/step-layout";
import { slugify } from "@/lib/wedding/create/slugify";
import {
  nameSchema,
  type NameSchema,
} from "@/schemas/wedding/create/name-schema";

export function NameStep({
  defaultName,
  isActive,
  isSaving,
  onContinue,
}: {
  defaultName: string;
  isActive: boolean;
  isSaving: boolean;
  onContinue: (values: NameSchema) => Promise<void>;
}) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<NameSchema>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: defaultName },
  });
  const name = useWatch({ control: form.control, name: "name" });
  const slug = name.trim().length > 0 ? slugify(name) : "";

  useEffect(() => {
    if (!isActive) {
      return;
    }
    nameInputRef.current?.focus();
  }, [isActive]);

  const onSubmit = async (values: NameSchema) => {
    await onContinue(values);
  };

  return (
    <StepLayout
      step={1}
      title="What are we calling this celebration?"
      subtitle="This also becomes the link to your wedding workspace."
      isActive={isActive}
    >
      <Form
        {...form}
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3">
              <FormControl>
                <Input
                  autoFocus={isActive}
                  aria-label="Wedding name"
                  placeholder={`eg. Amara & Tomi ${new Date().getFullYear()}!`}
                  className="h-12"
                  {...field}
                  ref={(element) => {
                    field.ref(element);
                    nameInputRef.current = element;
                  }}
                />
              </FormControl>
              {slug ? (
                <p className="text-sm text-muted-foreground">
                  wedding.pompeii.com/{slug}
                </p>
              ) : null}
              <Button type="submit" className="h-12" pending={isSaving}>
                Continue
              </Button>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </StepLayout>
  );
}
