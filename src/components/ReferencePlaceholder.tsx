"use client";

import { useTranslations } from "next-intl";

export default function ReferencePlaceholder({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const t = useTranslations("references");

  const labelCls =
    size === "lg"
      ? "text-base px-5 py-2"
      : size === "sm"
        ? "text-[11px] px-3 py-1.5"
        : "text-sm px-4 py-1.5";

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-bs-hellgrau via-white to-bs-grau">
      <svg
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full text-bs-mitternacht/45"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* horizon / pavement */}
        <path d="M0 215 Q60 213 120 215 T240 215 T360 215 T400 215" />
        <path d="M0 222 L400 222" opacity="0.35" strokeDasharray="2 4" />

        {/* === LEFT TOWER — mid-rise office === */}
        <path d="M30 215 L30 75 L110 75 L110 215" />
        <path d="M30 75 L110 75 L110 70 L30 70 Z" />
        {/* window grid 6 rows × 4 cols */}
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <g key={`l-${row}`}>
            {[0, 1, 2, 3].map((col) => (
              <rect
                key={col}
                x={38 + col * 17}
                y={88 + row * 19}
                width="11"
                height="13"
                strokeWidth="0.7"
              />
            ))}
          </g>
        ))}
        {/* entrance canopy */}
        <path d="M55 215 L55 200 L85 200 L85 215" />
        <path d="M50 200 L90 200" />
        <path d="M62 215 L62 205 L78 205 L78 215" strokeWidth="0.7" />

        {/* === CENTER HIGH-RISE — taller, glass curtain === */}
        <path d="M140 215 L140 30 L240 30 L240 215" />
        <path d="M140 30 L240 30 L240 24 L140 24 Z" />
        {/* mast / antenna */}
        <path d="M188 24 L188 8 M192 24 L192 14" strokeWidth="0.7" />
        {/* vertical mullions every column */}
        {[0, 1, 2, 3, 4, 5, 6].map((col) => (
          <path
            key={`v-${col}`}
            d={`M${148 + col * 13} 36 L${148 + col * 13} 210`}
            strokeWidth="0.4"
            opacity="0.7"
          />
        ))}
        {/* horizontal floor lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((row) => (
          <path
            key={`h-${row}`}
            d={`M148 ${42 + row * 13} L240 ${42 + row * 13}`}
            strokeWidth="0.4"
            opacity="0.55"
          />
        ))}
        {/* podium / lobby */}
        <path d="M140 215 L140 195 L240 195 L240 215" />
        <path d="M170 215 L170 200 L210 200 L210 215" />
        <path d="M178 215 L178 205 L186 205 L186 215" strokeWidth="0.7" />
        <path d="M194 215 L194 205 L202 205 L202 215" strokeWidth="0.7" />
        {/* sign band */}
        <path d="M150 198 L230 198" strokeWidth="0.6" opacity="0.5" />

        {/* === RIGHT BUILDING — wide low-rise commercial === */}
        <path d="M270 215 L270 110 L380 110 L380 215" />
        <path d="M270 110 L380 110 L380 104 L270 104 Z" />
        {/* horizontal bands of strip windows */}
        {[0, 1, 2, 3, 4].map((row) => (
          <g key={`r-${row}`}>
            <path
              d={`M278 ${122 + row * 19} L372 ${122 + row * 19}`}
              strokeWidth="0.5"
            />
            <path
              d={`M278 ${132 + row * 19} L372 ${132 + row * 19}`}
              strokeWidth="0.5"
            />
            {/* mullions inside strip */}
            {[0, 1, 2, 3, 4, 5].map((col) => (
              <path
                key={col}
                d={`M${290 + col * 16} ${122 + row * 19} L${290 + col * 16} ${132 + row * 19}`}
                strokeWidth="0.4"
                opacity="0.6"
              />
            ))}
          </g>
        ))}
        {/* glass entrance with revolving door */}
        <path d="M310 215 L310 198 L340 198 L340 215" />
        <path d="M325 215 L325 200" strokeWidth="0.6" />
        <circle cx="325" cy="207" r="3" strokeWidth="0.5" opacity="0.7" />
        {/* awning */}
        <path d="M305 198 L345 198" />

        {/* foreground details — tree silhouettes */}
        <g opacity="0.45">
          <circle cx="125" cy="208" r="9" strokeWidth="0.6" />
          <path d="M125 217 L125 215" strokeWidth="0.6" />
          <circle cx="255" cy="206" r="11" strokeWidth="0.6" />
          <path d="M255 217 L255 213" strokeWidth="0.6" />
        </g>

        {/* sketchy double-strokes for hand-drawn feel */}
        <path d="M30 75 L110 75" opacity="0.35" strokeWidth="0.5" transform="translate(0.4 0.6)" />
        <path d="M140 30 L240 30" opacity="0.35" strokeWidth="0.5" transform="translate(0.4 0.6)" />
        <path d="M270 110 L380 110" opacity="0.35" strokeWidth="0.5" transform="translate(0.4 0.6)" />
      </svg>

      {/* caption */}
      <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
        <span
          className={`${labelCls} bg-white/85 backdrop-blur-sm text-bs-mitternacht/75 font-medium italic tracking-wide rounded-full shadow-sm border border-white/60`}
        >
          {t("imageComingSoon")}
        </span>
      </div>
    </div>
  );
}
