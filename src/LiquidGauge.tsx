import { useId, useEffect, useRef, useMemo, useState } from "react";
import type { VisualizationProps } from "@metabase/custom-viz";
import type { Settings } from "./types";

const PI = Math.PI;

function buildWave(
  cx: number, cy: number, R: number,
  lvl: number, amp: number, wl: number, offset: number
): string {
  let d = `M${cx - R - wl} ${lvl}`;
  for (let x = -R - wl; x <= R + wl; x += 4) {
    d += `L${(cx + x).toFixed(1)} ${(lvl + Math.sin((x + offset) / wl * PI) * amp).toFixed(1)}`;
  }
  return d + `L${cx + R + wl} ${cy + R}L${cx - R - wl} ${cy + R}Z`;
}

function colIdx(cols: { name: string }[], name: string): number {
  return cols.findIndex(c => c.name === name);
}

export function LiquidGauge({
  series, settings, width, height, colorScheme,
}: VisualizationProps<Settings>) {
  const cw = (width ?? 0) > 0 ? Math.floor(width ?? 0) : 0;
  const ch = (height ?? 0) > 0 ? Math.floor(height ?? 0) : 0;
  if (!cw || !ch) return null;

  const cols = (series?.[0]?.data?.cols ?? []) as { name: string; display_name?: string }[];
  const rows = (series?.[0]?.data?.rows ?? []) as unknown[][];

  const valueCol = settings.valueColumn ?? "";
  const vIdx = colIdx(cols, valueCol);

  const rawValue = vIdx >= 0 && rows.length > 0 ? Number(rows[0][vIdx]) : null;
  const min = settings.minValue ?? 0;
  const max = settings.maxValue ?? 100;

  const pct =
    rawValue === null || isNaN(rawValue) || max === min
      ? 0
      : Math.max(0, Math.min(1, (rawValue - min) / (max - min)));

  const isDark = colorScheme === "dark";
  const fillColor = isDark ? "#FF33BB" : "#5F016F";
  const bgFill    = isDark ? "#241830" : "#f3eef6";
  const textColor = isDark ? "#aaa"    : "#666";

  // Layout: circle centered, label below
  const LABEL_H = 28;
  const PAD     = 16;
  const R = Math.max(1, Math.min(cw / 2 - PAD, (ch - LABEL_H) / 2 - PAD));
  const cx = cw / 2;
  const cy = (ch - LABEL_H) / 2 + PAD / 2;

  const lvl = cy + R - 2 * R * pct;
  const amp = R * 0.09;
  const wl  = R * 0.54;

  const path1Ref  = useRef<SVGPathElement>(null);
  const path2Ref  = useRef<SVGPathElement>(null);
  const rafRef    = useRef<number>(0);
  const offsetRef = useRef(0);

  const prefersReduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // Restart animation when geometry changes
  useEffect(() => {
    const staticWave = () => {
      path1Ref.current?.setAttribute("d", buildWave(cx, cy, R, lvl, amp, wl, 0));
      path2Ref.current?.setAttribute("d", buildWave(cx, cy, R, lvl, amp, wl, wl * 0.6));
    };

    if (prefersReduced) {
      staticWave();
      return;
    }

    let alive = true;
    function frame() {
      if (!alive) return;
      offsetRef.current += 1.3;
      const o = offsetRef.current;
      path1Ref.current?.setAttribute("d", buildWave(cx, cy, R, lvl, amp, wl, o));
      path2Ref.current?.setAttribute("d", buildWave(cx, cy, R, lvl, amp, wl, o + wl * 0.6));
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [cx, cy, R, lvl, amp, wl, prefersReduced]);

  const uid = useId().replace(/:/g, "");
  const clipId = `lq-${uid}`;

  const [hovered, setHovered] = useState(false);

  const displayPct  = rawValue === null || isNaN(rawValue) ? "—" : `${Math.round(pct * 100)}%`;
  const displayExact = rawValue === null || isNaN(rawValue)
    ? "No data"
    : `${Number.isInteger(rawValue) ? rawValue : rawValue.toFixed(2)}`;
  const labelText = cols[vIdx]?.display_name ?? cols[vIdx]?.name ?? "";

  // Tooltip position: above the circle center
  const ttX = cx;
  const ttY = cy - R - 10;

  return (
    <div style={{ position: "relative", width: cw, height: ch }}>
      <svg
        width={cw}
        height={ch}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: "default", display: "block" }}
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>
        </defs>

        {/* Background circle */}
        <circle cx={cx} cy={cy} r={R} fill={bgFill} />

        {/* Liquid waves clipped to circle */}
        <g clipPath={`url(#${clipId})`}>
          <path ref={path2Ref} fill={fillColor} fillOpacity={0.4} />
          <path ref={path1Ref} fill={fillColor} fillOpacity={0.88} />
        </g>

        {/* Border ring */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={fillColor} strokeWidth={Math.max(2, R * 0.05)} />

        {/* Percentage text */}
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="central"
          fontFamily="inherit" fontWeight="700"
          fontSize={Math.max(14, R * 0.38)}
          fill="#fff"
          style={{ userSelect: "none" }}
        >
          {displayPct}
        </text>

        {/* Label below circle */}
        {labelText && (
          <text
            x={cx} y={cy + R + LABEL_H * 0.7}
            textAnchor="middle"
            fontSize={Math.max(10, Math.min(13, R * 0.16))}
            fill={textColor}
            style={{ userSelect: "none" }}
          >
            {labelText}
          </text>
        )}
      </svg>

      {/* Tooltip */}
      {hovered && rawValue !== null && (
        <div style={{
          position: "absolute",
          left: ttX,
          top:  ttY,
          transform: "translate(-50%, -100%)",
          background: isDark ? "#1a1a2e" : "#fff",
          color:      isDark ? "#eee"    : "#333",
          borderRadius: 6,
          padding: "6px 10px",
          fontSize: 12,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          borderLeft: `4px solid ${fillColor}`,
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
            {displayExact}
            {labelText && <span style={{ fontWeight: 400, marginLeft: 4, opacity: 0.7 }}>/ {max}</span>}
          </div>
          {labelText && <div style={{ opacity: 0.7 }}>{labelText}</div>}
        </div>
      )}
    </div>
  );
}
