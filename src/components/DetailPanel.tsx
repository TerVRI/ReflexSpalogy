import type { ReflexPoint } from "../data/points";
import { BODY_SYSTEMS, SYSTEM_MAP } from "../data/systems";
import { AudioPlayer } from "./AudioPlayer";
import type { useAudio } from "../hooks/useAudio";

interface DetailPanelProps {
  point: ReflexPoint;
  onClose: () => void;
  audio: ReturnType<typeof useAudio>;
  exploredPoints: Set<string>;
  totalPoints: number;
}

export function DetailPanel({ point, onClose, audio, exploredPoints, totalPoints }: DetailPanelProps) {
  const systems = point.systemIds.map((id) => SYSTEM_MAP[id]).filter(Boolean);
  const primarySystem = systems[0];

  return (
    <div
      className="detail-panel"
      style={{ "--accent": primarySystem?.color || "#666" } as React.CSSProperties}
    >
      {/* Header */}
      <div className="detail-panel__header" style={{ background: primarySystem?.color }}>
        <div className="detail-panel__header-meta">
          {systems.map((sys) => (
            <span key={sys.id} className="detail-system-badge">
              {sys.icon} {sys.name}
            </span>
          ))}
        </div>
        <button className="detail-close-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="detail-panel__body">
        <h2 className="detail-panel__title">{point.name}</h2>
        <p className="detail-panel__role">{point.biology.role}</p>

        {/* Audio */}
        <AudioPlayer audio={audio} script={point.audioScript} label="Hear this explained" />

        {/* Detail */}
        <section className="detail-section">
          <h3>What it does</h3>
          <p>{point.biology.detail}</p>
        </section>

        {/* Chemicals / Hormones */}
        {(point.biology.chemicals || point.biology.hormones) && (
          <section className="detail-section">
            <h3>{point.biology.hormones ? "Key Hormones" : "Key Chemicals"}</h3>
            <div className="chemical-grid">
              {[...(point.biology.chemicals || []), ...(point.biology.hormones || [])].map((c) => (
                <span key={c} className="chemical-pill" style={{ borderColor: primarySystem?.color }}>
                  {c}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Systems */}
        <section className="detail-section">
          <h3>System{systems.length > 1 ? "s" : ""} involved</h3>
          {systems.map((sys) => (
            <div key={sys.id} className="system-overview-card" style={{ borderColor: sys.color }}>
              <div className="system-overview-card__icon">{sys.icon}</div>
              <div>
                <strong>{sys.name}</strong>
                <p>{sys.overview.split(".")[0]}.</p>
              </div>
            </div>
          ))}
        </section>

        {/* Reflexology note */}
        <section className="detail-section detail-section--reflex">
          <h3>
            <span>👣</span> Reflexology Connection
          </h3>
          <p>{SYSTEM_MAP[point.systemIds[0]]?.reflexologyNote}</p>
        </section>

        {/* Progress */}
        <div className="detail-progress">
          <div className="detail-progress__bar">
            <div
              className="detail-progress__fill"
              style={{
                width: `${(exploredPoints.size / totalPoints) * 100}%`,
                background: primarySystem?.color,
              }}
            />
          </div>
          <p className="detail-progress__label">
            {exploredPoints.size} / {totalPoints} points explored
          </p>
        </div>
      </div>

      {/* System Key */}
      <div className="detail-panel__system-key">
        {BODY_SYSTEMS.map((sys) => (
          <div key={sys.id} className="key-item" title={sys.name}>
            <span className="key-dot" style={{ background: sys.color }} />
            <span>{sys.icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
