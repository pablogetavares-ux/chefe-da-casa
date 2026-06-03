"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
};

export function Dialog({
  open,
  onOpenChange,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border bg-background p-0 shadow-xl backdrop:bg-black/50 open:animate-in open:fade-in-0",
        className,
      )}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === ref.current) {
          onOpenChange(false);
        }
      }}
    >
      {children}
    </dialog>
  );
}

export function DialogContent({
  children,
  className,
  onClose,
}: {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}) {
  return (
    <div className={cn("relative p-6", className)}>
      {onClose && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-4 right-4"
          aria-label="Fechar"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-2 pr-8", className)}>{children}</div>;
}

export function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("font-heading text-lg font-semibold", className)}>
      {children}
    </h2>
  );
}

export function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
}

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}
