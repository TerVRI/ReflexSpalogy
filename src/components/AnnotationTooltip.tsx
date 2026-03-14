import type { ReflexPoint } from "../data/points";
import { SYSTEM_MAP } from "../data/systems";

interface AnnotationTooltipProps {
  point: ReflexPoint;
  position: { x: number; y: number };
}

export function AnnotationTooltip({ point, position }: AnnotationTooltipProps) {
  const primarySystem = SYSTEM_MAP[point.systemIds[0]];

  const style: React.CSSProperties = {
    left: `${Math.min(position.x + 14, 75)}%`,
    top: `${Math.max(position.y - 10, 5)}%`,
    borderColor: primarySystem?.color || "#666",
  };

  return (
    <div className="tooltip" style={style}>
      <div className="tooltip__system-tag" style={{ background: primarySystem?.color || "#666" }}>
        {primarySystem?.icon} {primarySystem?.shortName}
      </div>
      <h3 className="tooltip__name">{point.name}</h3>
      <p className="tooltip__role">{point.biology.role}</p>
      {(point.biology.chemicals || point.biology.hormones) && (
        <div className="tooltip__chemicals">
          {[...(point.biology.chemicals || []), ...(point.biology.hormones || [])].slice(0, 3).map((c) => (
            <span key={c} className="chemical-tag">
              {c}
            </span>
          ))}
        </div>
      )}
      <p className="tooltip__cta">Click for full detail →</p>
    </div>
  );
}
