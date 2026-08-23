import * as React from "react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

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

  const setOpen: NonNullable<
    React.ComponentProps<typeof DialogPrimitive.Root>["onOpenChange"]
  > = (nextOpen, eventDetails) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen, eventDetails);
  };

  const handleOpenChange: NonNullable<
    React.ComponentProps<typeof DialogPrimitive.Root>["onOpenChange"]
  > = (nextOpen, eventDetails) => {
    setOpen(nextOpen, eventDetails);
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
  asChild = false,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close> & {
  asChild?: boolean;
}) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      render={asChild && React.isValidElement(children) ? children : undefined}
      {...props}
    >
      {asChild ? null : children}
    </DialogPrimitive.Close>
  );
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
  const { isEntered, isClosing } = React.useContext(DialogMotionContext);

  return (
    <DialogPrimitive.Backdrop
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

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Popup> & {
  showCloseButton?: boolean;
}) {
  const { isEntered, isClosing } = React.useContext(DialogMotionContext);

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center">
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className="w-full max-w-[calc(100%-2rem)] outline-none sm:max-w-xl"
          {...props}
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
                className="absolute top-4 right-4 rounded-none opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.5} />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            ) : null}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
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
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
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
