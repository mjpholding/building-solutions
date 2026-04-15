"use client";

import { useTranslations } from "next-intl";

/**
 * Worm's-eye view: vertical edges converge toward a vanishing point
 * above the canvas. Architectural concept-sketch in a single ink stroke.
 */
const VP = { x: 200, y: -260 };
const BASE_Y = 250;

function projX(xBase: number, targetY: number) {
  const t = (BASE_Y - targetY) / (BASE_Y - VP.y);
  return xBase + t * (VP.x - xBase);
}

interface Building {
  baseL: number;
  baseR: number;
  topY: number;
  floors: number;
  cols: number;
  podiumH?: number;
  entranceW?: number;
}

const A: Building = { baseL: 18, baseR: 158, topY: 35, floors: 12, cols: 5, podiumH: 28, entranceW: 22 };
const B: Building = { baseL: 168, baseR: 282, topY: -40, floors: 22, cols: 6, podiumH: 22 };
const C: Building = { baseL: 292, baseR: 392, topY: 80, floors: 8, cols: 4, podiumH: 26, entranceW: 26 };

const SKYBRIDGE_Y_TOP = 110;
const SKYBRIDGE_Y_BOT = 132;

function buildingPaths(b: Building, key: string) {
  const elements: React.ReactElement[] = [];
  // outer frame
  const tlX = projX(b.baseL, b.topY);
  const trX = projX(b.baseR, b.topY);
  elements.push(
    <path
      key={`${key}-frame`}
      d={`M${b.baseL} ${BASE_Y} L${tlX} ${b.topY} L${trX} ${b.topY} L${b.baseR} ${BASE_Y}`}
      strokeWidth="0.95"
    />
  );
  elements.push(
    <path
      key={`${key}-roof`}
      d={`M${tlX - 2} ${b.topY} L${trX + 2} ${b.topY} L${trX + 2} ${b.topY - 4} L${tlX - 2} ${b.topY - 4} Z`}
      strokeWidth="0.7"
    />
  );

  // floor slabs (horizontal)
  for (let i = 1; i < b.floors; i++) {
    const y = BASE_Y + ((b.topY - BASE_Y) * i) / b.floors;
    const xL = projX(b.baseL, y);
    const xR = projX(b.baseR, y);
    elements.push(
      <path key={`${key}-f${i}`} d={`M${xL} ${y} L${xR} ${y}`} strokeWidth="0.4" opacity="0.55" />
    );
  }

  // vertical mullions converging to VP
  for (let c = 1; c < b.cols; c++) {
    const xBase = b.baseL + ((b.baseR - b.baseL) * c) / b.cols;
    const xTop = projX(xBase, b.topY);
    elements.push(
      <path
        key={`${key}-m${c}`}
        d={`M${xBase} ${BASE_Y} L${xTop} ${b.topY}`}
        strokeWidth="0.4"
        opacity="0.7"
      />
    );
  }

  // podium / lobby band
  if (b.podiumH) {
    const yP = BASE_Y - b.podiumH;
    const xL = projX(b.baseL, yP);
    const xR = projX(b.baseR, yP);
    elements.push(
      <path key={`${key}-podium`} d={`M${xL} ${yP} L${xR} ${yP}`} strokeWidth="0.7" />
    );
  }

  // entrance
  if (b.entranceW) {
    const cx = (b.baseL + b.baseR) / 2;
    const eL = cx - b.entranceW / 2;
    const eR = cx + b.entranceW / 2;
    const eTop = BASE_Y - 18;
    elements.push(
      <path
        key={`${key}-ent`}
        d={`M${eL} ${BASE_Y} L${eL} ${eTop} L${eR} ${eTop} L${eR} ${BASE_Y}`}
        strokeWidth="0.65"
      />
    );
    elements.push(
      <path key={`${key}-ent-mid`} d={`M${cx} ${BASE_Y} L${cx} ${eTop}`} strokeWidth="0.5" opacity="0.7" />
    );
  }

  return elements;
}

