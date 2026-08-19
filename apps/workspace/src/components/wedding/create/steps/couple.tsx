import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StepLayout } from "@/components/wedding/create/step-layout";
import {
  coupleSchema,
  type CoupleSchema,
} from "@/schemas/wedding/create/couple-schema";

export function CoupleStep({
  defaultCoupleA,
  defaultCoupleB,
  isActive,
  isSaving,
  onBack,
  onContinue,
}: {
  defaultCoupleA: string;
  defaultCoupleB: string;
  isActive: boolean;
  isSaving: boolean;
  onBack: () => void;
  onContinue: (values: CoupleSchema) => Promise<void>;
}) {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const form = useForm<CoupleSchema>({
    resolver: zodResolver(coupleSchema),
    defaultValues: { coupleA: defaultCoupleA, coupleB: defaultCoupleB },
  });

  useEffect(() => {
    if (!isActive) {
      return;
    }
    firstNameRef.current?.focus();
  }, [isActive]);

  const onSubmit = async (values: CoupleSchema) => {
    await onContinue(values);
  };

  return (
    <StepLayout step={2} title="Who's getting married?" isActive={isActive}>
      <Form
        {...form}
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="coupleA"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3">
              <FormLabel>You</FormLabel>
              <FormControl>
                <Input
                  aria-label="Your name"
                  placeholder="Amara"
                  className="h-12"
                  {...field}
                  ref={(element) => {
                    field.ref(element);
                    firstNameRef.current = element;
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coupleB"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3">
              <FormLabel>Your partner</FormLabel>
              <FormControl>
                <Input
                  aria-label="Your partner's name"
                  placeholder="Tomi"
                  className="h-12"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="h-12" pending={isSaving}>
          Continue
        </Button>
        <Button
          type="button"
          variant="link"
          className="h-12 px-0"
          onClick={onBack}
        >
          Back
        </Button>
      </Form>
    </StepLayout>
  );
}
