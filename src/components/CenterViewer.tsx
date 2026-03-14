import type { ReflexPoint } from "../data/points";
import type { ViewMode } from "../hooks/useBodyInteraction";
import { BodyViewer3D } from "./BodyViewer3D";
import { BodyViewer2D } from "./BodyViewer2D";
import { BodyViewerRealistic } from "./BodyViewerRealistic";

interface CenterViewerProps {
  activeSystems: Set<string>;
  layerOpacity: number;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  onHoverPoint: (point: ReflexPoint | null, pos?: { x: number; y: number }) => void;
  onSelectPoint: (point: ReflexPoint) => void;
  hoveredPoint: ReflexPoint | null;
  hoverPosition: { x: number; y: number } | null;
  exploredPoints: Set<string>;
  layerOpacitySlider: React.ReactNode;
}

export function CenterViewer({
  activeSystems,
  layerOpacity,
  viewMode,
  onSetViewMode,
  onHoverPoint,
  onSelectPoint,
  hoveredPoint,
  hoverPosition,
  exploredPoints,
  layerOpacitySlider,
}: CenterViewerProps) {
  const sharedProps = {
    activeSystems,
    layerOpacity,
    onHoverPoint,
    onSelectPoint,
    hoveredPoint,
    hoverPosition,
    exploredPoints,
  };

  return (
    <div className="viewer-container">
      <div className="viewer-mode-toggle">
        <button
          className={`mode-btn ${viewMode === "2d" ? "mode-btn--active" : ""}`}
          onClick={() => onSetViewMode("2d")}
        >
          ⬜ 2D
        </button>
        <button
          className={`mode-btn ${viewMode === "3d" ? "mode-btn--active" : ""}`}
          onClick={() => onSetViewMode("3d")}
        >
          ◈ 3D
        </button>
        <button
          className={`mode-btn mode-btn--realistic ${viewMode === "realistic" ? "mode-btn--active" : ""}`}
          onClick={() => onSetViewMode("realistic")}
          title="High-detail model (~4 MB download)"
        >
          ✦ Realistic
        </button>
      </div>

      {viewMode === "realistic" ? (
        <BodyViewerRealistic {...sharedProps} />
      ) : viewMode === "3d" ? (
        <BodyViewer3D {...sharedProps} />
      ) : (
        <BodyViewer2D {...sharedProps} />
      )}

      {layerOpacitySlider}
    </div>
  );
}
