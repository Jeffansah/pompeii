import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { StepLayout } from "@/components/wedding/create/step-layout";
import { StepNav } from "@/components/wedding/create/step-nav";
import { PlaceSearchField } from "@/components/wedding/create/steps/place-search";
import {
  whereSchema,
  type WhereSchema,
} from "@/schemas/wedding/create/where-schema";

export function WhereStep({
  defaultCity,
  defaultCountry,
  defaultLat,
  defaultLng,
  defaultPlaceId,
  isActive,
  isSaving,
  onBack,
  onContinue,
  onSkip,
}: {
  defaultCity: string;
  defaultCountry: string;
  defaultLat?: number;
  defaultLng?: number;
  defaultPlaceId: string;
  isActive: boolean;
  isSaving: boolean;
  onBack: () => void;
  onContinue: (values: WhereSchema) => Promise<void>;
  onSkip: () => Promise<void>;
}) {
  const searchInputRef = useRef<HTMLDivElement>(null);
  const form = useForm<WhereSchema>({
    resolver: zodResolver(whereSchema),
    defaultValues: {
      city: defaultCity,
      country: defaultCountry,
      lat: defaultLat ?? 0,
      lng: defaultLng ?? 0,
      placeId: defaultPlaceId,
    },
  });
  const placeId = useWatch({ control: form.control, name: "placeId" });
  const city = useWatch({ control: form.control, name: "city" });
  const country = useWatch({ control: form.control, name: "country" });
  const hasSelection = placeId.length > 0;
  const selectedLabel =
    city.length > 0 && country.length > 0 ? `${city}, ${country}` : "";

  useEffect(() => {
    if (!isActive) {
      return;
    }
    const input = searchInputRef.current?.querySelector("input");
    input?.focus();
  }, [isActive]);

  const onSubmit = async (values: WhereSchema) => {
    await onContinue(values);
  };

  const skip = () => {
    void onSkip();
  };

  const clearPlace = () => {
    form.setValue("city", "");
    form.setValue("country", "");
    form.setValue("lat", 0);
    form.setValue("lng", 0);
    form.setValue("placeId", "");
  };

  const selectPlace = (place: WhereSchema) => {
    form.setValue("city", place.city);
    form.setValue("country", place.country);
    form.setValue("lat", place.lat);
    form.setValue("lng", place.lng);
    form.setValue("placeId", place.placeId);
    form.clearErrors();
  };

  return (
    <StepLayout
      step={4}
      title="Where's it happening?"
      subtitle="What city do you plan on having it in?"
      isActive={isActive}
    >
      <Form
        {...form}
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="placeId"
          render={() => (
            <FormItem className="flex flex-col gap-3">
              <FormControl>
                <div ref={searchInputRef}>
                  <PlaceSearchField
                    selectedLabel={selectedLabel}
                    hasSelection={hasSelection}
                    onClear={clearPlace}
                    onSelect={selectPlace}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <StepNav
          isSaving={isSaving}
          canContinue={hasSelection}
          onBack={onBack}
          onSkip={skip}
        />
      </Form>
    </StepLayout>
  );
}