export default function ReferencePlaceholder({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const t = useTranslations("references");

  const labelCls =
    size === "lg"
      ? "text-base px-5 py-2"
      : size === "sm"
        ? "text-[11px] px-3 py-1.5"
        : "text-sm px-4 py-1.5";

  // skybridge between B and C
  const sbB_topX = projX(B.baseR, SKYBRIDGE_Y_TOP);
  const sbB_botX = projX(B.baseR, SKYBRIDGE_Y_BOT);
  const sbC_topX = projX(C.baseL, SKYBRIDGE_Y_TOP);
  const sbC_botX = projX(C.baseL, SKYBRIDGE_Y_BOT);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-bs-hellgrau via-white to-bs-grau">
      <svg
        viewBox="0 0 400 250"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full text-bs-mitternacht/55"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* sky — drifting cloud strokes */}
        <g opacity="0.25" strokeWidth="0.5">
          <path d="M30 30 Q50 26 70 30 T110 30" />
          <path d="M260 18 Q290 14 320 18 T380 18" />
          <path d="M150 60 Q175 56 200 60" />
        </g>

        {/* background skyline silhouette (deeper pencil pressure) */}
        <g opacity="0.18" strokeWidth="0.6">
          <path d="M0 175 L0 130 L40 130 L40 110 L80 110 L80 145 L120 145 L120 100 L150 100 L150 175 Z" />
          <path d="M250 175 L250 90 L290 90 L290 70 L330 70 L330 95 L360 95 L360 60 L400 60 L400 175 Z" />
        </g>

        {/* main buildings (back to front for z-order) */}
        <g>
          {buildingPaths(B, "B")}
          {buildingPaths(A, "A")}
          {buildingPaths(C, "C")}
        </g>

        {/* center tower mast / antenna */}
        <g strokeWidth="0.6">
          <path d={`M${projX(217, B.topY)} ${B.topY} L${projX(217, B.topY)} ${B.topY - 18}`} />
          <path d={`M${projX(232, B.topY)} ${B.topY} L${projX(232, B.topY)} ${B.topY - 12}`} />
          <path d={`M${projX(217, B.topY) - 4} ${B.topY - 14} L${projX(217, B.topY) + 4} ${B.topY - 14}`} opacity="0.7" />
        </g>

        {/* SKYBRIDGE between B and C */}
        <g strokeWidth="0.85">
          <path
            d={`M${sbB_topX} ${SKYBRIDGE_Y_TOP} L${sbC_topX} ${SKYBRIDGE_Y_TOP} L${sbC_botX} ${SKYBRIDGE_Y_BOT} L${sbB_botX} ${SKYBRIDGE_Y_BOT} Z`}
          />
          {/* glass mullions in skybridge */}
          {[0.25, 0.5, 0.75].map((p, i) => {
            const xT = sbB_topX + (sbC_topX - sbB_topX) * p;
            const xB = sbB_botX + (sbC_botX - sbB_botX) * p;
            return <path key={i} d={`M${xT} ${SKYBRIDGE_Y_TOP} L${xB} ${SKYBRIDGE_Y_BOT}`} strokeWidth="0.4" opacity="0.7" />;
          })}
          {/* mid horizontal band */}
          {(() => {
            const yMid = (SKYBRIDGE_Y_TOP + SKYBRIDGE_Y_BOT) / 2;
            const xL = sbB_topX + (sbB_botX - sbB_topX) * 0.5;
            const xR = sbC_topX + (sbC_botX - sbC_topX) * 0.5;
            return <path d={`M${xL} ${yMid} L${xR} ${yMid}`} strokeWidth="0.4" opacity="0.6" />;
          })()}
        </g>

        {/* pavement & curb */}
        <g strokeWidth="0.5">
          <path d={`M0 ${BASE_Y} L400 ${BASE_Y}`} />
          <path d="M0 246 L400 246" opacity="0.4" strokeDasharray="3 4" />
        </g>

        {/* lamp post + tiny human looking up — for scale */}
        <g strokeWidth="0.55" opacity="0.7">
          {/* lamp post */}
          <path d="M222 250 L222 222" />
          <path d="M222 222 L232 222" />
          <circle cx="232" cy="223" r="1.4" strokeWidth="0.4" />
          {/* human silhouette */}
          <circle cx="240" cy="240" r="1.6" />
          <path d="M240 242 L240 247" />
          <path d="M238 244 L242 244" strokeWidth="0.4" />
          <path d="M240 247 L238 250 M240 247 L242 250" strokeWidth="0.4" />
          {/* gaze direction */}
          <path d="M241 239 L248 232" strokeWidth="0.3" opacity="0.5" strokeDasharray="1 1.5" />
        </g>

        {/* sketchy double-stroke on key edges (hand-drawn vibe) */}
        <g opacity="0.28" strokeWidth="0.5">
          <path
            d={`M${A.baseL + 0.6} ${BASE_Y} L${projX(A.baseL, A.topY) + 0.6} ${A.topY}`}
          />
          <path
            d={`M${B.baseL + 0.6} ${BASE_Y} L${projX(B.baseL, B.topY) + 0.6} ${B.topY}`}
          />
          <path
            d={`M${C.baseR - 0.6} ${BASE_Y} L${projX(C.baseR, C.topY) - 0.6} ${C.topY}`}
          />
        </g>
      </svg>

      {/* caption chip */}
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
