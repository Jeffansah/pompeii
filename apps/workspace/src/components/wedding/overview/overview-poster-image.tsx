import { useCallback, useState } from "react";

import fallbackImage from "@/assets/overview/poster-fallback-scenery.jpg";

export function OverviewPosterImage({
  imageUrl,
  imageAlt,
  locationCity,
  locationCountry,
  caption,
}: {
  imageUrl: string;
  imageAlt: string;
  locationCity?: string;
  locationCountry?: string;
  caption: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, []);

  const displayedImageUrl = imageFailed ? fallbackImage : imageUrl;
  const displayedImageAlt = imageFailed
    ? "A white wedding arch in a sunlit meadow"
    : imageAlt;

  return (
    <div className="relative min-h-0 overflow-hidden bg-accent">
      {!imageLoaded ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_30%_20%,color-mix(in_oklab,var(--accent-foreground)_18%,transparent),transparent_42%),var(--accent)]"
        />
      ) : null}
      <img
        ref={imageRef}
        src={displayedImageUrl}
        alt={displayedImageAlt}
        loading="lazy"
        decoding="async"
        sizes="(min-width: 768px) 66vw, 100vw"
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onError={
          imageFailed
            ? undefined
            : () => {
                setImageFailed(true);
                setImageLoaded(false);
              }
        }
        onLoad={() => setImageLoaded(true)}
      />
      {!imageFailed && imageLoaded ? (
        <div className="absolute right-4 bottom-3 left-4 text-[10px] text-white drop-shadow-sm">
          <p className="font-medium tracking-[0.12em] uppercase text-white/85">
            {locationCity && locationCountry
              ? `${locationCity}, ${locationCountry}`
              : caption}
          </p>
        </div>
      ) : null}
    </div>
  );
}
