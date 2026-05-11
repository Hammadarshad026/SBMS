"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";
import { cn } from "./button";

function Modal({ open, onClose, title, description, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const panelSizes = {
    sm: "max-w-lg",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center px-4 py-6 sm:px-6">
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={cn(
          "relative z-10 w-full rounded-[2rem] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-8",
          panelSizes[size] ?? panelSizes.md,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-2">
            {title ? (
              <h2 id="modal-title" className="text-xl font-semibold tracking-tight text-white">
                {title}
              </h2>
            ) : null}
            {description ? <p className="text-sm leading-6 text-slate-300">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
            Close
          </Button>
        </div>

        <div className="mt-6">{children}</div>

        {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export { Modal };