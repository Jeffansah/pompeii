import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isValid, parse, startOfToday } from "date-fns";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { StepLayout } from "@/components/wedding/create/step-layout";
import { StepNav } from "@/components/wedding/create/step-nav";
import { cn } from "@/lib/shared/utils";
import {
  dateSchema,
  type DateSchema,
} from "@/schemas/wedding/create/date-schema";

const CALENDAR_START_MONTH = startOfToday();
const CALENDAR_END_MONTH = new Date(new Date().getFullYear() + 10, 11);

function dateFromValue(value: string) {
  if (value.length === 0) {
    return undefined;
  }
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  if (!isValid(parsed)) {
    return undefined;
  }
  return parsed;
}

function CalendarResizeFrame({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner) {
      return;
    }

    let isFirstMeasure = true;

    const applyHeight = () => {
      const nextHeight = `${inner.offsetHeight}px`;
      if (isFirstMeasure) {
        frame.style.transition = "none";
        frame.style.height = nextHeight;
        void frame.offsetHeight;
        frame.style.transition = "";
        isFirstMeasure = false;
        return;
      }
      frame.style.height = nextHeight;
    };

    applyHeight();
    const observer = new ResizeObserver(applyHeight);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className="t-resize overflow-hidden">
      <div ref={innerRef}>{children}</div>
    </div>
  );
}

function DatePickerField({
  value,
  isActive,
  onBlur,
  onChange,
}: {
  value: string;
  isActive: boolean;
  onBlur: () => void;
  onChange: (value: string) => void;
}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const selected = dateFromValue(value);
  const label = selected ? format(selected, "d MMMM yyyy") : "Pick a date";

  useEffect(() => {
    if (!isActive) {
      return;
    }
    dateButtonRef.current?.focus();
  }, [isActive]);

  const onCalendarOpenChange = (nextOpen: boolean) => {
    setIsCalendarOpen(nextOpen);
  };

  const openCalendar = () => {
    setIsCalendarOpen(true);
  };

  const selectDate = (date?: Date) => {
    if (!date || date < startOfToday()) {
      return;
    }
    onChange(format(date, "yyyy-MM-dd"));
    setIsCalendarOpen(false);
  };

  return (
    <>
      <FormControl>
        <Button
          ref={dateButtonRef}
          type="button"
          variant="outline"
          aria-label="Wedding date"
          className={cn(
            "t-input h-12 w-full justify-start px-3 font-normal",
            !selected && "text-muted-foreground",
          )}
          onClick={openCalendar}
          onBlur={onBlur}
        >
          <HugeiconsIcon
            icon={Calendar03Icon}
            className="size-4 mr-2"
            strokeWidth={1.5}
          />
          {label}
        </Button>
      </FormControl>
      <Dialog open={isCalendarOpen} onOpenChange={onCalendarOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pick a date</DialogTitle>
          </DialogHeader>
          <CalendarResizeFrame>
            <Calendar
              mode="single"
              required
              selected={selected}
              defaultMonth={
                selected && selected >= startOfToday()
                  ? selected
                  : startOfToday()
              }
              onSelect={selectDate}
              captionLayout="dropdown"
              disabled={{ before: startOfToday() }}
              startMonth={CALENDAR_START_MONTH}
              endMonth={CALENDAR_END_MONTH}
              className="w-full p-0 [--cell-size:--spacing(12)]"
              classNames={{ root: "w-full" }}
            />
          </CalendarResizeFrame>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DateStep({
  defaultDate,
  isActive,
  isSaving,
  onBack,
  onContinue,
  onSkip,
}: {
  defaultDate: string;
  isActive: boolean;
  isSaving: boolean;
  onBack: () => void;
  onContinue: (values: DateSchema) => Promise<void>;
  onSkip: () => Promise<void>;
}) {
  const form = useForm<DateSchema>({
    resolver: zodResolver(dateSchema),
    defaultValues: { date: defaultDate },
  });

  const onSubmit = async (values: DateSchema) => {
    await onContinue(values);
  };

  const skip = () => {
    void onSkip();
  };

  return (
    <StepLayout
      step={3}
      title="When's the wedding?"
      subtitle="No rush, we can add or change this later."
      isActive={isActive}
    >
      <Form
        {...form}
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3">
              <DatePickerField
                value={field.value}
                isActive={isActive}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <StepNav isSaving={isSaving} onBack={onBack} onSkip={skip} />
      </Form>
    </StepLayout>
  );
}
