import { useRef, useState } from "react";
import type { ReflexPoint } from "../data/points";
import { REFLEX_POINTS } from "../data/points";
import { BODY_SYSTEMS, SYSTEM_MAP } from "../data/systems";
import { AnnotationTooltip } from "./AnnotationTooltip";

interface BodyViewer2DProps {
  activeSystems: Set<string>;
  layerOpacity: number;
  onHoverPoint: (point: ReflexPoint | null, pos?: { x: number; y: number }) => void;
  onSelectPoint: (point: ReflexPoint) => void;
  hoveredPoint: ReflexPoint | null;
  hoverPosition: { x: number; y: number } | null;
  exploredPoints: Set<string>;
}

export function BodyViewer2D({
  activeSystems,
  layerOpacity,
  onHoverPoint,
  onSelectPoint,
  hoveredPoint,
  hoverPosition,
  exploredPoints,
}: BodyViewer2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotated, setRotated] = useState(false);

  const visiblePoints = REFLEX_POINTS.filter((p) =>
    p.systemIds.some((id) => activeSystems.has(id))
  );

  const handleMouseEnter = (point: ReflexPoint, e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onHoverPoint(point, { x, y });
  };

  const getPointColor = (point: ReflexPoint): string => {
    const primaryId = point.systemIds.find((id) => activeSystems.has(id));
    return SYSTEM_MAP[primaryId || point.systemIds[0]]?.color || "#888";
  };

  const getPointGlow = (point: ReflexPoint): string => {
    const primaryId = point.systemIds.find((id) => activeSystems.has(id));
    return SYSTEM_MAP[primaryId || point.systemIds[0]]?.glowColor || "#aaa";
  };

  const layerColors = BODY_SYSTEMS.filter((s) => activeSystems.has(s.id)).map((s) => s.color);

  // Jitter-free: do NOT use CSS transform on the <g>. All hover state is handled
  // by changing the circle's `r` attribute directly via React props.
  return (
    <div className="body-viewer body-viewer--2d" ref={containerRef}>
      <div className="body-viewer__controls">
        <button
          className={`view-toggle ${rotated ? "view-toggle--active" : ""}`}
          onClick={() => setRotated((r) => !r)}
          title="Flip front/back"
        >
          {rotated ? "👁 Front" : "↩ Back"}
        </button>
        <div className="layer-opacity">
          <span>Layers</span>
          <div className="opacity-dots">
            {BODY_SYSTEMS.filter((s) => activeSystems.has(s.id)).map((s) => (
              <span key={s.id} className="opacity-dot" style={{ background: s.color }} title={s.name} />
            ))}
          </div>
        </div>
      </div>

      <div
        className={`body-svg-wrapper ${rotated ? "body-svg-wrapper--rotated" : ""}`}
        style={{ opacity: layerOpacity }}
      >
        <svg
          viewBox="0 0 200 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="body-svg"
          aria-label="Human body diagram"
        >
          <defs>
            <linearGradient id="systemGradient2d" x1="0" y1="0" x2="0" y2="1">
              {layerColors.length > 0
                ? layerColors.map((c, i) => (
                    <stop key={i} offset={`${(i / Math.max(layerColors.length - 1, 1)) * 100}%`} stopColor={c} stopOpacity="0.18" />
                  ))
                : <stop offset="0%" stopColor="#8884" />}
            </linearGradient>
            <filter id="glow2d">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="ptGlow2d">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Gradient for body fill — dark bottom, slightly lighter top */}
            <linearGradient id="bodyFill2d" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a3a5a" />
              <stop offset="100%" stopColor="#1c2840" />
            </linearGradient>
          </defs>

          {/* ── Body Silhouette ─────────────────────────────────── */}
          <g className="body-silhouette">
            {/* Head */}
            <ellipse cx="100" cy="32" rx="26" ry="30" fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.8" />
            {/* Neck */}
            <rect x="89" y="58" width="22" height="18" rx="4" fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />
            {/* Torso */}
            <path d="M62 76 Q58 100 56 140 Q55 180 58 220 Q60 240 62 250 L138 250 Q140 240 142 220 Q145 180 144 140 Q142 100 138 76 Q120 70 100 70 Q80 70 62 76Z"
              fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.8" />
            {/* Pelvis */}
            <path d="M62 250 Q55 265 54 280 Q58 295 100 300 Q142 295 146 280 Q145 265 138 250Z"
              fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />
            {/* Left arm */}
            <path d="M62 80 Q42 90 36 110 Q30 140 28 170 Q26 195 28 210 Q32 225 38 230 Q44 226 46 210 Q48 195 46 175 Q44 150 46 125 Q50 108 56 96Z"
              fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />
            {/* Left forearm */}
            <path d="M38 230 Q34 250 32 270 Q30 290 32 305 Q36 318 40 320 Q44 316 46 305 Q48 290 46 268 Q44 250 46 234Z"
              fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />
            {/* Left hand */}
            <ellipse cx="38" cy="332" rx="10" ry="14" fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />
            {/* Right arm */}
            <path d="M138 80 Q158 90 164 110 Q170 140 172 170 Q174 195 172 210 Q168 225 162 230 Q156 226 154 210 Q152 195 154 175 Q156 150 154 125 Q150 108 144 96Z"
              fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />
            {/* Right forearm */}
            <path d="M162 230 Q166 250 168 270 Q170 290 168 305 Q164 318 160 320 Q156 316 154 305 Q152 290 154 268 Q156 250 154 234Z"
              fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />
            {/* Right hand */}
            <ellipse cx="162" cy="332" rx="10" ry="14" fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />
            {/* Left upper leg */}
            <path d="M62 295 Q58 310 58 340 Q57 370 58 400 Q60 420 64 435 Q72 440 80 438 Q84 420 84 395 Q84 365 82 340 Q80 310 78 295Z"
              fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />
            {/* Left lower leg */}
            <path d="M64 435 Q62 455 62 480 Q62 495 64 505 Q68 514 74 515 Q80 512 82 505 Q84 495 84 480 Q84 455 82 438Z"
              fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />
            {/* Left foot */}
            <path d="M62 508 Q60 515 62 518 Q68 520 82 518 Q88 516 88 513 Q86 510 82 508Z"
              fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />
            {/* Right upper leg */}
            <path d="M138 295 Q142 310 142 340 Q143 370 142 400 Q140 420 136 435 Q128 440 120 438 Q116 420 116 395 Q116 365 118 340 Q120 310 122 295Z"
              fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />
            {/* Right lower leg */}
            <path d="M136 435 Q138 455 138 480 Q138 495 136 505 Q132 514 126 515 Q120 512 118 505 Q116 495 116 480 Q116 455 118 438Z"
              fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />
            {/* Right foot */}
            <path d="M138 508 Q140 515 138 518 Q132 520 118 518 Q112 516 112 513 Q114 510 118 508Z"
              fill="url(#bodyFill2d)" stroke="#5b82b8" strokeWidth="1.5" />

            {/* System colour overlay on torso */}
            <path d="M62 76 Q58 100 56 140 Q55 180 58 220 Q60 240 62 250 L138 250 Q140 240 142 220 Q145 180 144 140 Q142 100 138 76 Q120 70 100 70 Q80 70 62 76Z"
              fill="url(#systemGradient2d)" />

            {/* Face details */}
            <ellipse cx="91" cy="30" rx="4" ry="5" fill="#1a2540" stroke="#6a96c8" strokeWidth="0.8" />
            <ellipse cx="109" cy="30" rx="4" ry="5" fill="#1a2540" stroke="#6a96c8" strokeWidth="0.8" />
            <path d="M93 44 Q100 49 107 44" stroke="#6a96c8" strokeWidth="1.2" fill="none" strokeLinecap="round" />

            {/* System anatomical hints */}
            {activeSystems.has("skeletal") && (
              <g opacity="0.5" stroke={SYSTEM_MAP["skeletal"]?.color} strokeWidth="0.9" fill="none">
                <path d="M76 95 Q68 110 70 130" /><path d="M80 95 Q74 112 76 134" />
                <path d="M84 93 Q80 112 82 135" /><path d="M124 95 Q132 110 130 130" />
                <path d="M120 95 Q126 112 124 134" /><path d="M116 93 Q120 112 118 135" />
                <path d="M70 130 Q100 136 130 130" /><path d="M76 134 Q100 140 124 134" />
                <path d="M100 92 L100 250" strokeDasharray="3,3" />
              </g>
            )}
            {activeSystems.has("cardiovascular") && (
              <g opacity="0.6" filter="url(#glow2d)">
                <path d="M91 115 Q88 108 83 110 Q76 112 76 120 Q76 128 91 138 Q106 128 106 120 Q106 112 99 110 Q94 108 91 115Z"
                  fill={SYSTEM_MAP["cardiovascular"]?.color} opacity="0.7" />
              </g>
            )}
            {activeSystems.has("respiratory") && (
              <g opacity="0.4">
                <ellipse cx="84" cy="130" rx="14" ry="28" fill={SYSTEM_MAP["respiratory"]?.color} />
                <ellipse cx="116" cy="130" rx="14" ry="28" fill={SYSTEM_MAP["respiratory"]?.color} />
              </g>
            )}
            {activeSystems.has("digestive") && (
              <g opacity="0.35">
                <ellipse cx="96" cy="175" rx="16" ry="18" fill={SYSTEM_MAP["digestive"]?.color} />
                <path d="M80 195 Q75 210 78 230 Q90 240 100 238 Q112 240 122 230 Q125 210 120 195 Q108 205 100 203 Q92 205 80 195Z"
                  fill={SYSTEM_MAP["digestive"]?.color} />
              </g>
            )}
            {activeSystems.has("urinary") && (
              <g opacity="0.45">
                <ellipse cx="85" cy="205" rx="8" ry="12" fill={SYSTEM_MAP["urinary"]?.color} />
                <ellipse cx="115" cy="205" rx="8" ry="12" fill={SYSTEM_MAP["urinary"]?.color} />
              </g>
            )}
            {activeSystems.has("neuromuscular") && (
              <g opacity="0.5">
                <ellipse cx="100" cy="28" rx="20" ry="22" fill={SYSTEM_MAP["neuromuscular"]?.color} />
              </g>
            )}
            {activeSystems.has("endocrine") && (
              <g opacity="0.55">
                <path d="M92 68 Q88 72 88 76 Q90 80 96 80 Q100 80 104 80 Q110 80 112 76 Q112 72 108 68 Q104 64 100 64 Q96 64 92 68Z"
                  fill={SYSTEM_MAP["endocrine"]?.color} />
              </g>
            )}
            {activeSystems.has("lymphatic") && (
              <g opacity="0.35">
                {[{ cx: 76, cy: 88 }, { cx: 124, cy: 88 }, { cx: 68, cy: 180 }, { cx: 132, cy: 180 }, { cx: 80, cy: 275 }, { cx: 120, cy: 275 }]
                  .map(({ cx, cy }, i) => (<circle key={i} cx={cx} cy={cy} r="5" fill={SYSTEM_MAP["lymphatic"]?.color} />))}
                <path d="M76 88 L68 180 L80 275" stroke={SYSTEM_MAP["lymphatic"]?.color} strokeWidth="1.5" strokeDasharray="4,3" fill="none" opacity="0.6" />
                <path d="M124 88 L132 180 L120 275" stroke={SYSTEM_MAP["lymphatic"]?.color} strokeWidth="1.5" strokeDasharray="4,3" fill="none" opacity="0.6" />
                <path d="M68 180 Q100 190 132 180" stroke={SYSTEM_MAP["lymphatic"]?.color} strokeWidth="1" strokeDasharray="4,3" fill="none" opacity="0.6" />
              </g>
            )}
            {activeSystems.has("reproductive") && (
              <g opacity="0.4">
                <ellipse cx="88" cy="265" rx="9" ry="7" fill={SYSTEM_MAP["reproductive"]?.color} />
                <ellipse cx="112" cy="265" rx="9" ry="7" fill={SYSTEM_MAP["reproductive"]?.color} />
                <path d="M88 272 Q100 280 112 272" stroke={SYSTEM_MAP["reproductive"]?.color} strokeWidth="1.5" fill="none" />
              </g>
            )}
            {activeSystems.has("muscular") && (
              <g opacity="0.25" stroke={SYSTEM_MAP["muscular"]?.color} fill="none" strokeWidth="1.2">
                <path d="M70 80 Q65 100 66 130" /><path d="M130 80 Q135 100 134 130" />
                <path d="M66 130 Q64 160 66 190" /><path d="M134 130 Q136 160 134 190" />
                <path d="M62 300 Q59 340 62 380" /><path d="M78 300 Q80 340 78 380" />
                <path d="M122 300 Q120 340 122 380" /><path d="M138 300 Q141 340 138 380" />
              </g>
            )}
          </g>

          {/* ── Reflex Points ───────────────────────────────────── */}
          {visiblePoints.map((point) => {
            const px = (point.position2D.x / 100) * 200;
            const py = (point.position2D.y / 100) * 520;
            const isHovered = hoveredPoint?.id === point.id;
            const isExplored = exploredPoints.has(point.id);
            const color = getPointColor(point);
            const glow = getPointGlow(point);

            return (
              // No CSS transform or scale on the <g> — avoids jitter.
              // Hover state is reflected only via `r` attribute change on circles.
              <g
                key={point.id}
                transform={`translate(${px}, ${py})`}
                onMouseEnter={(e) => handleMouseEnter(point, e)}
                onMouseLeave={() => onHoverPoint(null)}
                onClick={() => onSelectPoint(point)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelectPoint(point)}
                tabIndex={0}
                role="button"
                aria-label={`${point.name} — ${point.biology.role}`}
                style={{ cursor: "pointer", outline: "none" }}
              >
                {isHovered && (
                  <circle r="20" fill={glow} opacity="0.15" className="point-pulse" />
                )}
                {isExplored && !isHovered && (
                  <circle r="10" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
                )}
                <circle
                  r={isHovered ? 9 : 6}
                  fill={color}
                  opacity={isHovered ? 1 : 0.88}
                  filter={isHovered ? "url(#ptGlow2d)" : undefined}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  style={{ transition: "r 0.12s ease" }}
                />
                <circle r="2.5" fill="#fff" opacity="0.9" />
                {isHovered && (
                  <text y="-16" textAnchor="middle" fill="#fff" fontSize="7.5" fontFamily="Outfit, system-ui, sans-serif" fontWeight="700">
                    {point.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredPoint && hoverPosition && (
        <AnnotationTooltip point={hoveredPoint} position={hoverPosition} />
      )}

      <div className="body-viewer__legend">
        <span className="legend-item"><span className="legend-dot legend-dot--white" /> Unexplored</span>
        <span className="legend-item"><span className="legend-dot legend-dot--ring" /> Explored</span>
      </div>
    </div>
  );
}
