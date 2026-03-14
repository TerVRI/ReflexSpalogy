import type { BodySystem } from "../data/systems";

interface SystemPickerProps {
  systems: BodySystem[];
  activeSystems: Set<string>;
  onToggle: (id: string) => void;
  onSelectOnly: (id: string) => void;
  onSelectAll: () => void;
}

export function SystemPicker({ systems, activeSystems, onToggle, onSelectOnly, onSelectAll }: SystemPickerProps) {
  const allActive = activeSystems.size === systems.length;

  return (
    <aside className="system-picker">
      <div className="system-picker__header">
        <h2>Body Systems</h2>
        <button
          className="btn-text-sm"
          onClick={onSelectAll}
          title="Show all systems"
        >
          {allActive ? "Showing All" : "Show All"}
        </button>
      </div>

      <div className="system-list">
        {systems.map((system) => {
          const isActive = activeSystems.has(system.id);
          return (
            <div
              key={system.id}
              className={`system-card ${isActive ? "system-card--active" : "system-card--inactive"}`}
              style={
                {
                  "--system-color": system.color,
                  "--system-glow": system.glowColor,
                } as React.CSSProperties
              }
              onClick={() => onToggle(system.id)}
              onDoubleClick={() => onSelectOnly(system.id)}
              title={`Click to toggle • Double-click to isolate`}
            >
              <span className="system-card__icon">{system.icon}</span>
              <div className="system-card__info">
                <span className="system-card__name">{system.shortName}</span>
              </div>
              <div
                className={`system-card__dot ${isActive ? "system-card__dot--on" : ""}`}
              />
            </div>
          );
        })}
      </div>

      <p className="system-hint">Click to toggle · Double-click to isolate</p>
    </aside>
  );
}
