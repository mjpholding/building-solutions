"use client";

import { useTranslations } from "next-intl";

export default function ReferencePlaceholder({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const t = useTranslations("references");

  const svgSize = size === "lg" ? 120 : size === "sm" ? 48 : 80;
  const textCls =
    size === "lg"
      ? "text-base"
      : size === "sm"
        ? "text-[11px]"
        : "text-sm";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-bs-hellgrau via-white to-bs-grau text-bs-mitternacht/60">
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 96 96"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-55"
        aria-hidden="true"
      >
        {/* rough ground line */}
        <path d="M6 82 Q12 80 18 82 T30 82 T44 82 T58 82 T72 82 T90 82" />
        {/* main building outline (slightly wobbly to feel sketched) */}
        <path d="M20 82 L20 36 Q20 34 22 34 L52 34 Q54 34 54 36 L54 82" />
        {/* pitched roof */}
        <path d="M16 36 L37 18 L58 36" />
        {/* side wing */}
        <path d="M54 82 L54 48 L76 48 L76 82" />
        {/* wing roof */}
        <path d="M52 48 L65 40 L78 48" />
        {/* windows — grid */}
        <rect x="24" y="42" width="8" height="10" rx="0.5" />
        <rect x="36" y="42" width="8" height="10" rx="0.5" />
        <rect x="24" y="58" width="8" height="10" rx="0.5" />
        <rect x="36" y="58" width="8" height="10" rx="0.5" />
        <rect x="58" y="54" width="7" height="8" rx="0.5" />
        <rect x="67" y="54" width="7" height="8" rx="0.5" />
        <rect x="58" y="66" width="7" height="8" rx="0.5" />
        <rect x="67" y="66" width="7" height="8" rx="0.5" />
        {/* door */}
        <path d="M30 82 L30 74 Q30 72 32 72 L38 72 Q40 72 40 74 L40 82" />
        {/* subtle pencil texture */}
        <path d="M22 38 L52 38" opacity="0.3" />
        <path d="M20 42 L22 40" opacity="0.3" />
        <path d="M56 50 L76 50" opacity="0.3" />
      </svg>
      <span className={`${textCls} font-medium italic tracking-wide text-bs-mitternacht/60`}>
        {t("imageComingSoon")}
      </span>
    </div>
  );
}
