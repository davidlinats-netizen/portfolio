import type { KeyboardEvent } from "react";

// Explicit boundaries supplement native dialog focus behavior around cross-origin iframes.
export function containDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== "Tab") return;
  const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], textarea:not([disabled]), iframe, [tabindex="0"]')).filter(element => element.getClientRects().length > 0);
  const first = controls[0], last = controls.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
