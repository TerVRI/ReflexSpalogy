import { BODY_SYSTEMS } from "./data/systems";
import { REFLEX_POINTS } from "./data/points";
import { useBodyInteraction } from "./hooks/useBodyInteraction";
import { useAudio } from "./hooks/useAudio";
import { SystemPicker } from "./components/SystemPicker";
import { CenterViewer } from "./components/CenterViewer";
import { DetailPanel } from "./components/DetailPanel";
import { QuizMode } from "./components/QuizMode";
import "./styles/main.css";

export default function App() {
  const interaction = useBodyInteraction(BODY_SYSTEMS);
  const audio = useAudio();

  const opacitySlider = (
    <div className="opacity-slider-wrap">
      <label>
        <span>Layer opacity</span>
        <input
          type="range"
          min="0.2"
          max="1"
          step="0.05"
          value={interaction.layerOpacity}
          onChange={(e) => interaction.setLayerOpacity(parseFloat(e.target.value))}
        />
      </label>
    </div>
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__logo">👣</span>
          <div>
            <h1>ReflexSpalogy</h1>
            <p>Interactive Physiology Explorer</p>
          </div>
        </div>
        <div className="app-header__actions">
          <div className="explored-badge" title="Points explored">
            <span>{interaction.exploredPoints.size}</span>
            <small>/ {REFLEX_POINTS.length} explored</small>
          </div>
          <button
            className={`btn-quiz ${interaction.quizMode ? "btn-quiz--active" : ""}`}
            onClick={interaction.toggleQuizMode}
          >
            {interaction.quizMode ? "← Back to Explorer" : "🧠 Quiz Mode"}
          </button>
        </div>
      </header>

      <main className="app-main">
        {interaction.quizMode ? (
          <QuizMode
            points={REFLEX_POINTS}
            activeSystems={interaction.activeSystems}
            onExit={interaction.toggleQuizMode}
          />
        ) : (
          <>
            <SystemPicker
              systems={BODY_SYSTEMS}
              activeSystems={interaction.activeSystems}
              onToggle={interaction.toggleSystem}
              onSelectOnly={interaction.selectOnlySystem}
              onSelectAll={interaction.selectAllSystems}
            />

            <CenterViewer
              activeSystems={interaction.activeSystems}
              layerOpacity={interaction.layerOpacity}
              viewMode={interaction.viewMode}
              onSetViewMode={interaction.setViewMode}
              onHoverPoint={interaction.hoverPoint}
              onSelectPoint={interaction.selectPoint}
              hoveredPoint={interaction.hoveredPoint}
              hoverPosition={interaction.hoverPosition}
              exploredPoints={interaction.exploredPoints}
              layerOpacitySlider={opacitySlider}
            />

            <div className="right-panel">
              {interaction.selectedPoint ? (
                <DetailPanel
                  point={interaction.selectedPoint}
                  onClose={interaction.closePanel}
                  audio={audio}
                  exploredPoints={interaction.exploredPoints}
                  totalPoints={REFLEX_POINTS.length}
                />
              ) : (
                <SystemOverview
                  systems={BODY_SYSTEMS}
                  activeSystems={interaction.activeSystems}
                  onSelect={interaction.selectOnlySystem}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function SystemOverview({
  systems,
  activeSystems,
  onSelect,
}: {
  systems: typeof BODY_SYSTEMS;
  activeSystems: Set<string>;
  onSelect: (id: string) => void;
}) {
  const active = systems.filter((s) => activeSystems.has(s.id));
  return (
    <div className="system-overview">
      <h2 className="system-overview__title">
        {active.length === systems.length
          ? "All Systems Active"
          : `${active.length} System${active.length !== 1 ? "s" : ""} Active`}
      </h2>
      <p className="system-overview__subtitle">
        Click a point on the body to explore its anatomy, biology, and reflexology connection.
      </p>
      <div className="system-overview__cards">
        {active.map((sys) => (
          <div
            key={sys.id}
            className="overview-card"
            style={{ "--sys-color": sys.color, "--sys-glow": sys.glowColor } as React.CSSProperties}
            onClick={() => onSelect(sys.id)}
          >
            <div className="overview-card__top">
              <span className="overview-card__icon">{sys.icon}</span>
              <h3>{sys.name}</h3>
            </div>
            <p>{sys.description}</p>
            <div className="overview-card__chemicals">
              {sys.keyChemicals.slice(0, 3).map((c) => (
                <span key={c} className="chemical-tag chemical-tag--sm">{c}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="system-overview__hint">👆 Click a card to isolate that system</div>
    </div>
  );
}
