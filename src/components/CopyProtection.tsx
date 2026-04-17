"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Full content protection for the public site:
 * - Blocks right-click context menu
 * - Blocks keyboard shortcuts (F12, Ctrl+U, Ctrl+Shift+I/J/C, Ctrl+S, Ctrl+P)
 * - Blocks text selection (except in form inputs)
 * - Blocks image dragging
 * - Blocks copy (Ctrl+C) on non-input elements
 *
 * Admin panel is excluded from all protection.
 */
export default function CopyProtection() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't protect admin panel
    if (pathname.includes("/admin")) return;

    document.body.setAttribute("data-protect", "");

    // Block right-click
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Block keyboard shortcuts
    const onKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") { e.preventDefault(); return; }
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) { e.preventDefault(); return; }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && (e.key === "J" || e.key === "j")) { e.preventDefault(); return; }
      // Ctrl+Shift+C (Element picker)
      if (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c")) { e.preventDefault(); return; }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === "u" || e.key === "U")) { e.preventDefault(); return; }
      // Ctrl+S (Save page)
      if (e.ctrlKey && (e.key === "s" || e.key === "S")) { e.preventDefault(); return; }
      // Ctrl+P (Print)
      if (e.ctrlKey && (e.key === "p" || e.key === "P")) { e.preventDefault(); return; }
      // Ctrl+A (Select all) — block on non-inputs
      if (e.ctrlKey && (e.key === "a" || e.key === "A")) {
        const el = document.activeElement;
        if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
          e.preventDefault(); return;
        }
      }
      // Ctrl+C (Copy) — block on non-inputs
      if (e.ctrlKey && (e.key === "c" || e.key === "C") && !e.shiftKey) {
        const el = document.activeElement;
        if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) {
          e.preventDefault(); return;
        }
      }
    };

    // Block image drag
    const onDragStart = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement) e.preventDefault();
    };

    // Block text selection via CSS
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    // Allow selection in inputs/textareas
    const style = document.createElement("style");
    style.id = "bs-protect";
    style.textContent = `
      input, textarea, [contenteditable] {
        -webkit-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("dragstart", onDragStart);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("dragstart", onDragStart);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      document.body.removeAttribute("data-protect");
      const el = document.getElementById("bs-protect");
      if (el) el.remove();
    };
  }, [pathname]);

  return null;
}
