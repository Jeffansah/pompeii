import { type ReactNode } from "react";

import { SkeletonReveal } from "@/components/ui/skeleton-reveal";
import { OverviewPosterImage } from "./overview-poster-image";
import fallbackImage from "@/assets/overview/poster-fallback-scenery.jpg";

export type OverviewPosterCardData = {
  stableKey: string;
  imageUrl: string;
  imageAlt: string;
  imageCreator: string;
  imageLicense: string;
  caption: string;
  locationCity?: string;
  locationCountry?: string;
  quote: string;
  author: string;
  sourceTitle: string;
  sourceUrl: string;
};

const fallbackCard: OverviewPosterCardData = {
  stableKey: "local-fallback",
  imageUrl: fallbackImage,
  imageAlt: "A white wedding arch in a sunlit meadow",
  imageCreator: "Pompeii",
  imageLicense: "Pompeii generated image",
  caption: "A quiet beginning",
  quote: "Love is not love which alters when it alteration finds.",
  author: "William Shakespeare",
  sourceTitle: "Sonnet 116",
  sourceUrl: "https://www.gutenberg.org/files/1041/1041-h/1041-h.htm",
};

export function OverviewPosterCard({
  card,
  error = false,
}: {
  card: OverviewPosterCardData | null | undefined;
  error?: boolean;
}) {
  const resolved =
    card === undefined && error
      ? fallbackCard
      : card === null
        ? fallbackCard
        : card;
  const ready = resolved !== undefined;
  const hasQuote = resolved !== undefined && resolved.quote.trim().length > 0;

  return (
    <SkeletonReveal ready={ready} skeleton={<OverviewPosterCardSkeleton />}>
      {resolved === undefined ? null : (
        <article className="grid h-136 max-h-144 w-full grid-rows-[1fr_1fr] overflow-hidden bg-primary text-primary-foreground md:h-112 md:grid-rows-none md:grid-cols-[2fr_1fr] lg:h-128">
          <OverviewPosterImage
            key={resolved.stableKey}
            imageUrl={resolved.imageUrl}
            imageAlt={resolved.imageAlt}
            locationCity={resolved.locationCity}
            locationCountry={resolved.locationCountry}
            caption={resolved.caption}
          />
          <QuotePanel>
            {hasQuote ? (
              <>
                <blockquote className="min-h-[5em] font-serif text-2xl leading-tight sm:text-3xl md:text-4xl">
                  {resolved.quote}
                </blockquote>
                <footer className="flex min-h-11 flex-col gap-1 text-sm text-primary-foreground/75">
                  <cite className="not-italic">{resolved.author}</cite>
                  {resolved.sourceUrl.length > 0 &&
                  resolved.sourceTitle.length > 0 ? (
                    <a
                      href={resolved.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      {resolved.sourceTitle}
                    </a>
                  ) : null}
                </footer>
              </>
            ) : (
              <p className="min-h-[5em] font-serif text-2xl leading-tight text-primary-foreground/80 sm:text-3xl md:text-4xl">
                A thought is on its way.
              </p>
            )}
          </QuotePanel>
        </article>
      )}
    </SkeletonReveal>
  );
}

function QuotePanel({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-0 flex-col justify-start overflow-hidden p-6 sm:p-8 md:p-10">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-2 select-none font-serif text-[16rem] leading-none text-primary-foreground/15"
      >
        “
      </span>
      <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-primary-foreground/70">
          A thought for today
        </p>
        {children}
      </div>
    </div>
  );
}

export function OverviewPosterCardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading today's thought"
      className="grid h-136 max-h-144 w-full grid-rows-[1fr_1fr] overflow-hidden bg-primary md:h-112 md:grid-rows-none md:grid-cols-[2fr_1fr] lg:h-128"
    >
      <div className="animate-pulse bg-accent/70" />
      <QuotePanel>
        <blockquote className="min-h-[5em] font-serif text-2xl leading-tight sm:text-3xl md:text-4xl">
          <span className="mt-[0.15em] block h-[0.72em] w-full animate-pulse rounded-sm bg-primary-foreground/20" />
          <span className="mt-[0.53em] block h-[0.72em] w-5/6 animate-pulse rounded-sm bg-primary-foreground/20" />
          <span className="mt-[0.53em] block h-[0.72em] w-2/3 animate-pulse rounded-sm bg-primary-foreground/20" />
        </blockquote>
        <footer className="flex min-h-11 flex-col gap-1 text-sm">
          <span className="mt-[0.2em] block h-[0.8em] w-32 animate-pulse rounded-sm bg-primary-foreground/20" />
          <span className="mt-[0.4em] block h-[0.8em] w-24 animate-pulse rounded-sm bg-primary-foreground/15" />
        </footer>
      </QuotePanel>
    </div>
  );
}
