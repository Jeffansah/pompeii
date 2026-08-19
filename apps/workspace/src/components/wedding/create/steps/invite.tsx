import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { StepLayout } from "@/components/wedding/create/step-layout";
import { StepNav } from "@/components/wedding/create/step-nav";
import {
  inviteSchema,
  type InviteSchema,
} from "@/schemas/wedding/create/invite-schema";

export function InviteStep({
  defaultInviteEmail,
  isActive,
  isSaving,
  onBack,
  onContinue,
  onSkip,
}: {
  defaultInviteEmail: string;
  isActive: boolean;
  isSaving: boolean;
  onBack: () => void;
  onContinue: (values: InviteSchema) => Promise<void>;
  onSkip: () => Promise<void>;
}) {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<InviteSchema>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { inviteEmail: defaultInviteEmail },
  });

  useEffect(() => {
    if (!isActive) {
      return;
    }
    emailInputRef.current?.focus();
  }, [isActive]);

  const onSubmit = async (values: InviteSchema) => {
    await onContinue(values);
  };

  const skip = () => {
    void onSkip();
  };

  const canContinue = form.watch("inviteEmail").trim().length > 0;

  return (
    <StepLayout
      step={5}
      title="Invite your partner"
      subtitle="Add your partner to the workspace to get started on planning together!"
      isActive={isActive}
    >
      <Form
        {...form}
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="inviteEmail"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3">
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  aria-label="Invite email"
                  placeholder="Email"
                  className="h-12"
                  {...field}
                  ref={(element) => {
                    field.ref(element);
                    emailInputRef.current = element;
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <StepNav
          isSaving={isSaving}
          canContinue={canContinue}
          onBack={onBack}
          onSkip={skip}
        />
      </Form>
    </StepLayout>
  );
}
