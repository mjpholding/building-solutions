"use client";

import { useEffect } from "react";

/**
 * Light content protection for the public site:
 * - Blocks the context menu on <img> elements (no "Save image as")
 * - Blocks drag start on images
 * - Sets body[data-protect] so CSS can apply user-drag: none globally
 *
 * Does NOT block text selection or the context menu on text — that
 * would make the site feel broken for normal visitors.
 * This is deterrence only; a determined user can always get the DOM.
 */
export default function CopyProtection() {
  useEffect(() => {
    document.body.setAttribute("data-protect", "");

    const onContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === "IMG") e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === "IMG") e.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.body.removeAttribute("data-protect");
    };
  }, []);

  return null;
}
