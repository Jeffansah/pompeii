import { useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "@pompeii/api";
import { clientErrorMessage } from "@pompeii/errors";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function WeddingPicker({
  weddings,
}: {
  weddings: Array<{ name: string; slug: string }>;
}) {
  const navigate = useNavigate();
  const enter = useMutation(api.weddings.enter.handler.enter);
  const staggerRef = useRef<HTMLDivElement>(null);
  const [selectedSlug, setSelectedSlug] = useState(weddings[0]?.slug ?? "");
  const [isEntering, setIsEntering] = useState(false);
  const [enterError, setEnterError] = useState<string | null>(null);

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

  const selectWedding = (slug: string) => {
    setSelectedSlug(slug);
  };

  const openWedding = async () => {
    if (selectedSlug.length === 0 || isEntering) {
      return;
    }
    setEnterError(null);
    setIsEntering(true);
    try {
      const result = await enter({ slug: selectedSlug });
      await navigate({ to: "/$slug", params: { slug: result.slug } });
    } catch (caught) {
      setEnterError(clientErrorMessage(caught, "That wedding didn't open."));
    } finally {
      setIsEntering(false);
    }
  };

  return (
    <div
      ref={staggerRef}
      className="t-stagger flex w-full flex-col gap-8 text-left"
    >
      <div className="flex flex-col gap-2">
        <h1 className="t-stagger-line t-stagger-line--1 font-serif text-4xl sm:text-5xl">
          Your weddings
        </h1>
        <p className="t-stagger-line t-stagger-line--2 text-muted-foreground">
          Pick one to open, or create another.
        </p>
      </div>
      <div className="t-stagger-line t-stagger-line--3 flex flex-col gap-6">
        <Select
          value={selectedSlug}
          disabled={isEntering}
          onValueChange={selectWedding}
        >
          <SelectTrigger
            aria-label="Wedding"
            className="t-input h-12 w-full text-base"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" align="start">
            {weddings.map((wedding) => (
              <SelectItem key={wedding.slug} value={wedding.slug}>
                {wedding.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-col gap-3 mt-6">
          <Button
            type="button"
            className="h-12 w-full"
            pending={isEntering}
            disabled={selectedSlug.length === 0 || isEntering}
            onClick={() => void openWedding()}
          >
            Continue
          </Button>
          <Button asChild variant="link" className="h-12 px-0">
            <Link to="/new">Create a wedding</Link>
          </Button>
          {enterError ? (
            <p className="text-sm text-destructive">{enterError}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
