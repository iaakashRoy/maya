"use client";

import { useEffect, useRef, type RefObject } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type BackgroundState = {
  element: HTMLElement;
  inert: boolean;
  ariaHidden: string | null;
};

/** Gives concept dialogs production-style keyboard and focus behavior. */
export function useDialogLifecycle<T extends HTMLElement>(open: boolean, onClose: () => void): RefObject<T | null> {
  const dialogRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const modalRoot = dialog.closest<HTMLElement>("[data-modal-root]") ?? dialog;
    const background: BackgroundState[] = Array.from(modalRoot.parentElement?.children ?? [])
      .filter((node): node is HTMLElement => node instanceof HTMLElement && node !== modalRoot)
      .map((element) => ({ element, inert: element.inert, ariaHidden: element.getAttribute("aria-hidden") }));

    background.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
      .filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
    const frame = window.requestAnimationFrame(() => (focusable()[0] ?? dialog).focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const available = focusable();
      if (!available.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = available[0];
      const last = available[available.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown, true);
      background.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  return dialogRef;
}
