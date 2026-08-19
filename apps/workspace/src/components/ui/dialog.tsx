import * as React from "react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/shared/utils";

type DialogMotion = {
  isEntered: boolean;
  isClosing: boolean;
};

const DialogMotionContext = React.createContext<DialogMotion>({
  isEntered: false,
  isClosing: false,
});

function readModalCloseMs() {
  const value = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--modal-close-dur",
    ),
  );
  return Number.isFinite(value) ? value : 150;
}

function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const isControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false,
  );
  const isOpen = Boolean(isControlled ? open : uncontrolledOpen);
  const [isMounted, setIsMounted] = React.useState(isOpen);
  const [isClosing, setIsClosing] = React.useState(false);
  const [isEntered, setIsEntered] = React.useState(false);
  const closeTimerRef = React.useRef<number>(undefined);

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
  };

  React.useLayoutEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current !== undefined) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = undefined;
      }
      setIsMounted(true);
      setIsClosing(false);
      return;
    }

    if (!isMounted) {
      return;
    }

    setIsEntered(false);
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsMounted(false);
      setIsClosing(false);
      closeTimerRef.current = undefined;
    }, readModalCloseMs());

    return () => {
      if (closeTimerRef.current !== undefined) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [isOpen, isMounted]);

  React.useLayoutEffect(() => {
    if (!isOpen || isClosing) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      setIsEntered(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen, isClosing]);

  return (
    <DialogMotionContext.Provider value={{ isEntered, isClosing }}>
      <DialogPrimitive.Root
        data-slot="dialog"
        open={isOpen || isMounted}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </DialogMotionContext.Provider>
  );
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  const { isEntered, isClosing } = React.useContext(DialogMotionContext);

  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "t-modal-overlay fixed inset-0 z-50 bg-black/50",
        isEntered && "is-open",
        isClosing && "is-closing",
        className,
      )}
      {...props}
    />
  );
}

function isInsideSelect(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest("[data-slot='select-content']"))
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  onPointerDownOutside,
  onFocusOutside,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  const { isEntered, isClosing } = React.useContext(DialogMotionContext);

  const handlePointerDownOutside: React.ComponentProps<
    typeof DialogPrimitive.Content
  >["onPointerDownOutside"] = (event) => {
    if (isInsideSelect(event.target)) {
      event.preventDefault();
    }
    onPointerDownOutside?.(event);
  };

  const handleFocusOutside: React.ComponentProps<
    typeof DialogPrimitive.Content
  >["onFocusOutside"] = (event) => {
    if (isInsideSelect(event.target)) {
      event.preventDefault();
    }
    onFocusOutside?.(event);
  };

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className="fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] outline-none sm:max-w-lg"
        {...props}
        onPointerDownOutside={handlePointerDownOutside}
        onFocusOutside={handleFocusOutside}
      >
        <div
          className={cn(
            "t-modal relative grid w-full gap-4 rounded-lg border bg-background p-6 shadow-lg",
            isEntered && "is-open",
            isClosing && "is-closing",
            className,
          )}
        >
          {children}
          {showCloseButton ? (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          ) : null}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      ) : null}
    </div>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
