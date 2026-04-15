"use client";

import { useTranslations } from "next-intl";

/**
 * One-point perspective architectural pencil sketch.
 * A long curtain-wall facade recedes toward a vanishing point
 * in the upper-right of the frame — same vibe as the BILD FOLGT
 * reference inspiration.
 */
const VP = { x: 640, y: 18 };

// front (closest) corner of the building
const FRONT_X = 60;
const FRONT_TOP_Y = 28;
const FRONT_BOT_Y = 232;

// how far down the perspective the back edge sits (0..1, closer to 1 = deeper)
const DEPTH = 0.86;

const BACK_X = FRONT_X + DEPTH * (VP.x - FRONT_X);
const BACK_TOP_Y = FRONT_TOP_Y + DEPTH * (VP.y - FRONT_TOP_Y);
const BACK_BOT_Y = FRONT_BOT_Y + DEPTH * (VP.y - FRONT_BOT_Y);

const FLOORS = 22;
const COLS = 14;

export default function ReferencePlaceholder({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const t = useTranslations("references");

  const labelCls =
    size === "lg"
      ? "text-base px-6 py-2.5 tracking-[0.25em]"
      : size === "sm"
        ? "text-[10px] px-4 py-1.5 tracking-[0.2em]"
        : "text-xs px-5 py-2 tracking-[0.22em]";

  // floor lines (horizontal, recede to VP)
  const floorLines = [];
  for (let f = 0; f <= FLOORS; f++) {
    const yFront = FRONT_TOP_Y + ((FRONT_BOT_Y - FRONT_TOP_Y) * f) / FLOORS;
    const yBack = yFront + DEPTH * (VP.y - yFront);
    floorLines.push(
      <path
        key={`fl-${f}`}
        d={`M${FRONT_X} ${yFront} L${BACK_X} ${yBack}`}
        strokeWidth={f === 0 || f === FLOORS ? 0.7 : 0.35}
        opacity={f === 0 || f === FLOORS ? 0.85 : 0.55}
      />
    );
  }

  // mullion lines (verticals on the receding facade)
  const mullionLines = [];
  for (let c = 0; c <= COLS; c++) {
    const t01 = c / COLS;
    const x = FRONT_X + t01 * (BACK_X - FRONT_X);
    const yT = FRONT_TOP_Y + t01 * (BACK_TOP_Y - FRONT_TOP_Y);
    const yB = FRONT_BOT_Y + t01 * (BACK_BOT_Y - FRONT_BOT_Y);
    mullionLines.push(
      <path
        key={`m-${c}`}
        d={`M${x} ${yT} L${x} ${yB}`}
        strokeWidth={c === 0 || c === COLS ? 0.85 : 0.32}
        opacity={c === 0 || c === COLS ? 0.9 : 0.55}
      />
    );
  }

  // sub-divisions — every 3rd floor a slightly stronger band (mid-rail)
  const accentBands = [];
  for (let f = 3; f < FLOORS; f += 3) {
    const yFront = FRONT_TOP_Y + ((FRONT_BOT_Y - FRONT_TOP_Y) * f) / FLOORS;
    const yBack = yFront + DEPTH * (VP.y - yFront);
    accentBands.push(
      <path key={`ac-${f}`} d={`M${FRONT_X} ${yFront} L${BACK_X} ${yBack}`} strokeWidth={0.55} opacity={0.7} />
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-white">
      <svg
        viewBox="0 0 640 260"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full text-bs-mitternacht"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* very subtle horizon line at VP height */}
        <path d={`M0 ${VP.y} L640 ${VP.y}`} strokeWidth="0.25" opacity="0.12" strokeDasharray="1 3" />

        {/* second building hint in the deep distance — light ghost */}
        <g opacity="0.25" strokeWidth="0.4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const xS = 470 + i * 14;
            const xE = 480 + i * 14;
            const yS = 60 + i * 4;
            const yE = 130 - i * 2;
            return <path key={`bg-${i}`} d={`M${xS} ${yS} L${xE} ${yE}`} />;
          })}
        </g>

        {/* main facade — receding curtain wall */}
        <g>
          {floorLines}
          {accentBands}
          {mullionLines}
        </g>

        {/* outer frame double-stroke for hand-drawn feel */}
        <g opacity="0.35" strokeWidth="0.4">
          <path
            d={`M${FRONT_X + 0.7} ${FRONT_TOP_Y - 0.4} L${BACK_X + 0.4} ${BACK_TOP_Y - 0.4}`}
          />
          <path
            d={`M${FRONT_X + 0.7} ${FRONT_BOT_Y + 0.4} L${BACK_X + 0.4} ${BACK_BOT_Y + 0.4}`}
          />
          <path
            d={`M${FRONT_X - 0.5} ${FRONT_TOP_Y} L${FRONT_X - 0.5} ${FRONT_BOT_Y}`}
          />
        </g>

        {/* subtle ground line in front */}
        <g strokeWidth="0.3" opacity="0.35">
          <path d={`M0 ${FRONT_BOT_Y + 6} L640 ${FRONT_BOT_Y - 24}`} strokeDasharray="1 4" />
        </g>

        {/* tiny figure for scale at the base */}
        <g opacity="0.55" strokeWidth="0.5">
          <circle cx="40" cy="244" r="1.6" />
          <path d="M40 246 L40 252" />
          <path d="M38 248 L42 248" strokeWidth="0.35" />
          <path d="M40 252 L38 256 M40 252 L42 256" strokeWidth="0.35" />
        </g>
      </svg>

      {/* caption — centered, like BILD FOLGT */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={`${labelCls} bg-white/85 backdrop-blur-sm text-bs-mitternacht/80 font-light uppercase rounded-full shadow-sm border border-bs-grau/60`}
        >
          {t("imageComingSoon")}
        </span>
      </div>
    </div>
  );
}
