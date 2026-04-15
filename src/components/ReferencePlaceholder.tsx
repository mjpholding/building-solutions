"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const Scene3D = dynamic(() => import("./ReferenceScene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-b from-bs-hellgrau via-white to-bs-grau animate-pulse" />
  ),
});

export default function ReferencePlaceholder({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const t = useTranslations("references");

  const labelCls =
    size === "lg"
      ? "text-base px-5 py-2"
      : size === "sm"
        ? "text-[11px] px-3 py-1.5"
        : "text-sm px-4 py-1.5";

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Scene3D />

      {/* gentle vignette so the chip stays readable */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-bs-mitternacht/35 to-transparent pointer-events-none" />

      {/* caption chip */}
      <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
        <span
          className={`${labelCls} bg-white/90 backdrop-blur-sm text-bs-mitternacht font-medium tracking-wide rounded-full shadow-md border border-white/70`}
        >
          {t("imageComingSoon")}
        </span>
      </div>
    </div>
  );
}
