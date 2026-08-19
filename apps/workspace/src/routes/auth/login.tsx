import { useLayoutEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getPendingMagicLinkEmail } from "@/lib/auth/get-pending-magic-link";
import { requestMagicLink } from "@/lib/auth/request-magic-link";
import { loginSchema, type LoginSchema } from "@/schemas/auth/login-schema";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const staggerRef = useRef<HTMLDivElement>(null);
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  useLayoutEffect(() => {
    const block = staggerRef.current;
    if (!block) {
      return;
    }
    block.classList.remove("is-hiding");
    block.classList.remove("is-shown");
    void block.offsetHeight;
    block.classList.add("is-shown");
  }, []);

  const onSubmit = async ({ email }: LoginSchema) => {
    await requestMagicLink(email);
    const pending = await getPendingMagicLinkEmail();
    if (!pending) {
      return;
    }
    await navigate({ to: "/auth/resend-link" });
  };

  return (
    <div
      ref={staggerRef}
      className="t-stagger flex w-full flex-col gap-8 text-left"
    >
      <div className="flex flex-col gap-2">
        <h1 className="t-stagger-line t-stagger-line--1 text-4xl sm:text-5xl">
          Enter your email
        </h1>
        <p className="t-stagger-line t-stagger-line--2 text-muted-foreground">
          We'll send over a magic link to you.
        </p>
      </div>
      <div className="t-stagger-line t-stagger-line--3">
        <Form
          {...form}
          className="flex flex-col gap-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-3">
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    autoFocus
                    aria-label="Email"
                    placeholder="Email"
                    className="h-12"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="submit"
                  className="h-12"
                  pending={form.formState.isSubmitting}
                >
                  Continue
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </div>
    </div>
  );
}
